import { Router } from "express";
import { authMiddleware, requireMyrekapApp, singleSuperadminMiddleware, superadminMiddleware } from "@/middlewares";
import { userController } from "@/controllers";
import { errorHandler } from "@/utils";

const userRouter: Router = Router();

userRouter.get(
    "/admins",
    [authMiddleware, requireMyrekapApp, superadminMiddleware],
    errorHandler(userController.getAllAdmins)
);
userRouter.get("/customers", [authMiddleware, requireMyrekapApp], errorHandler(userController.getAllCustomers));
userRouter.post(
    "/admins",
    [authMiddleware, requireMyrekapApp, superadminMiddleware, singleSuperadminMiddleware],
    errorHandler(userController.createAdmin)
);
userRouter.patch(
    "/admins/:id",
    [authMiddleware, requireMyrekapApp, superadminMiddleware, singleSuperadminMiddleware],
    errorHandler(userController.updateAdmin)
);
userRouter.patch("/profile", [authMiddleware], errorHandler(userController.updateProfile)); // Profile MyFlower
userRouter.delete(
    "/:id",
    [authMiddleware, requireMyrekapApp, superadminMiddleware],
    errorHandler(userController.deleteUser)
);

export default userRouter;
