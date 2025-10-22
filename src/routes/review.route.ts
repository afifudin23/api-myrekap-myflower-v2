import { reviewController } from "@/controllers";
import { authMiddleware, requireMyFlowerApp } from "@/middlewares";
import { errorHandler } from "@/utils";
import { Router } from "express";

const reviewRouter: Router = Router({ mergeParams: true });

reviewRouter.get("/", errorHandler(reviewController.getReviewsByProductId));
reviewRouter.post("/", [authMiddleware, requireMyFlowerApp], errorHandler(reviewController.createReview));
reviewRouter.delete("/", [authMiddleware, requireMyFlowerApp], errorHandler(reviewController.deleteReview));

export default reviewRouter;
