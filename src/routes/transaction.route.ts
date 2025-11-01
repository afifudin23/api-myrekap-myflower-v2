import { transactionController } from "@/controllers";
import { authMiddleware, requireMyFlowerApp } from "@/middlewares";
import { errorHandler } from "@/utils";
import { Router } from "express";

const transactionRouter: Router = Router();

transactionRouter.post("/webhook", errorHandler(transactionController.handlePaymentNotification));
transactionRouter.post("/create", [authMiddleware, requireMyFlowerApp], errorHandler(transactionController.createTransaction));
transactionRouter.post("/:orderCode/cancel", [authMiddleware, requireMyFlowerApp], errorHandler(transactionController.cancelTransaction));
transactionRouter.post("/:orderCode/refund", [authMiddleware, requireMyFlowerApp], errorHandler(transactionController.refundTransaction));
transactionRouter.post("/:orderCode/expire", [authMiddleware, requireMyFlowerApp], errorHandler(transactionController.expireTransaction));

export default transactionRouter;
