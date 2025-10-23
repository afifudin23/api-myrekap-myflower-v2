import { ordersMyFlowerController } from "@/controllers";
import { authMiddleware } from "@/middlewares";
import { errorHandler } from "@/utils";
import { Router } from "express";

const ordersMyFlowerRouter: Router = Router();

ordersMyFlowerRouter.get("/", [authMiddleware], errorHandler(ordersMyFlowerController.getUserOrders));
ordersMyFlowerRouter.get("/:id", [authMiddleware], errorHandler(ordersMyFlowerController.getOrderById));
ordersMyFlowerRouter.post("/", [authMiddleware], errorHandler(ordersMyFlowerController.createOrder));
ordersMyFlowerRouter.patch("/:id/:status", [authMiddleware], errorHandler(ordersMyFlowerController.updateOrderStatus));

export default ordersMyFlowerRouter;
