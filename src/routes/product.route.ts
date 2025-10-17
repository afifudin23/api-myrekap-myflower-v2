import { Router } from "express";
import { productController } from "@/controllers";
import { errorHandler, upload } from "@/utils";
import { authMiddleware, requireMyRekapApp } from "@/middlewares";

const productRouter: Router = Router();

productRouter.get("/", [authMiddleware], errorHandler(productController.getAllProducts));
productRouter.get(
    "/stocks/monthly",
    [authMiddleware, requireMyRekapApp],
    errorHandler(productController.getMonthlyStockReport)
);
productRouter.post(
    "/stocks/monthly",
    [authMiddleware, requireMyRekapApp],
    errorHandler(productController.createMonthlyStockReport)
);
productRouter.get("/:id", [authMiddleware], errorHandler(productController.getProductById));
productRouter.post(
    "/",
    [authMiddleware, requireMyRekapApp],
    upload.multiple("images"),
    errorHandler(productController.createProduct)
);
productRouter.post(
    "/:id/stock",
    [authMiddleware, requireMyRekapApp],
    errorHandler(productController.manageProductStock)
);
productRouter.put(
    "/:id",
    [authMiddleware, requireMyRekapApp],
    upload.multiple("images"),
    errorHandler(productController.updateProduct)
);
productRouter.delete("/:id", [authMiddleware, requireMyRekapApp], errorHandler(productController.deleteProduct));

export default productRouter;
