import ErrorCode from "@/constants/error-code";
import { BadRequestException } from "@/exceptions";
import { AppNameType } from ".";
import { Request, Response, NextFunction } from "express";

export const requireMyRekapApp = async (req: Request, _res: Response, next: NextFunction) => {
    const appName = (req.headers["x-app-name"] as string)?.toLowerCase() as AppNameType;
    if (appName === "myrekap") {
        next();
    } else {
        return next(
            new BadRequestException(
                "Invalid header. This endpoint is restricted to requests containing 'x-app-name: myrekap' header",
                ErrorCode.INVALID_APPNAME
            )
        );
    }
};

export const requireMyFlowerApp = async (req: Request, _res: Response, next: NextFunction) => {
    const appName = (req.headers["x-app-name"] as string)?.toLowerCase() as AppNameType;
    if (appName === "myflower") {
        next();
    } else {
        return next(
            new BadRequestException(
                "Invalid header. This endpoint is restricted to requests containing 'x-app-name: myflower' header",
                ErrorCode.INVALID_APPNAME
            )
        );
    }
};
