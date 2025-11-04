import { NextFunction, Request, Response } from "express";
import { authService } from "@/services";
import { authSchema } from "@/schemas";
import { BadRequestException } from "@/exceptions";
import ErrorCode from "@/constants/error-code";
import { AppNameType } from "@/middlewares";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const appName = (req.headers["x-app-name"] as string)?.toLowerCase() as AppNameType;
    if (!appName || !["myrekap", "myflower"].includes(appName))
        throw new BadRequestException(
            "Invalid or missing header: x-app-name. Allowed values are 'myrekap' or 'myflower'.",
            ErrorCode.REQUIRED_APP_NAME
        );

    const body = authSchema.login.parse(req.body);
    try {
        const data = await authService.login(body, appName);
        if (data.needVerification)
            return res.status(200).json({ message: "Account not verified. OTP has been sent to your email.", data });
        // sameSite:
        // - "none"   = allow cross-site cookies (for different domains, must use secure: true)
        // - "lax"    = send cookies only on top-level navigation (default, safer, limited cross-site)
        // - "strict" = send cookies only from the same domain (most secure, no cross-site)

        res.cookie(`token_${appName}`, data.token, {
            httpOnly: true, // Tidak dapat diakses oleh JavaScript
            secure: true, // true = Hanya dikirim melalui HTTPS (penting untuk production)
            sameSite: "none", 
            maxAge: 60 * 60 * 24 * 1000,
            path: "/", // Hanya untuk path ini
        });
        res.status(200).json({ message: "Login successfully", data: { appName, ...data.data } });
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
        res.status(200).json({ message: "Logout successfully" });
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
    if (!appName)
        throw new BadRequestException(
            "Invalid or missing header: x-app-name. Allowed values are 'myrekap' or 'myflower'.",
            ErrorCode.REQUIRED_APP_NAME
        );

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
    const appName = (req.headers["x-app-name"] as string)?.toLowerCase() as AppNameType;
    if (!appName)
        throw new BadRequestException(
            "Invalid or missing header: x-app-name. Allowed values are 'myrekap' or 'myflower'.",
            ErrorCode.REQUIRED_APP_NAME
        );

    try {
        const data = await authService.verifyOtp(email, type, code);
        if (type === "EMAIL_VERIFICATION") {
            res.cookie(`token_${appName}`, data?.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 60 * 60 * 24 * 1000,
                path: "/",
            });
            return res
                .status(200)
                .json({ message: "Verify user otp successfully", data: { email, type, ...data?.user } });
        }
        res.status(200).json({ message: "Verify user otp successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { password } = authSchema.resetPassword.parse(req.body);
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        throw new BadRequestException("Missing or invalid resetToken", ErrorCode.INVALID_TOKEN);
    const token = authHeader.split(" ")[1];

    try {
        await authService.resetPassword(token, password);
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        return next(error);
    }
};
