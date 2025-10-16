import { brevo, env, prisma } from "@/config";
import ErrorCode from "@/constants/error-code";
import { BadRequestException } from "@/exceptions";
import { formatters } from "@/utils";
import { OtpType } from "@prisma/client";
import { addMinutes } from "date-fns";
import crypto from "crypto";
import { AppNameType } from "@/middlewares";

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
    } catch (err: any) {
        console.error("❌ Failed to send email:", err.response?.body || err);
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

// export const sendUpdateOrderStatusEmail = async (data: any) => {
//     const { user, customerName, orderCode, orderStatus, paymentMethod, paymentProvider, totalPrice, items } = data;

//     await sendTemplateEmail({
//         to: user.email,
//         name: user.fullName,
//         templateId: 5,
//         appName,
//         params: {
//             customerName,
//             orderCode,
//             orderStatus: ORDER_STATUS_LABELS[orderStatus],
//             paymentMethod: PAYMENT_METHOD_LABELS[paymentMethod],
//             paymentProvider: paymentProvider ? paymentProvider : "-",
//             totalPrice: formatters.formatRupiah(totalPrice),
//             items: formatters.formatItemsAsList(items),
//         },
//     });
// };

// export const sendCustomerOrderStatusEmail = async (user: any, method: string, data: any) => {
//     const { customerName, orderCode, orderStatus, paymentMethod, paymentProvider, totalPrice, items } = data;

//     await sendTemplateEmail({
//         to: user.email,
//         name: user.fullName,
//         templateId: 6,
//         appName,
//         params: {
//             method,
//             customerName,
//             orderCode,
//             orderStatus: ORDER_STATUS_LABELS[orderStatus],
//             paymentMethod: paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : "-",
//             paymentProvider: paymentProvider ? paymentProvider : "-",
//             totalPrice: formatters.formatRupiah(totalPrice),
//             items: formatters.formatItemsAsList(items),
//         },
//     });
// };
