import { User } from ".prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import ErrorCode from "@/constants/error-code";
import { env, prisma } from "@/config";
import { UnauthorizedException } from "@/exceptions";

export interface AuthReq extends Request {
    user: User;
}

const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const appName = req.headers["x-app-name"];
        const tokenKey = appName === "default" ? "token" : `token_${appName}`;
        const token = req.cookies[tokenKey];

        const payload: any = jwt.verify(token, env.JWT_ACCESS);
        const user = await prisma.user.findFirst({ where: { id: payload.id } });
        if (!user) throw new Error();

        (req as AuthReq).user = user;
        next();
    } catch (_error) {
        return next(new UnauthorizedException("Your session has expired. Please log in again", ErrorCode.UNAUTHORIZED));
    }
};

export default authMiddleware;
