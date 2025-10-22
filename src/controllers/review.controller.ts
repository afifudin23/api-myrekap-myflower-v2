import { AuthReq } from "@/middlewares";
import { reviewSchema } from "@/schemas";
import { reviewService } from "@/services";
import { Request, Response, NextFunction } from "express";

export const getReviewsByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.params.productId;
        const data = await reviewService.findAll(productId);
        res.json({ message: data.length > 0 ? "Reviews retrieved successfully" : "No reviews available", data });
    } catch (error) {
        next(error);
    }
};
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    const body = reviewSchema.create.parse(req.body);
    try {
        const productId = req.params.productId;
        const userId = (req as AuthReq).user.id;
        const { data, isNew } = await reviewService.create(productId, userId, body);
        res.json({ message: isNew ? "Review created successfully" : "Review updated successfully", data });
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.params.productId;
        const userId = (req as AuthReq).user.id;
        const data = await reviewService.remove(userId, productId);
        res.json({ message: "Review deleted successfully", data });
    } catch (error) {
        next(error);
    }
};
