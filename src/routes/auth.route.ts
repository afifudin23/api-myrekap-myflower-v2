import { Router } from "express";
import { authMiddleware } from "@/middlewares";
import { authController } from "@/controllers";
import { errorHandler } from "@/utils";

const authRouter: Router = Router();

authRouter.post("/login", errorHandler(authController.login));
authRouter.post("/logout", authMiddleware, errorHandler(authController.logout));
authRouter.post("/register", errorHandler(authController.registerCustomer));
authRouter.get("/verify-auth", authMiddleware, errorHandler(authController.verifyAuth));
authRouter.post("/otp/resend", errorHandler(authController.resendUserOtp));
authRouter.post("/otp/verify", errorHandler(authController.verifyUserOtp));
authRouter.patch("/reset-password", errorHandler(authController.resetPassword));

export default authRouter;
