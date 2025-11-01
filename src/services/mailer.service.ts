import { brevo, env, prisma } from "@/config";
import ErrorCode from "@/constants/error-code";
import { BadRequestException, NotFoundException } from "@/exceptions";
import { formatters } from "@/utils";
import { OtpType } from "@prisma/client";
import { addMinutes } from "date-fns";
import crypto from "crypto";
import { AppNameType } from "@/middlewares";
import {
    DELIVERY_OPTION_LABELS,
    DeliveryOptionType,
    ORDER_STATUS_LABELS,
    OrderStatusType,
    PAYMENT_METHOD_LABELS,
    PaymentMethodType,
} from "@/constants/category";

interface GenerateUserOtpProps {
    userId: string;
    type: OtpType;
    expiresInMinutes?: number;
}

interface SendTemplateEmailProps {
    to: string;
    name: string;
    templateId: number;
    params: any;
    appName: AppNameType;
}

const sendTemplateEmail = async ({ to, name, templateId, params, appName }: SendTemplateEmailProps) => {
    try {
        await brevo.sendTransacEmail({
            to: [{ email: to, name }],
            sender: {
                name: `${env.BREVO_SENDER_NAME} ${formatters.appNameType[appName]}`,
                email: env.BREVO_SENDER_EMAIL,
            },
            templateId,
            params,
        });

        console.log("✅ Verification email sent to:", to);
    } catch (error: any) {
        console.error("❌ Failed to send email:", error.response?.body || error);
        throw new Error("Failed to send verification email");
    }
};

const generateUserOtp = async ({ userId, type, expiresInMinutes = 10 }: GenerateUserOtpProps) => {
    const code = crypto.randomInt(100000, 1000000).toString().padStart(6, "0");
    const expiresAt = addMinutes(new Date(), expiresInMinutes);

    await prisma.userOtp.create({
        data: {
            userId,
            code,
            type,
            expiresAt,
        },
    });
    return code;
};

export const resendUserOtp = async (
    user: { id: string; email: string; username: string },
    type: OtpType,
    appName: AppNameType
) => {
    // rate limit: max 5 otp in 15 minutes
    const otpCount = await prisma.userOtp.count({
        where: {
            userId: user.id,
            type,
            createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) },
        },
    });
    if (otpCount >= 5)
        throw new BadRequestException("Too many requests. Please try again later.", ErrorCode.TOO_MANY_REQUESTS);

    // send otp email
    await sendTemplateEmail({
        to: user.email,
        name: user.username,
        templateId: env.BREVO_TEMPLATE_OTP_ID,
        appName,
        params: {
            appName: formatters.appNameType[appName],
            type: formatters.generateOtpType[type],
            username: user.username,
            otp: await generateUserOtp({ userId: user.id, type }),
            expiresInMinutes: 10,
            purpose: formatters.purposeOtpType[type],
        },
    });
};

export const sendMyRekapOrderStatusEmail = async (id: string) => {
    const order = await prisma.order.findUnique({
        where: { id },
        select: {
            orderCode: true,
            customerName: true,
            paymentMethod: true,
            paymentProvider: true,
            totalPrice: true,
            orderStatus: true,
            user: { select: { email: true, fullName: true } },
            items: { include: { product: { select: { name: true } } } },
        },
    });
    if (!order) throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);

    await sendTemplateEmail({
        to: order.user.email,
        name: order.user.fullName,
        templateId: env.BREVO_TEMPLATE_MYREKAP_ORDER_STATUS_ID,
        appName: "myrekap",
        params: {
            orderCode: order.orderCode,
            customerName: order.customerName,
            paymentMethod: order.paymentMethod
                ? PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethodType]
                : "BELUM DIBAYAR",
            paymentProvider: order.paymentProvider ?? undefined,
            totalPrice: formatters.formatRupiah(order.totalPrice),
            orderStatus: ORDER_STATUS_LABELS[order.orderStatus as OrderStatusType],
            items: formatters.formatItemsAsList(order.items),
        },
    });
};

export const sendMyFlowerOrderStatusEmail = async (id: string, status: "create" | "cancel" | "confirm") => {
    const order = await prisma.order.findUnique({
        where: { id },
        select: {
            orderCode: true,
            customerName: true,
            paymentMethod: true,
            paymentProvider: true,
            totalPrice: true,
            orderStatus: true,
            user: { select: { email: true, fullName: true } },
            items: { include: { product: { select: { name: true } } } },
        },
    });
    if (!order) throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);

    await sendTemplateEmail({
        to: order.user.email,
        name: order.user.fullName,
        templateId: env.BREVO_TEMPLATE_MYFLOWER_ORDER_STATUS_ID,
        appName: "myflower",
        params: {
            orderCode: order.orderCode,
            customerName: order.customerName,
            paymentMethod: order.paymentMethod
                ? PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethodType]
                : "BELUM DIBAYAR",
            paymentProvider: order.paymentProvider ?? undefined,
            totalPrice: formatters.formatRupiah(order.totalPrice),
            orderStatus: ORDER_STATUS_LABELS[order.orderStatus as OrderStatusType],
            items: formatters.formatItemsAsList(order.items),
            status,
        },
    });
};

export const sendNewOrderNotificationToManager = async (id: string) => {
    const order = await prisma.order.findUnique({
        where: { id },
        select: {
            orderCode: true,
            customerName: true,
            customerCategory: true,
            phoneNumber: true,
            readyDate: true,
            deliveryOption: true,
            deliveryAddress: true,
            shippingCost: true,
            paymentMethod: true,
            paymentProvider: true,
            totalPrice: true,
            items: { include: { product: { select: { name: true } } } },
        },
    });
    if (!order) throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);

    await sendTemplateEmail({
        to: env.MANAGER_EMAIL,
        name: "Manager Toko Anda",
        templateId: env.BREVO_TEMPLATE_ORDER_OWNER_ID,
        appName: "myrekap",
        params: {
            orderCode: order.orderCode,
            customerName: order.customerName,
            customerCategory: order.customerCategory,
            phoneNumber: order.phoneNumber,
            readyDate: formatters.formatDateTime(order.readyDate),
            deliveryOption: DELIVERY_OPTION_LABELS[order.deliveryOption as DeliveryOptionType],
            deliveryAddress: order.deliveryAddress ?? undefined,
            shippingCost: formatters.formatRupiah(order.shippingCost),
            paymentMethod: order.paymentMethod
                ? PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethodType]
                : "BELUM DIBAYAR",
            paymentProvider: order.paymentProvider ?? undefined,
            totalPrice: formatters.formatRupiah(order.totalPrice),
            items: formatters.formatItemsAsList(order.items),
        },
    });
};
