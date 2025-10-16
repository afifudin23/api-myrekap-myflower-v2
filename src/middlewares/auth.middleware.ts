import { User } from ".prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ErrorCode from "@/constants/error-code";
import { env, prisma } from "@/config";
import { UnauthorizedException } from "@/exceptions";

export type AppNameType = "myrekap" | "myflower";
export interface AuthReq extends Request {
    user: User;
}
interface AccessTokenPayload extends JwtPayload {
    id: string;
}

const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const appName = (req.headers["x-app-name"] as string)?.toLowerCase() as AppNameType;
        const token = req.cookies[`token_${appName}`];
        const payload = jwt.verify(token, env.JWT_ACCESS) as AccessTokenPayload;

        const user = await prisma.user.findFirstOrThrow({ where: { id: payload.id } });
        (req as AuthReq).user = user;
        next();
    } catch (_error) {
        return next(
            new UnauthorizedException("Your session has expired. Please log in again", ErrorCode.UNAUTHORIZED)
        );
    }
};

export default authMiddleware;
