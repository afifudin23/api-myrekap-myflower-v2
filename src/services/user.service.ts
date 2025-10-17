import argon2 from "argon2";
import ErrorCode from "@/constants/error-code";
import { BadRequestException, InternalException, NotFoundException, UnauthorizedException } from "@/exceptions";
import { prisma } from "@/config";
import { userSchema } from "@/schemas";
import { formatters } from "@/utils";

export const findAllAdmins = async () => {
    const user = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } });
    // supaya password tidak di tampilkan
    const data = user.map(({ password, ...data }) => data);
    return data;
};
export const findAllCustomers = async () => {
    const user = await prisma.user.findMany({ where: { role: "CUSTOMER" } });
    // supaya password tidak di tampilkan
    const data = user.map(({ password, ...data }) => data);
    return data;
};

export const create = async (body: userSchema.CreateType) => {
    const { username, email } = body;

    // check if the username or email is already taken
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
        select: { id: true },
    });
    if (existingUser)
        throw new BadRequestException("The username or email is already taken", ErrorCode.USER_ALREADY_EXISTS);

    // hash password and create user
    const hashPassword = await argon2.hash(body.password);
    const user = await prisma.user.create({
        data: {
            userCode: formatters.generateCode("user"),
            fullName: body.fullName,
            username,
            email,
            phoneNumber: body.phoneNumber,
            password: hashPassword,
            role: "ADMIN",
        },
    });

    const { password, ...data } = user;
    return data;
};

export const update = async (id: string, body: userSchema.UpdateType) => {
    const { fullName, username, email, phoneNumber } = body;

    // check if the user exists
    const findUser = await prisma.user.findUnique({ where: { id } });
    if (!findUser) throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);

    // check if the username or email is already taken
    const existingUser = await prisma.user.findFirst({
        where: { AND: { OR: [{ username }, { email }], NOT: { id } } },
        select: { id: true },
    });

    if (existingUser)
        throw new BadRequestException("The username or email is already taken", ErrorCode.USER_ALREADY_EXISTS);

    if (body.password) {
        const hashPassword = await argon2.hash(body.password);
        body.password = hashPassword;
        const user = await prisma.user.update({
            where: { id },
            data: {
                fullName,
                username,
                email,
                phoneNumber,
                password: hashPassword,
            },
        });
        const { password, ...data } = user;
        return data;
    }
    const user = await prisma.user.update({
        where: { id },
        data: {
            fullName,
            username,
            email,
            phoneNumber,
        },
    });
    return user;
};

export const updateProfile = async (userId: string, body: userSchema.UpdateProfileType) => {
    // validation user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);

    // check if update profile with change password
    const { oldPassword, newPassword, confPassword, ...bodyWithoutPassword } = body;
    if (oldPassword && newPassword && confPassword) {
        // check if the password is correct
        const isPasswordValid = await argon2.verify(user.password, oldPassword!);
        if (!isPasswordValid) throw new UnauthorizedException("Invalid Password", ErrorCode.INVALID_PASSWORD);

        const hashPassword = await argon2.hash(newPassword!);
        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    fullName: body.fullName,
                    username: body.username,
                    email: body.email,
                    phoneNumber: body.phoneNumber,
                    password: hashPassword,
                },
            });
            const { password, ...data } = updatedUser;
            return data;
        } catch (error) {
            throw new InternalException("Update profile failed", ErrorCode.INTERNAL_EXCEPTION, error);
        }
    }

    try {
        const userUpdated = await prisma.user.update({
            where: { id: userId },
            data: bodyWithoutPassword,
        });
        const { password, ...data } = userUpdated;
        return data;
    } catch (error) {
        throw new InternalException("Update profile failed", ErrorCode.INTERNAL_EXCEPTION, error);
    }
};

export const remove = async (id: string) => {
    // check if the user exists
    const findUser = await prisma.user.findFirst({
        where: {
            id,
        },
    });
    if (!findUser) {
        throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
    }
    const user = await prisma.user.delete({
        where: {
            id,
        },
    });
    const { password, ...data } = user;
    return data;
};
