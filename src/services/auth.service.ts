import argon2 from "argon2";
import ErrorCode from "@/constants/error-code";
import { BadRequestException, InternalException, NotFoundException, UnauthorizedException } from "../exceptions";
import * as jwt from "jsonwebtoken";
import { mailerService } from "@/services";
import { env, prisma } from "@/config";
import { OtpType } from "@prisma/client";
import { AppNameType } from "@/middlewares";
import { formatters } from "@/utils";
import { authSchema } from "@/schemas";

export const login = async (body: authSchema.LoginType, appName: AppNameType) => {
    // check if the user exists
    const user = await prisma.user.findUnique({
        where: { username: body.username },
    });
    if (!user) throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);

    // check if the password is correct
    const isPasswordValid = await argon2.verify(user.password, body.password);
    if (!isPasswordValid) throw new UnauthorizedException("Invalid Password", ErrorCode.INVALID_PASSWORD);

    // check if the email is verified
    if (!user.isVerified) {
        await mailerService.resendUserOtp(user, "EMAIL_VERIFICATION", appName);
        return {
            needVerification: true,
            email: user.email,
        };
    }

    // generate token
    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_ACCESS, { expiresIn: "1d" });
    return { data: { fullName: user.fullName, role: user.role }, token };
};

export const registerCustomer = async (body: authSchema.RegisterCustomerType) => {
    // check if the username or email is already taken
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username: body.username }, { email: body.email }] },
        select: { id: true },
    });
    if (existingUser)
        throw new BadRequestException("The username or email is already taken", ErrorCode.USER_ALREADY_EXISTS);

    // hash password and create user
    try {
        const hashPassword = await argon2.hash(body.password);
        const user = await prisma.user.create({
            data: {
                userCode: formatters.generateCode("user"),
                fullName: body.fullName,
                username: body.username,
                customerCategory: body.customerCategory,
                email: body.email,
                phoneNumber: body.phoneNumber,
                password: hashPassword,
                role: "CUSTOMER",
            },
        });

        // generate token and send verification email
        await mailerService.resendUserOtp(user, "EMAIL_VERIFICATION", "myflower");
    } catch (error) {
        throw new InternalException("Register user customer failed", ErrorCode.INTERNAL_EXCEPTION, error);
    }
};

export const resendOtp = async (email: string, type: OtpType, appName: "myrekap" | "myflower") => {
    // check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);

    // check if the email is already verified and type is email verification
    if (user.isVerified && type === "EMAIL_VERIFICATION")
        throw new BadRequestException("Email already verified", ErrorCode.EMAIL_ALREADY_VERIFIED);

    // check if the email is already verified and type is password reset
    if (!user.isVerified && type === "PASSWORD_RESET") {
        await mailerService.resendUserOtp(user, "EMAIL_VERIFICATION", appName);
        return {
            needVerification: true,
            email: user.email,
        };
    }

    await mailerService.resendUserOtp(user, type, appName);
};

export const verifyOtp = async (email: string, type: OtpType, code: string) => {
    // check if the user exists
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, isVerified: true, role: true, fullName: true },
    });
    if (!user) throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);

    // check if the otp is valid
    const userOtp = await prisma.userOtp.findFirst({
        where: { userId: user.id, type, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
    });
    if (!userOtp || userOtp.code !== code)
        throw new BadRequestException("Invalid or expired otp", ErrorCode.INVALID_TOKEN);

    return await prisma.$transaction(async (tx) => {
        // delete all otp for the user and type
        await tx.userOtp.deleteMany({ where: { userId: user.id, type } });

        // if type is email verification, update user to verified
        if (type === "EMAIL_VERIFICATION") {
            if (user.isVerified)
                throw new BadRequestException("Email already verified", ErrorCode.EMAIL_ALREADY_VERIFIED);
            await tx.user.update({ where: { id: user.id }, data: { isVerified: true } });
            const accessToken = jwt.sign({ id: user.id, role: user.role }, env.JWT_ACCESS, { expiresIn: "1d" });
            return { email, type, accessToken, user: { fullName: user.fullName, role: user.role } };
        }

        // if type is password reset, return a reset token
        if (type === "PASSWORD_RESET") {
            if (!user.isVerified) throw new BadRequestException("Email not verified", ErrorCode.EMAIL_NOT_VERIFIED);
            const resetToken = jwt.sign({ userId: user.id, type }, env.JWT_RESET_PASSWORD, { expiresIn: "10m" });
            return { email, type, resetToken };
        }
    });
};

export const resetPassword = async (token: string, password: string) => {
    // verify token
    const payload = jwt.verify(token, env.JWT_RESET_PASSWORD) as { userId: string; type: string };
    if (payload.type !== "PASSWORD_RESET") throw new BadRequestException("Invalid token type", ErrorCode.INVALID_TOKEN);

    // hash the new password
    const hashPassword = await argon2.hash(password);
    try {
        await prisma.user.update({ where: { id: payload.userId }, data: { password: hashPassword } });
    } catch (_error) {
        throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
    }
};
