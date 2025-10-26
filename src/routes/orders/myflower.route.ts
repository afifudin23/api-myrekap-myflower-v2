import { ordersMyFlowerController } from "@/controllers";
import { authMiddleware, requireMyFlowerApp } from "@/middlewares";
import { errorHandler } from "@/utils";
import { Router } from "express";

const ordersMyFlowerRouter: Router = Router();

ordersMyFlowerRouter.get(
    "/",
    [authMiddleware, requireMyFlowerApp],
    errorHandler(ordersMyFlowerController.getUserOrders)
);
ordersMyFlowerRouter.get(
    "/:id",
    [authMiddleware, requireMyFlowerApp],
    errorHandler(ordersMyFlowerController.getOrderById)
);
ordersMyFlowerRouter.post(
    "/",
    [authMiddleware, requireMyFlowerApp],
    errorHandler(ordersMyFlowerController.createOrder)
);
ordersMyFlowerRouter.patch(
    "/:id/:status",
    [authMiddleware, requireMyFlowerApp],
    errorHandler(ordersMyFlowerController.updateOrderStatus)
);
ordersMyFlowerRouter.delete(
    "/:orderCode",
    [authMiddleware, requireMyFlowerApp],
    errorHandler(ordersMyFlowerController.deleteOrder)
);

export default ordersMyFlowerRouter;
