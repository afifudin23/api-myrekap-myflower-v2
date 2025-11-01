import ErrorCode from "@/constants/error-code";
import {
    BadRequestException,
    ForbiddenException,
    InternalException,
    NotFoundException,
    UnprocessableUntityException,
} from "@/exceptions";
import { cloudinary, prisma, uploadFile } from "@/config";
import { formatters, upload } from "@/utils";
import { ordersMyRekapSchema } from "@/schemas";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { mailerService } from "@/services";

export const findAll = async (query: any) => {
    const { month, year, from_date, to_date, customer_category, payment_method, payment_status, order_status } = query;
    let orderDateFilter: { gte: Date | undefined; lte: Date | undefined };
    let orderDateOrderBy: "asc" | "desc" = "desc";
    if (month && year) {
        const startDate = new Date(year, month - 1, 1); // 1st day, 00:00:00
        const endDate = new Date(year, month, 0); // Last day, 23:59:59

        orderDateFilter = {
            gte: startDate,
            lte: endDate,
        };
        orderDateOrderBy = "desc";
    } else if (from_date && to_date) {
        orderDateFilter = {
            gte: new Date(from_date),
            lte: new Date(to_date),
        };
        orderDateOrderBy = "asc";
    } else {
        orderDateFilter = {
            gte: undefined,
            lte: undefined,
        };
    }
    const data = await prisma.order.findMany({
        where: {
            orderDate: orderDateFilter,
            customerCategory: customer_category?.toUpperCase() !== "ALL" ? customer_category?.toUpperCase() : undefined,
            paymentMethod: payment_method?.toUpperCase() !== "ALL" ? payment_method?.toUpperCase() : undefined,
            paymentStatus: payment_status?.toUpperCase() !== "ALL" ? payment_status?.toUpperCase() : undefined,
            orderStatus: order_status?.toUpperCase() !== "ALL" ? order_status?.toUpperCase() : undefined,
        },
        orderBy: {
            orderDate: orderDateOrderBy,
        },
        include: {
            items: { include: { product: { include: { images: true } } } },
            images: true,
        },
    });
    return data;
};

export const findById = async (id: string) => {
    try {
        const data = await prisma.order.findFirstOrThrow({
            where: { id },
            include: { items: { include: { product: { include: { images: true } } } }, images: true },
        });
        return data;
    } catch (_error) {
        throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
    }
};

export const create = async (userId: string, body: ordersMyRekapSchema.CreateType, file: Express.Multer.File) => {
    if (body.paymentMethod === "BANK_TRANSFER" && !file) {
        throw new UnprocessableUntityException(
            "Payment proof is required for bank transfer",
            ErrorCode.UNPROCESSABLE_ENTITY,
            null
        );
    }
    const products = await prisma.product.findMany();
    const productMap = new Map(products.map((product) => [product.id, product]));
    const orderItems = [];
    const transactionOps = [];
    const orderCode = formatters.generateCode("order");

    for (const item of body.items) {
        const product = productMap.get(item.productId);
        if (!product) throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);

        // Check if stock is enough
        if (item.quantity >= product.stock)
            throw new BadRequestException("Stock is not enough", ErrorCode.STOCK_NOT_ENOUGH);

        // Save stock operation update stock and create stock history
        transactionOps.push(
            prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            }),
            prisma.stockTransaction.create({
                data: {
                    type: "STOCK_OUT",
                    quantity: item.quantity,
                    productId: item.productId,
                    note: `Order #${orderCode}`,
                },
            })
        );

        // Save order item
        orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            message: item.message,
            unitPrice: product?.price,
            totalPrice: product.price * item.quantity,
        });
    }
    const totalPrice = orderItems.reduce((total: number, item: any) => total + item.totalPrice, 0);

    try {
        let uploadedFile;
        let renamed;
        if (file && body.paymentMethod === "BANK_TRANSFER") {
            renamed = upload.renameFile(file.originalname, orderCode);
            uploadedFile = await uploadFile(file, "myrekap-v2/bukti-transfer", renamed.fileName);
        }
        transactionOps.push(
            prisma.order.create({
                data: {
                    orderCode,
                    source: "MYREKAP",
                    userId,
                    customerName: body.customerName,
                    customerCategory: body.customerCategory,
                    phoneNumber: body.phoneNumber,
                    items: { create: orderItems },
                    readyDate: body.readyDate,
                    deliveryOption: body.deliveryOption,
                    deliveryAddress: body.deliveryAddress,
                    shippingCost: body.shippingCost,
                    paymentMethod: body.paymentMethod,
                    totalPrice,
                    paymentStatus: body.isPaid ? "PAID" : "UNPAID",
                    images:
                        uploadedFile && renamed
                            ? {
                                  create: {
                                      fileName: renamed.fileName,
                                      type: "PAYMENT_PROOF",
                                      size: file.size,
                                      secureUrl: uploadedFile.secure_url,
                                      publicId: uploadedFile.public_id,
                                  },
                              }
                            : undefined,
                },
                select: { id: true },
            })
        );
        const result = (await prisma.$transaction(transactionOps)).at(-1)!;
        await mailerService.sendNewOrderNotificationToManager(result.id);
        return result;
    } catch (error) {
        console.log(error);
        throw new InternalException("Something went wrong", ErrorCode.INTERNAL_EXCEPTION, error);
    }
};

export const update = async (id: string, body: ordersMyRekapSchema.UpdateType, file: Express.Multer.File) => {
    //  Check if order exists
    const existingOrder = await prisma.order.findUnique({
        where: { id },
        include: { items: true, images: { where: { type: "PAYMENT_PROOF" } } },
    });
    if (!existingOrder) throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);

    if (body.paymentMethod === "BANK_TRANSFER" && !file && !existingOrder.images.length) {
        throw new UnprocessableUntityException(
            "Payment proof is required for bank transfer",
            ErrorCode.UNPROCESSABLE_ENTITY,
            null
        );
    }

    const oldItems = existingOrder.items;
    const newItems = body.items;
    const products = await prisma.product.findMany();
    const transactionOps = [];

    transactionOps.push(prisma.orderItem.deleteMany({ where: { orderId: id } }));

    for (const item of newItems) {
        const product = products.find((product) => product.id === item.productId);
        if (!product) throw new NotFoundException("Product not found", ErrorCode.PRODUCT_NOT_FOUND);

        // Check if stock is enough
        const oldItem = oldItems.find((oldItem) => oldItem.productId === item.productId);
        const difference = item.quantity - (oldItem?.quantity || 0);
        if (difference > 0 && difference > product.stock)
            throw new BadRequestException("Stock is not enough", ErrorCode.STOCK_NOT_ENOUGH);

        transactionOps.push(
            prisma.orderItem.create({
                data: {
                    orderId: id,
                    productId: item.productId,
                    quantity: item.quantity,
                    message: item.message, // test body undefined
                    unitPrice: product.price,
                    totalPrice: product.price * item.quantity,
                },
            })
        );

        if (difference !== 0) {
            transactionOps.push(
                prisma.product.update({
                    where: { id: item.productId },
                    data:
                        difference > 0
                            ? { stock: { decrement: difference } } // STOK OUT
                            : { stock: { increment: Math.abs(difference) } }, // STOK IN
                }),

                prisma.stockTransaction.create({
                    data: {
                        type: difference > 0 ? "STOCK_OUT" : "STOCK_IN",
                        quantity: Math.abs(difference),
                        productId: item.productId,
                        note: `Order #${existingOrder.orderCode}`,
                    },
                })
            );
        }
    }
    const removedItems = oldItems.filter((old) => !newItems.some((n) => n.productId === old.productId));
    for (const item of removedItems) {
        transactionOps.push(
            prisma.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
            }),
            prisma.stockTransaction.create({
                data: {
                    type: "STOCK_IN",
                    quantity: item.quantity,
                    productId: item.productId,
                    note: `Order #${existingOrder.orderCode} (removed item)`,
                },
            })
        );
    }

    try {
        if ((!body.isPaid || body.paymentMethod !== "BANK_TRANSFER") && existingOrder.images.length === 1) {
            await cloudinary.uploader.destroy(existingOrder.images[0].publicId);
            transactionOps.push(prisma.orderImage.delete({ where: { id: existingOrder.images[0].id } }));
            console.log(123);
        }
        if (file?.buffer) {
            if (existingOrder.images.length > 0) {
                await cloudinary.uploader.destroy(existingOrder.images[0].publicId);
                transactionOps.push(prisma.orderImage.delete({ where: { id: existingOrder.images[0].id } }));
            }

            const orderCode = existingOrder.orderCode;
            const renamed = upload.renameFile(file.originalname, orderCode);
            const uploadedFile = await uploadFile(file, "myrekap-v2/payment-proof", renamed.fileName);
            transactionOps.push(
                prisma.orderImage.create({
                    data: {
                        orderId: id,
                        fileName: renamed.fileName,
                        type: "PAYMENT_PROOF",
                        size: file.size,
                        secureUrl: uploadedFile.secure_url,
                        publicId: uploadedFile.public_id,
                    },
                })
            );
        }
        const total = await prisma.orderItem.aggregate({ where: { orderId: id }, _sum: { totalPrice: true } });
        const totalPrice = total._sum.totalPrice ?? 0;

        transactionOps.push(
            prisma.order.update({
                where: { id },
                data: {
                    customerName: body.customerName,
                    customerCategory: body.customerCategory,
                    phoneNumber: body.phoneNumber,
                    readyDate: body.readyDate,
                    deliveryOption: body.deliveryOption,
                    deliveryAddress: body.deliveryAddress,
                    shippingCost: body.shippingCost,
                    paymentStatus: body.isPaid ? "PAID" : "UNPAID",
                    paymentMethod: body.paymentMethod,
                    totalPrice,
                },
                select: { id: true },
            })
        );

        return (await prisma.$transaction(transactionOps)).at(-1);
    } catch (error) {
        console.log(error);
        throw new InternalException("Something went wrong", ErrorCode.INTERNAL_EXCEPTION, error);
    }
};

export const updateStatus = async (
    orderId: string,
    userId: string,
    body: ordersMyRekapSchema.UpdateOrderStatusType,
    file?: Express.Multer.File
) => {
    // Check if order exists
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);

    if (order.source !== "MYREKAP" && !["IN_PROCESS", "DELIVERY"].includes(body.status))
        throw new ForbiddenException(
            "Forbidden: Order source is not from 'MYREKAP'",
            ErrorCode.ORDER_SOURCE_NOT_MYREKAP
        );

    if (order.deliveryOption !== "DELIVERY" && body.status === "DELIVERY")
        throw new BadRequestException(
            "Order delivery option is not delivery, cannot update to delivery",
            ErrorCode.DELIVERY_OPTION_NOT_DELIVERY
        );

    // Check if finished product exists
    if (body.isDeleteImage || file) {
        // Delete existing finished product
        const existingfile = await prisma.orderImage.findUnique({
            where: { orderId_type: { orderId, type: "FINISHED_PRODUCT" } },
        });
        if (existingfile) {
            await cloudinary.uploader.destroy(existingfile.publicId);
            await prisma.orderImage.delete({ where: { id: existingfile.id } });
        }
    }

    // Upload new finished product
    if (file) {
        const renamed = upload.renameFile(file.originalname, order.orderCode);
        const result = await uploadFile(file, "myrekap-v2/finished-product", renamed.fileName);
        await prisma.orderImage.create({
            data: {
                fileName: renamed.fileName,
                type: "FINISHED_PRODUCT",
                size: file.size,
                orderId,
                secureUrl: result.secure_url,
                publicId: result.public_id,
            },
        });
    }

    // Update order status
    const dataOrderStatus: {
        orderStatus: OrderStatus;
        paymentStatus?: PaymentStatus;
    } = { orderStatus: body.status };
    const transactionOps = [];
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (body.status === "CANCELED" && user) {
        // Create STOCK_IN history for cancellation
        for (const item of order.items) {
            transactionOps.push(
                prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                }),
                prisma.stockTransaction.create({
                    data: {
                        type: "STOCK_IN",
                        quantity: item.quantity,
                        productId: item.productId,
                        note: `Order #${order.orderCode} canceled by admin #${user.userCode}`,
                    },
                })
            );
        }
    } else if (
        ["COMPLETED", "IN_PROCESS", "DELIVERY"].includes(body.status) &&
        order.orderStatus === "CANCELED" &&
        user
    ) {
        if (body.status === "COMPLETED") dataOrderStatus.paymentStatus = "PAID";
        // Create STOCK_OUT history for reactivation
        for (const item of order.items) {
            transactionOps.push(
                prisma.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                }),
                prisma.stockTransaction.create({
                    data: {
                        type: "STOCK_OUT",
                        quantity: item.quantity,
                        productId: item.productId,
                        note: `Order #${order.orderCode} reactivated by admin #${user.userCode}`,
                    },
                })
            );
        }
    }
    transactionOps.push(
        prisma.order.update({ where: { id: orderId }, data: dataOrderStatus, select: { id: true, orderStatus: true } })
    );

    // Update order
    try {
        const result = await prisma.$transaction(transactionOps);
        if (order.source === "MYFLOWER" && ["IN_PROCESS", "DELIVERY"].includes(body.status))
            mailerService.sendMyRekapOrderStatusEmail(orderId);
        return result.at(-1);
    } catch (_error) {
        throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
    }
};
