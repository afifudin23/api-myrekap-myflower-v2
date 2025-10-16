import { NextFunction, Request, Response } from "express";
import { BadRequestException, ForbiddenException, NotFoundException } from "../exceptions";
import ErrorCode from "@/constants/error-code";
import { prisma } from "@/config";

const singleSuperadminMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!id && role === "SUPERADMIN") {
        const existingSuperAdmin = await prisma.user.findFirst({ where: { role: "SUPERADMIN" } });
        if (existingSuperAdmin) return next(new BadRequestException("Superadmin already taken", ErrorCode.FORBIDDEN));
        return next();
    }

    if (id && role) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return next(new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND));
        if (role === user.role) return next();
        else
            return next(
                new ForbiddenException("Changing user role is not allowed for security reasons", ErrorCode.FORBIDDEN)
            );
    }
    next();
};

export default singleSuperadminMiddleware;
