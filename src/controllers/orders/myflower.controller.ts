import { ordersMyFlowerSchema } from "@/schemas";
import { ordersMyFlowerService } from "@/services";
import { Request, Response, NextFunction } from "express";

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    const body = ordersMyFlowerSchema.create.parse(req.body);
    try {
        const user = (req as any).user;
        const data = await ordersMyFlowerService.create(user, body);
        res.status(200).json({ message: "Order created successfully", data });
    } catch (error) {
        next(error);
    }
};
export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const data = await ordersMyFlowerService.findAllByUser(userId);
        res.status(200).json({ message: data.length ? "Orders retrieved successfully" : "No orders available", data });
    } catch (error) {
        next(error);
    }
};
export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const data = await ordersMyFlowerService.findByIdAndUser(userId, req.params.id);
        res.status(200).json({ message: "Order retrieved successfully", data });
    } catch (error) {
        next(error);
    }
};
export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ordersMyFlowerService.remove(req.params.orderCode);
        res.status(200).json({ message: "Order deleted successfully", data });
    } catch (error) {
        next(error);
    }
};
export const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ordersMyFlowerService.cancel(req.params.id);
        res.status(200).json({ message: "Order canceled successfully", data });
    } catch (error) {
        next(error);
    }
};

export const confirmOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await ordersMyFlowerService.confirm(req.params.id);
        res.status(200).json({ message: "Order confirmed successfully", data });
    } catch (error) {
        next(error);
    }
};



// FIX IT
export const mailer = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        // const user = (req as any).user;
        // await mailerService.sendCustomerOrderStatusEmail(user, req.params.method, req.body);
        res.status(200).send("OK");
    } catch (error) {
        next(error);
    }
};
