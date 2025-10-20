import ErrorCode from "@/constants/error-code";
import { NotFoundException } from "@/exceptions";
import { cloudinary, prisma } from "@/config";

export const deletePaymentProofByOrderSummaryId = async (orderId: string) => {
    try {
        const paymentProof = await prisma.orderImage.findUnique({ where: { orderId_type: { orderId, type: "PAYMENT_PROOF" } } });
        if (paymentProof) {
            const data = await prisma.orderImage.delete({ where: { orderId_type: { orderId, type: "PAYMENT_PROOF" } } });
            await cloudinary.uploader.destroy(data.publicId);
            return data;
        }
        return true;
    } catch (_error) {
        throw new NotFoundException("Order summary not found", ErrorCode.ORDER_NOT_FOUND);
    }
};
