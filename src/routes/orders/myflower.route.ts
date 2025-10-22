import { ordersMyFlowerController } from "@/controllers";
import { authMiddleware } from "@/middlewares";
import { errorHandler } from "@/utils";
import { Router } from "express";

const ordersCustomerRouter: Router = Router();

ordersCustomerRouter.get("/", [authMiddleware], errorHandler(ordersMyFlowerController.getUserOrders));
ordersCustomerRouter.get("/:id", [authMiddleware], errorHandler(ordersMyFlowerController.getOrderById));
ordersCustomerRouter.post("/", [authMiddleware], errorHandler(ordersMyFlowerController.createOrder));
ordersCustomerRouter.patch("/:id/cancel", [authMiddleware], errorHandler(ordersMyFlowerController.cancelOrder));
ordersCustomerRouter.patch("/:id/confirm", [authMiddleware], errorHandler(ordersMyFlowerController.confirmOrder));
ordersCustomerRouter.delete("/:orderCode", [authMiddleware], errorHandler(ordersMyFlowerController.deleteOrder));
ordersCustomerRouter.post("/mailer/:method", [authMiddleware], errorHandler(ordersMyFlowerController.mailer));

export default ordersCustomerRouter;
