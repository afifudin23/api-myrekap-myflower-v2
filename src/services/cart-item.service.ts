import { prisma } from "@/config";
import ErrorCode from "@/constants/error-code";
import { BadRequestException, NotFoundException } from "@/exceptions";
import { cartItemSchema } from "@/schemas";

export const findAll = async (userId: string) => {
    return await prisma.cartItem.findMany({
        where: { userId },
        select: {
            id: true,
            quantity: true,
            productId: true,
            product: {
                select: { id: true, name: true, price: true, images: { take: 1, select: { secureUrl: true } } },
            },
        },
    });
};
export const upsertItem = async (userId: string, data: cartItemSchema.AddToCartType) => {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);

    if (product?.isActive === false)
        throw new BadRequestException("Product is not active", ErrorCode.PRODUCT_NOT_ACTIVE);

    const result = await prisma.cartItem.upsert({
        where: { userId_productId: { userId, productId: data.productId } },
        update: { quantity: { increment: 1 } },
        create: { productId: data.productId, userId, quantity: 1 },
        select: { id: true, quantity: true },
    });
    return { data: result, isNew: result.quantity === 1 };
};

export const updateQuantity = async (userId: string, productId: string, action: "increment" | "decrement") => {
    try {
        const item = await prisma.cartItem.findUniqueOrThrow({ where: { userId_productId: { userId, productId } } });
        if (item.quantity === 1 && action === "decrement") {
            return {
                data: await prisma.cartItem.delete({ where: { id: item.id }, select: { id: true } }),
                updated: false,
            };
        }
        return {
            data: await prisma.cartItem.update({
                where: { id: item.id },
                data: action === "increment" ? { quantity: { increment: 1 } } : { quantity: { decrement: 1 } },
                select: { id: true },
            }),
            updated: true,
            
        };
    } catch (_error) {
        throw new NotFoundException("Cart item not found", ErrorCode.CART_ITEM_NOT_FOUND);
    }
};

export const removeItem = async (userId: string, productId: string) => {
    try {
        return await prisma.cartItem.delete({
            where: { userId_productId: { userId, productId } },
            select: { id: true },
        });
    } catch (_error) {
        throw new NotFoundException("Cart item not found", ErrorCode.CART_ITEM_NOT_FOUND);
    }
};

export const removeAll = async (userId: string) => {
    return await prisma.cartItem.deleteMany({ where: { userId } });
};
