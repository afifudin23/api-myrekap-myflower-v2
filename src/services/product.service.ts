import ErrorCode from "@/constants/error-code";
import { BadRequestException, InternalException, NotFoundException } from "@/exceptions";
import { productSchema } from "@/schemas";
import { cloudinary, prisma, uploadFile } from "@/config";
import { formatters, upload } from "@/utils";

type UploadResultsType = {
    fileName: string;
    size: number;
    secureUrl: string;
    publicId: string;
}[];

export const create = async (body: productSchema.CreateType, files: Express.Multer.File[]) => {
    const duplicateName = await prisma.product.findUnique({ where: { name: body.name }, select: { id: true } });
    if (duplicateName) throw new BadRequestException("Product name already exists", ErrorCode.PRODUCT_NAME_DUPLICATE);

    const uploadResults: UploadResultsType = [];
    try {
        const productCode = formatters.generateCode("product");
        for (const file of files) {
            const renamed = upload.renameFile(file.originalname, productCode);
            const result = await uploadFile(
                file,
                `myrekap-v2/products/${body.name.toLowerCase().split(" ").join("-")}`,
                renamed.fileName
            );
            uploadResults.push({
                fileName: renamed.fileName,
                size: file.size,
                secureUrl: result.secure_url,
                publicId: result.public_id,
            });
        }
        return await prisma.product.create({
            data: {
                name: body.name,
                price: body.price,
                description: body.description,
                isActive: body.isActive,
                productCode,
                images: { create: uploadResults.map((result) => result) },
            },
            select: { id: true },
        });
    } catch (error) {
        // Rollback upload images
        for (const result of uploadResults) {
            await cloudinary.uploader.destroy(result.publicId).catch((error) => {
                console.error("❌ Failed to delete image:", result.publicId, error);
            });
        }
        throw new InternalException("Failed to create product", ErrorCode.PRODUCT_CREATE_FAILED, error);
    }
};

export const findAll = async () => {
    return await prisma.product.findMany({ include: { images: true } });
};
export const findById = async (id: string) => {
    try {
        return await prisma.product.findUniqueOrThrow({ where: { id }, include: { images: true } });
    } catch (_error) {
        throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
    }
};
export const update = async (id: string, body: productSchema.UpdateType, files: Express.Multer.File[]) => {
    if (body.name) {
        const duplicateName = await prisma.product.findFirst({ where: { name: body.name, NOT: { id } } });
        if (duplicateName)
            throw new BadRequestException("Product name already exists", ErrorCode.PRODUCT_NAME_DUPLICATE);
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);

    // Check if product isActive changed to false then delete all cart items
    if (existingProduct.isActive !== body.isActive && body.isActive === false)
        await prisma.cartItem.deleteMany({ where: { productId: id } });

    const uploadResults: UploadResultsType = [];
    if (files && files.length > 0 && !body.name)
        throw new BadRequestException("Product name is required to upload image", ErrorCode.PRODUCT_NOT_FOUND);
    try {
        // Upload new files
        if (files && files.length > 0) {
            for (const file of files) {
                const renamed = upload.renameFile(file.originalname, existingProduct.productCode);
                const result = await uploadFile(
                    file,
                    `myrekap-v2/products/${body.name?.toLowerCase().split(" ").join("-")}`,
                    renamed.fileName
                );
                uploadResults.push({
                    fileName: renamed.fileName,
                    size: file.size,
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                });
            }
        }

        // Delete old files
        if (body.publicIdsToDelete) {
            for (const publicId of body.publicIdsToDelete) {
                await cloudinary.uploader.destroy(publicId).catch((error) => {
                    throw new Error(error);
                });
            }
            await prisma.productImage.deleteMany({ where: { publicId: { in: body.publicIdsToDelete } } });
        }

        // Update product
        return await prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                price: body.price,
                description: body.description,
                isActive: body.isActive,
                images: { create: uploadResults.map((result) => result) },
            },
            select: { id: true },
        });
    } catch (error) {
        // Rollback upload images
        for (const result of uploadResults) {
            await cloudinary.uploader.destroy(result.publicId).catch((error) => {
                console.error("❌ Failed to delete image:", result.publicId, error);
            });
        }
        throw new InternalException("Failed to update product", ErrorCode.PRODUCT_UPDATE_FAILED, error);
    }
};
export const remove = async (id: string) => {
    try {
        const existingProduct = await prisma.product.findUniqueOrThrow({ where: { id }, include: { images: true } });
        await Promise.all(
            existingProduct.images.map(async (image) => {
                await cloudinary.uploader.destroy(image.publicId).catch((error) => {
                    console.error("❌ Failed to delete image:", image.publicId, error);
                });
            })
        );
        return await prisma.product.delete({ where: { id }, select: { id: true } });
    } catch (_error) {
        throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);
    }
};

export const manageStock = async (id: string, userId: string, body: productSchema.ManageStockType) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);

    // Check if stock is enough
    if (body.type === "STOCK_OUT" && body.quantity > product.stock)
        throw new BadRequestException("Stock is not enough", ErrorCode.STOCK_NOT_ENOUGH);

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { userCode: true } });
    body.note =
        (body.note && body.note.trim()) ||
        (body.type === "STOCK_IN" ? `Stock in by admin #${user?.userCode}` : `Stock out by admin #${user?.userCode}`);
    try {
        await prisma.product.update({
            where: { id },
            data: { stock: body.type === "STOCK_IN" ? { increment: body.quantity } : { decrement: body.quantity } },
        });
        const transaction = await prisma.stockTransaction.create({
            data: { productId: id, type: body.type, quantity: body.quantity, note: body.note }, 
            select:{ id: true },
        });
    
        return { id: transaction.id, isUpdated: true };
        
    } catch (error) {
        throw new InternalException("Failed to manage stock", ErrorCode.INTERNAL_EXCEPTION, error);
    }
};

export const getReport = async (month: number, year: number, type: "STOCK_IN" | "STOCK_OUT") => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get stock report by type
    if (["STOCK_IN", "STOCK_OUT"].includes(type)) {
        return await prisma.stockTransaction.findMany({
            where: { type, createdAt: { gte: startDate, lte: endDate } },
            include: { product: { select: { productCode: true, name: true } } },
        });
    }

    try {
        // Get all products less than endDate by type summary
        return await prisma.monthlyStockReport.findMany({
            where: { month, year },
            include: { product: { select: { productCode: true, name: true } } },
        });
    } catch (_error) {
        throw new NotFoundException("Monthly stock report not found", ErrorCode.MONTHLY_STOCK_REPORT_NOT_FOUND);
    }
};
const sumStock = async (productId: string, type: "STOCK_IN" | "STOCK_OUT", month: number, year: number) => {
    const stockRecords = await prisma.stockTransaction.aggregate({
        _sum: { quantity: true },
        where: { productId, type, createdAt: { gte: new Date(year, month - 1, 1), lte: new Date(year, month, 0) } },
    });
    return stockRecords._sum.quantity || 0;
};

export const createReport = async (body: { month: number; year: number }) => {
    const products = await prisma.product.findMany();
    let prevMonth = body.month - 1;
    let prevYear = body.year;

    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = body.year - 1;
    }

    const reportData = [];

    for (const product of products) {
        const lastReport = await prisma.monthlyStockReport.findFirst({
            where: { productId: product.id, month: prevMonth, year: prevYear },
        });
        const stockIn = await sumStock(product.id, "STOCK_IN", body.month, body.year);
        const stockOut = await sumStock(product.id, "STOCK_OUT", body.month, body.year);
        const initialStock = lastReport ? lastReport.finalStock : 0;

        reportData.push({
            productId: product.id,
            month: body.month,
            year: body.year,
            initialStock,
            stockIn,
            stockOut,
            finalStock: initialStock + stockIn - stockOut,
        });
    }

    for (const data of reportData) {
        await prisma.monthlyStockReport.upsert({
            where: { productId_month_year: { productId: data.productId, month: data.month, year: data.year } },
            update: data,
            create: data,
        });
    }
};
