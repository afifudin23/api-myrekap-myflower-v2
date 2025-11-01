import authRouter from "@/routes/auth.route";
import cartItemRouter from "@/routes/cart-item.route";
import ordersMyRekapRouter from "@/routes/orders/myrekap.route";
import ordersMyFlowerRouter from "@/routes/orders/myflower.route";
import paymentProofRouter from "@/routes/payment-proof.route";
import productRouter from "@/routes/product.route";
import reportRouter from "@/routes/report.route";
import reviewRouter from "@/routes/review.route";
import transactionRouter from "@/routes/transaction.route";
import userRouter from "@/routes/user.route";
import { Router } from "express";

const rootRouter: Router = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/users", userRouter);
rootRouter.use("/products", productRouter);
rootRouter.use("/products/:id/reviews", reviewRouter);
rootRouter.use("/carts", cartItemRouter);
rootRouter.use("/orders/myrekap", ordersMyRekapRouter);
rootRouter.use("/orders/myflower", ordersMyFlowerRouter);
rootRouter.use("/payment-proofs", paymentProofRouter);
rootRouter.use("/transactions", transactionRouter);
rootRouter.use("/reports", reportRouter);

export default rootRouter;
