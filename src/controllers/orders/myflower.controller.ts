import ErrorCode from "@/constants/error-code";
import { BadRequestException } from "@/exceptions";
import { AuthReq } from "@/middlewares";
import { ordersMyFlowerSchema } from "@/schemas";
import { ordersMyFlowerService } from "@/services";
import { Request, Response, NextFunction } from "express";

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const body = ordersMyFlowerSchema.create.parse(req.body);
    try {
        const user = (req as AuthReq).user;
        const data = await ordersMyFlowerService.create(user, body);
        res.status(200).json({ message: "Order created successfully", data });
    } catch (error) {
        next(error);
    }
};
export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthReq).user.id;
        const data = await ordersMyFlowerService.findAllByUser(userId);
        res.status(200).json({ message: data.length ? "Orders retrieved successfully" : "No orders available", data });
    } catch (error) {
        next(error);
    }
};
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthReq).user.id;
        const data = await ordersMyFlowerService.findByIdAndUser(userId, req.params.id);
        res.status(200).json({ message: "Order retrieved successfully", data });
    } catch (error) {
        next(error);
    }
};
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    const status = String(req.params.status).toLowerCase() as "cancel" | "confirm";
    if (!["cancel", "confirm"].includes(status))
        throw new BadRequestException("Status must be 'cancel' or 'confirm'", ErrorCode.UNPROCESSABLE_ENTITY);

    try {
        const data = await ordersMyFlowerService.updateStatus(req.params.id, status);
        res.status(200).json({
            message: status === "cancel" ? "Order canceled successfully" : "Order confirmed successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ordersMyFlowerService.remove(req.params.orderCode);
        res.json({ message: "Order deleted successfully", data });
    } catch (error) {
        return next(error);
    }
};