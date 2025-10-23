export const PAYMENT_METHOD_LABELS = {
    BANK_TRANSFER: "TRANSFER BANK",
    CASH: "TUNAI",
    CREDIT_CARD: "KARTU KREDIT",
    QRIS: "QRIS",
    EWALLET: "E-WALLET",
    CSTORE: "CSTORE",
    COD: "COD (Cash On Delivery)",
};
export type PaymentMethodType = keyof typeof PAYMENT_METHOD_LABELS;

export const ORDER_STATUS_LABELS = {
    IN_PROCESS: "DIPROSES",
    DELIVERY: "PENGIRIMAN",
    CANCELED: "BATAL",
    COMPLETED: "SELESAI",
};
export type OrderStatusType = keyof typeof ORDER_STATUS_LABELS;

export const DELIVERY_OPTION_LABELS = {
    DELIVERY: "Kirim Ke Alamat",
    SELF_PICKUP: "Ambil Di Tempat",
};
export type DeliveryOptionType = keyof typeof DELIVERY_OPTION_LABELS;
