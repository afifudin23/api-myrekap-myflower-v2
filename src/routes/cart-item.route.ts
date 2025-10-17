import { cartItemController } from "@/controllers";
import { authMiddleware, requireMyFlowerApp } from "@/middlewares";
import { errorHandler } from "@/utils";
import { Router } from "express";

const cartItemRouter: Router = Router();

cartItemRouter.get("/", [authMiddleware, requireMyFlowerApp], errorHandler(cartItemController.getUserCartItems));
cartItemRouter.post("/", [authMiddleware, requireMyFlowerApp], errorHandler(cartItemController.addToCart));
cartItemRouter.patch(
    "/:productId/:action",
    [authMiddleware, requireMyFlowerApp],
    errorHandler(cartItemController.updateQuantity)
);
cartItemRouter.delete(
    "/:productId",
    [authMiddleware, requireMyFlowerApp],
    errorHandler(cartItemController.deleteCartItem)
);
cartItemRouter.delete("/", [authMiddleware, requireMyFlowerApp], errorHandler(cartItemController.clearCartItems));

export default cartItemRouter;
