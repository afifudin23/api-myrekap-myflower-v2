import { AuthReq } from "@/middlewares/auth.middleware";
import { ordersMyRekapSchema } from "@/schemas";
import { ordersMyRekapService } from "@/services";
import { Request, Response, NextFunction } from "express";

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ordersMyRekapService.findAll(req.query);
        res.json({ message: data.length ? "Orders retrieved successfully" : "No orders available", data });
    } catch (error) {
        return next(error);
    }
};
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ordersMyRekapService.findById(req.params.id);
        res.json({ message: "Order retrieved successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file as Express.Multer.File;
    const body = ordersMyRekapSchema.create.parse(req.body);

    try {
        const userId = (req as AuthReq).user.id;
        const data = await ordersMyRekapService.create(userId, body, file);
        res.json({ message: "Order created successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file as Express.Multer.File;
    const body = ordersMyRekapSchema.update.parse(req.body);

    try {
        const data = await ordersMyRekapService.update(req.params.id, body, file);
        res.json({ message: "Order updated successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { status } = ordersMyRekapSchema.updateOrderStatus.parse(req.body);
    try {
        const userId = (req as AuthReq).user.id;
        const data = await ordersMyRekapService.updateStatus(req.params.id, userId, status, req.file);
        res.json({ message: "Update order status successfully", data });
    } catch (error) {
        return next(error);
    }
};
