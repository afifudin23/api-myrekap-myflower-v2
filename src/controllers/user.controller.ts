import { NextFunction, Request, Response } from "express";
import { userService } from "@/services";
import { userSchema } from "@/schemas";
import { AuthReq } from "@/middlewares";

export const getAllAdmins = async (_req: Request, res: Response) => {
    const data = await userService.findAllAdmins();
    res.status(200).json({ message: data.length ? "User retrieved successfully" : "No user available", data });
};

export const getAllCustomers = async (_req: Request, res: Response) => {
    const data = await userService.findAllCustomers();
    res.status(200).json({ message: data.length ? "User retrieved successfully" : "No user available", data });
};

export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const body = userSchema.create.parse(req.body);
    try {
        const data = await userService.create(body);
        res.status(201).json({ message: "User created successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const body = userSchema.update.parse(req.body);
    try {
        const data = await userService.update(req.params.id, body);
        res.status(200).json({ message: "User updated successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    const body = userSchema.updateProfile.parse(req.body);
    try {
        const userId = (req as AuthReq).user.id;
        const data = await userService.updateProfile(userId, body);
        res.status(200).json({ message: "User updated successfully", data });
    } catch (error) {
        return next(error);
    }
};
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await userService.remove(req.params.id);
        res.status(200).json({ message: "User deleted successfully", data });
    } catch (error) {
        return next(error);
    }
};
