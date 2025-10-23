import { ordersMyRekapController } from "@/controllers";
import { authMiddleware, requireMyRekapApp } from "@/middlewares";
import { errorHandler, upload } from "@/utils";
import { Router } from "express";

const ordersMyRekapRouter: Router = Router();

ordersMyRekapRouter.get("/", [authMiddleware, requireMyRekapApp], errorHandler(ordersMyRekapController.getAllOrders));
ordersMyRekapRouter.get("/:id", [authMiddleware, requireMyRekapApp], errorHandler(ordersMyRekapController.getOrderById));
ordersMyRekapRouter.post(
    "/",
    [authMiddleware, requireMyRekapApp],
    upload.single("paymentProof"),
    errorHandler(ordersMyRekapController.createOrder)
);
ordersMyRekapRouter.patch(
    "/:id",
    [authMiddleware, requireMyRekapApp],
    upload.single("paymentProof"),
    errorHandler(ordersMyRekapController.updateOrder)
);
ordersMyRekapRouter.patch(
    "/:id/status",
    [authMiddleware, requireMyRekapApp],
    upload.single("finishedProduct"),
    errorHandler(ordersMyRekapController.updateOrderStatus)
);

export default ordersMyRekapRouter;
