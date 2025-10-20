import { ordersMyRekapController } from "@/controllers";
import { authMiddleware, requireMyRekapApp } from "@/middlewares";
import { errorHandler, upload } from "@/utils";
import { Router } from "express";

const ordersAdminRouter: Router = Router();

ordersAdminRouter.get("/", [authMiddleware, requireMyRekapApp], errorHandler(ordersMyRekapController.getAllOrders));
ordersAdminRouter.get("/:id", [authMiddleware, requireMyRekapApp], errorHandler(ordersMyRekapController.getOrderById));
ordersAdminRouter.post(
    "/",
    [authMiddleware, requireMyRekapApp],
    upload.single("paymentProof"),
    errorHandler(ordersMyRekapController.createOrder)
);
ordersAdminRouter.patch(
    "/:id",
    [authMiddleware, requireMyRekapApp],
    upload.single("paymentProof"),
    errorHandler(ordersMyRekapController.updateOrder)
);
ordersAdminRouter.patch(
    "/:id/status",
    [authMiddleware, requireMyRekapApp],
    upload.single("finishedProduct"),
    errorHandler(ordersMyRekapController.updateOrderStatus)
);

export default ordersAdminRouter;
