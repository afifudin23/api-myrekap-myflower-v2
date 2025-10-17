import { Router } from "express";
import { productController } from "@/controllers";
import { errorHandler, upload } from "@/utils";
import { authMiddleware, requireMyrekapApp } from "@/middlewares";

const productRouter: Router = Router();

productRouter.get("/", [authMiddleware], errorHandler(productController.getAllProducts));
productRouter.get(
    "/stocks/monthly",
    [authMiddleware, requireMyrekapApp],
    errorHandler(productController.getMonthlyStockReport)
);
productRouter.post(
    "/stocks/monthly",
    [authMiddleware, requireMyrekapApp],
    errorHandler(productController.createMonthlyStockReport)
);
productRouter.get("/:id", [authMiddleware], errorHandler(productController.getProductById));
productRouter.post(
    "/",
    [authMiddleware, requireMyrekapApp],
    upload.multiple("images"),
    errorHandler(productController.createProduct)
);
productRouter.post(
    "/:id/stock",
    [authMiddleware, requireMyrekapApp],
    errorHandler(productController.manageProductStock)
);
productRouter.put(
    "/:id",
    [authMiddleware, requireMyrekapApp],
    upload.multiple("images"),
    errorHandler(productController.updateProduct)
);
productRouter.delete("/:id", [authMiddleware, requireMyrekapApp], errorHandler(productController.deleteProduct));

export default productRouter;
