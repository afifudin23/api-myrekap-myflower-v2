import { AuthReq } from "@/middlewares";
import { reviewSchema } from "@/schemas";
import { reviewService } from "@/services";
import { Request, Response, NextFunction } from "express";

export const getReviewsByProductId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await reviewService.findAll(req.params.id);
        res.json({ message: data.length > 0 ? "Product reviews retrieved successfully" : "No product reviews available", data });
    } catch (error) {
        next(error);
    }
};
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    const body = reviewSchema.create.parse(req.body);
    try {
        const userId = (req as AuthReq).user.id;
        const { data, isNew } = await reviewService.create(req.params.id, userId, body);
        res.json({ message: isNew ? "Product review created successfully" : "Product review updated successfully", data });
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthReq).user.id;
        const data = await reviewService.remove(userId, req.params.id);
        res.json({ message: "Product review deleted successfully", data });
    } catch (error) {
        next(error);
    }
};
