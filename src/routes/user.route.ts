import { Router } from "express";
import { authMiddleware, requireMyRekapApp, singleSuperadminMiddleware, superadminMiddleware } from "@/middlewares";
import { userController } from "@/controllers";
import { errorHandler } from "@/utils";

const userRouter: Router = Router();

userRouter.get(
    "/admins",
    [authMiddleware, requireMyRekapApp, superadminMiddleware],
    errorHandler(userController.getAllAdmins)
);
userRouter.get("/customers", [authMiddleware, requireMyRekapApp], errorHandler(userController.getAllCustomers));
userRouter.get("/me", [authMiddleware], errorHandler(userController.getCurrentUser));
userRouter.post(
    "/admins",
    [authMiddleware, requireMyRekapApp, superadminMiddleware, singleSuperadminMiddleware],
    errorHandler(userController.createAdmin)
);
userRouter.patch(
    "/admins/:id",
    [authMiddleware, requireMyRekapApp, superadminMiddleware, singleSuperadminMiddleware],
    errorHandler(userController.updateAdmin)
);
userRouter.patch("/profile", [authMiddleware], errorHandler(userController.updateProfile)); // Profile MyFlower
userRouter.delete(
    "/:id",
    [authMiddleware, requireMyRekapApp, superadminMiddleware],
    errorHandler(userController.deleteUser)
);

export default userRouter;
