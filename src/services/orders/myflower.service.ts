import { prisma } from "@/config";
import ErrorCode from "@/constants/error-code";
import { BadRequestException, InternalException, NotFoundException } from "@/exceptions";
import { ordersMyFlowerSchema } from "@/schemas";
import { mailerService } from "@/services";
import { formatters } from "@/utils";
import { CustomerCategory } from "@prisma/client";

export const create = async (
    user: { id: string; fullName: string; phoneNumber: string; customerCategory: CustomerCategory | null },
    data: ordersMyFlowerSchema.CreateType
) => {
    const cartItems = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
    if (cartItems.length === 0)
        throw new BadRequestException("Cart must contain at least one item", ErrorCode.ORDER_MUST_CONTAIN_ITEMS);

    const cartItemMap = new Map(cartItems.map((cartItem) => [cartItem.productId, cartItem]));
    const orderCode = formatters.generateCode("order");
    const transactionOps = [];
    const orderItems = [];
    let totalPrice = 0;

    for (const item of data.items) {
        const cartItem = cartItemMap.get(item.productId);
        if (!cartItem) throw new NotFoundException("Product not found in cart", ErrorCode.PRODUCT_NOT_FOUND);

        if (cartItem.quantity > cartItem.product.stock)
            throw new BadRequestException("Stock is not enough", ErrorCode.STOCK_NOT_ENOUGH);

        transactionOps.push(
            prisma.product.update({
                where: { id: cartItem.productId },
                data: { stock: { decrement: cartItem.quantity } },
            }),
            prisma.stockTransaction.create({
                data: {
                    type: "STOCK_OUT",
                    quantity: cartItem.quantity,
                    productId: cartItem.productId,
                    note: `Order #${orderCode}`,
                },
            })
        );

        const orderItemPrice = cartItem.product.price * cartItem.quantity;
        orderItems.push({
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            message: item.message,
            unitPrice: cartItem.product.price,
            totalPrice: orderItemPrice,
        });
        totalPrice += orderItemPrice;
    }

    const shippingCost = data.deliveryOption === "DELIVERY" ? totalPrice * 0 : 0;
    const paymentStatus = data.paymentMethod === "COD" ? "UNPAID" : undefined;

    try {
        transactionOps.push(
            prisma.order.create({
                data: {
                    deliveryOption: data.deliveryOption,
                    deliveryAddress: data.deliveryAddress,
                    readyDate: data.readyDate,
                    paymentMethod: data.paymentMethod,
                    customerName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    source: "MYFLOWER",
                    userId: user.id,
                    orderCode,
                    totalPrice,
                    shippingCost,
                    customerCategory: user.customerCategory,
                    paymentStatus,
                    items: { create: orderItems },
                },
                select: {
                    id: true,
                    orderCode: true,
                },
            })
        );
        const result = (await prisma.$transaction(transactionOps)).at(-1)!;
        await prisma.cartItem.deleteMany({ where: { userId: user.id } });
        if (data.paymentMethod === "COD") {
            await mailerService.sendMyFlowerOrderStatusEmail(result.id, "create");
            await mailerService.sendNewOrderNotificationToManager(result.id);
        }
        return result;
    } catch (error) {
        throw new InternalException("Failed to create order", ErrorCode.FAILED_TO_CREATE_ORDER, error);
    }
};

export const findAllByUser = async (userId: string) => {
    return await prisma.order.findMany({
        where: { userId, source: "MYFLOWER" },
        include: { items: { include: { product: { include: { images: true } } } } },
        orderBy: { orderDate: "desc" },
    });
};
export const findByIdAndUser = async (userId: string, orderId: string) => {
    try {
        return await prisma.order.findFirstOrThrow({
            where: { id: orderId, userId },
            include: { items: { include: { product: { include: { images: true } } } } },
        });
    } catch (_error) {
        throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
    }
};
export const updateStatus = async (id: string, status: "cancel" | "confirm") => {
    const order = await prisma.order.findFirst({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
    if (!["IN_PROCESS", "DELIVERY"].includes(order.orderStatus))
        throw new BadRequestException("Order status cannot be updated", ErrorCode.ORDER_NOT_IN_PROCESS);

    const transactionOps = [];

    if (status === "cancel") {
        for (const item of order.items) {
            transactionOps.push(
                prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } }),
                prisma.stockTransaction.create({
                    data: {
                        type: "STOCK_IN",
                        quantity: item.quantity,
                        productId: item.productId,
                        note: `Order #${order.orderCode} canceled by customer #${order.userId}`,
                    },
                })
            );
        }

        transactionOps.push(
            prisma.order.update({
                where: { id },
                data: { orderStatus: "CANCELED" },
                select: { id: true },
            })
        );
    } else if (status === "confirm") {
        transactionOps.push(
            prisma.order.update({
                where: { id },
                data: { orderStatus: "COMPLETED", paymentStatus: "PAID" },
                select: { id: true },
            })
        );
    }

    try {
        await mailerService.sendMyFlowerOrderStatusEmail(id, status);
        return (await prisma.$transaction(transactionOps)).at(-1);
    } catch (_error) {
        throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
    }
};
