import { z } from "zod";

export const create = z.object({
    orderCode: z.string({ required_error: "Order code is required" }),
});

export const refund = z.object({
    amount: z
        .number({ required_error: "Amount is required" })
        .min(1, { message: "Amount must be greater than 0" }),
});