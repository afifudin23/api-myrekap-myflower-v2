import { NextFunction, Request, Response } from "express";
import { authService } from "@/services";
import { authSchema } from "@/schemas";
import { BadRequestException } from "@/exceptions";
import ErrorCode from "@/constants/error-code";
import { AppNameType } from "@/middlewares";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const appName = (req.headers["x-app-name"] as string)?.toLowerCase() as AppNameType;
    if (!appName) throw new BadRequestException("Missing required header: x-app-name", ErrorCode.REQUIRED_APP_NAME);
    const body = authSchema.login.parse(req.body);
    try {
        const data = await authService.login(body, appName);
        if (data.needVerification)
            return res.status(200).json({ message: "Account not verified. OTP has been sent to your email.", data });
        res.cookie(`token_${appName}`, data.token, {
            httpOnly: true, // Tidak dapat diakses oleh JavaScript
            secure: false, // True = Hanya dikirim melalui HTTPS (penting untuk production)
            sameSite: "strict", // Tidak terkirim di request pihak ketiga
            maxAge: 60 * 60 * 24 * 1000,
            path: "/", // Hanya untuk path ini
        });
        res.status(200).json({ message: "Login successfully", data: data.data });
    } catch (error) {
        return next(error);
    }
};

export const verifyAuth = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({ message: "Verification successfully" });
    } catch (error) {
        return next(error);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    const appName = req.headers["x-app-name"];
    try {
        res.clearCookie(`token_${appName}`, {
            httpOnly: true,
            secure: true, // Pastikan secure diaktifkan jika menggunakan HTTPS
            sameSite: "strict",
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        return next(error);
    }
};

export const registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const body = authSchema.registerCustomer.parse(req.body);
    try {
        await authService.registerCustomer(body);
        res.status(201).json({ message: "Registration successful. Please verify your email using the OTP code sent" });
    } catch (error) {
        return next(error);
    }
};

export const resendUserOtp = async (req: Request, res: Response, next: NextFunction) => {
    const appName = (req.headers["x-app-name"] as string)?.toLowerCase() as AppNameType;
    if (!appName) throw new BadRequestException("Missing required header: x-app-name", ErrorCode.REQUIRED_APP_NAME);

    const { email, type } = authSchema.resendUserOtp.parse(req.body);
    try {
        const data = await authService.resendOtp(email, type, appName);
        if (data && data.needVerification)
            return res.status(200).json({ message: "Account not verified. OTP has been sent to your email", data });

        res.status(200).json({ message: "Resend user otp successfully" });
    } catch (error) {
        return next(error);
    }
};

export const verifyUserOtp = async (req: Request, res: Response, next: NextFunction) => {
    const { email, type, code } = authSchema.verifyUserOtp.parse(req.body);

    try {
        const data = await authService.verifyOtp(email, type, code);
        res.status(200).json({ message: "Verify user otp successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { password } = authSchema.resetPassword.parse(req.body);
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        throw new BadRequestException("Missing or invalid token", ErrorCode.INVALID_TOKEN);
    const token = authHeader.split(" ")[1];

    try {
        await authService.resetPassword(token, password);
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        return next(error);
    }
};
