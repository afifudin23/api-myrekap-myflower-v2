import ErrorCode from "@/constants/error-code";
import { ForbiddenException } from "@/exceptions";
import { AppNameType } from ".";
import { Request, Response, NextFunction } from "express";

const requireMyrekapApp = async (req: Request, _res: Response, next: NextFunction) => {
    const appName = (req.headers["x-app-name"] as string)?.toLowerCase() as AppNameType;
    if (appName === "myrekap") {
        next();
    } else {
        return next(
            new ForbiddenException(
                "Unauthorized application access. This endpoint is restricted to requests containing 'x-app-name: myrekap' header",
                ErrorCode.FORBIDDEN
            )
        );
    }
};

export default requireMyrekapApp;
