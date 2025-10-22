import { prisma } from "@/config";
import ErrorCode from "@/constants/error-code";
import { NotFoundException } from "@/exceptions";
import { reviewSchema } from "@/schemas";

export const findAll = async (productId: string) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);

    return await prisma.review.findMany({ where: { productId }, include: { user: { select: { fullName: true } } } });
};

export const create = async (productId: string, userId: string, data: reviewSchema.CreateType) => {
    // check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);

    // create review
    return {
        isNew: (await prisma.review.count({ where: { userId, productId } })) === 0,
        data: await prisma.review.upsert({
            where: { userId_productId: { userId, productId } },
            update: data,
            create: {
                userId,
                productId,
                rating: data.rating,
                comment: data.comment,
            },
            select: { id: true },
        }),
    };
};

export const remove = async (userId: string, productId: string) => {
    // check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);

    try {
        return await prisma.review.delete({ where: { userId_productId: { userId, productId } }, select: { id: true } });
    } catch (_error) {
        throw new NotFoundException("Review not found", ErrorCode.REVIEW_PRODUCT_NOT_FOUND);
    }
};
