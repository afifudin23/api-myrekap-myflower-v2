import { Request, Response, NextFunction } from "express";
import { UnprocessableUntityException } from "../exceptions";
import ErrorCode from "@/constants/error-code";
import { productService } from "@/services";
import { productSchema } from "@/schemas";
import { AuthReq } from "@/middlewares";

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        throw new UnprocessableUntityException("Product image is required", ErrorCode.UNPROCESSABLE_ENTITY, null);
    }
    const body = productSchema.create.parse(req.body);
    try {
        const data = await productService.create(body, files);
        res.json({ message: "Product created successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const getAllProducts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await productService.findAll();
        res.json({ message: data.length ? "Products retrieved successfully" : "No products available", data });
    } catch (error) {
        return next(error);
    }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await productService.findById(req.params.id);
        res.json({ message: "Product retrieved successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    const body = productSchema.update.parse({
        ...req.body,
        publicIdsToDelete: req.body.publicIdsToDelete
            ? Array.isArray(req.body.publicIdsToDelete)
                ? req.body.publicIdsToDelete
                : [req.body.publicIdsToDelete]
            : [],
    });
    try {
        const data = await productService.update(req.params.id, body, req.files as Express.Multer.File[]);
        res.json({ message: "Product updated successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await productService.remove(req.params.id);
        res.json({ message: "Product deleted successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const manageProductStock = async (req: Request, res: Response, next: NextFunction) => {
    const body = productSchema.manageStock.parse(req.body);
    try {
        const userId = (req as AuthReq).user.id;
        const data = await productService.manageStock(req.params.id, userId, body);
        res.json({ message: "Product stock updated successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const getMonthlyStockReport = async (req: Request, res: Response, next: NextFunction) => {
    const { month, year, type } = req.query;
    if (!month || !year || !type) {
        throw new UnprocessableUntityException(
            "Month, year and type are required",
            ErrorCode.UNPROCESSABLE_ENTITY,
            null
        );
    }
    if (!["summary", "stock_in", "stock_out"].includes(String(type).toLowerCase())) {
        throw new UnprocessableUntityException(
            "Type must be summary, stock_in or stock_out",
            ErrorCode.UNPROCESSABLE_ENTITY,
            null
        );
    }

    try {
        const data = await productService.getReport(
            Number(month),
            Number(year),
            String(type).toUpperCase() as "STOCK_IN" | "STOCK_OUT"
        );
        res.json({ message: "Monthly stock report retrieved successfully", data });
    } catch (error) {
        return next(error);
    }
};

export const createMonthlyStockReport = async (req: Request, res: Response, next: NextFunction) => {
    const body = productSchema.createReport.parse(req.body);
    try {
        await productService.createReport(body);
        res.json({ message: "Monthly stock report created successfully", data: body });
    } catch (error) {
        return next(error);
    }
};
