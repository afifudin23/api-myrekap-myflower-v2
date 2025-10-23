import { z } from "zod";

const itemSchema = z.object({
    productId: z
        .string({ invalid_type_error: "productId must be a string", required_error: "productId is required" })
        .nonempty("productId is required"),
    quantity: z.coerce.number().positive("Quantity must be a positive number"),
    message: z.string({ invalid_type_error: "Message must be a string" }).nonempty("Message is not empty").nullish(),
});

export const create = z
    .object({
        customerName: z.string({
            invalid_type_error: "Customer name must be a string",
            required_error: "Customer name is required",
        }),
        customerCategory: z.preprocess(
            (value) => (typeof value === "string" ? value.toUpperCase() : value),
            z.enum(["UMUM", "PEMDA", "PERBANKAN"], {
                required_error: "Customer category is required",
                invalid_type_error: "Customer category must be a valid enum value",
            })
        ),
        phoneNumber: z
            .string({ invalid_type_error: "Phone number must be a string", required_error: "Phone number is required" })
            .nonempty("Phone number is required"),
        items: z
            .string()
            .transform((val) => {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [parsed];
            })
            .pipe(z.array(itemSchema)),
        readyDate: z.coerce.date(),
        deliveryOption: z.preprocess(
            (value) => (typeof value === "string" ? value.toUpperCase() : value),
            z.enum(["SELF_PICKUP", "DELIVERY"], {
                required_error: "Delivery option is required",
                invalid_type_error: "Delivery option must be a valid enum value",
            })
        ),
        deliveryAddress: z
            .string({ invalid_type_error: "Delivery address must be a string" })
            .transform((val) => (val === "" ? null : val))
            .nullish(),
        shippingCost: z.coerce.number().positive("Shipping cost must be a positive number").default(0),
        isPaid: z
            .string()
            .transform((val) => val.toLowerCase())
            .refine((val) => ["true", "false"].includes(val), {
                message: "isPaid must be either 'true' or 'false'",
            })
            .transform((val) => val === "true"),
        paymentMethod: z.preprocess(
            (val) => (typeof val === "string" ? val.toUpperCase() : val),
            z
                .enum(["CASH", "BANK_TRANSFER"], {
                    invalid_type_error: "Payment method must be a valid enum value",
                    required_error: "Payment method is required",
                })
                .nullish()
        ),
    })
    .superRefine((data, ctx) => {
        // If delivery option is "SELF_PICKUP", set delivery address to null
        if (data.deliveryOption === "DELIVERY") {
            if (!data.deliveryAddress) {
                ctx.addIssue({
                    path: ["deliveryAddress"],
                    code: z.ZodIssueCode.custom,
                    message: "Delivery address is required for delivery",
                });
            } else if (!data.shippingCost) {
                ctx.addIssue({
                    path: ["shippingCost"],
                    code: z.ZodIssueCode.custom,
                    message: "Shipping cost is required for delivery",
                });
            }
        } else if (data.deliveryOption === "SELF_PICKUP") {
            data.deliveryAddress = null;
            data.shippingCost = 0;
        }

        // Check if payment method is provided for paid orders
        // 1. isPaid is true but paymentMethod is null
        if (data.isPaid && !data.paymentMethod) {
            ctx.addIssue({
                path: ["paymentMethod"],
                code: z.ZodIssueCode.custom,
                message: "Payment method is required for paid orders",
            });
        }
        // 2. isPaid is false and paymentMethod is null
        else if (!data.isPaid && !data.paymentMethod) {
            data.paymentMethod = null;
        }
        // 3. isPaid is false but paymentMethod is defined
        else if (!data.isPaid && data.paymentMethod) {
            ctx.addIssue({
                path: ["isPaid"],
                code: z.ZodIssueCode.custom,
                message: "IsPaid must be true if payment method is provided",
            });
        }
    });

export type CreateType = z.infer<typeof create>;

export const update = z
    .object({
        customerName: z.string({
            invalid_type_error: "Customer name must be a string",
            required_error: "Customer name is required",
        }),
        customerCategory: z.preprocess(
            (value) => (typeof value === "string" ? value.toUpperCase() : value),
            z.enum(["UMUM", "PEMDA", "PERBANKAN"], {
                required_error: "Customer category is required",
                invalid_type_error: "Customer category must be a valid enum value",
            })
        ),
        phoneNumber: z
            .string({ invalid_type_error: "Phone number must be a string", required_error: "Phone number is required" })
            .nonempty("Phone number is required"),
        items: z
            .string()
            .transform((val) => {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [parsed];
            })
            .pipe(z.array(itemSchema)),
        readyDate: z.coerce.date(),
        deliveryOption: z.preprocess(
            (value) => (typeof value === "string" ? value.toUpperCase() : value),
            z.enum(["SELF_PICKUP", "DELIVERY"], {
                required_error: "Delivery option is required",
                invalid_type_error: "Delivery option must be a valid enum value",
            })
        ),
        deliveryAddress: z
            .string({ invalid_type_error: "Delivery address must be a string" })
            .transform((val) => (val === "" ? null : val))
            .nullish(),
        shippingCost: z.coerce.number().positive("Shipping cost must be a positive number").optional(),
        isPaid: z
            .string()
            .transform((val) => val.toLowerCase())
            .refine((val) => ["true", "false"].includes(val), {
                message: "isPaid must be either 'true' or 'false'",
            })
            .transform((val) => val === "true"),
        paymentMethod: z
            .preprocess(
                (val) => (typeof val === "string" ? val.toUpperCase() : val),
                z.enum(["CASH", "BANK_TRANSFER"], {
                    invalid_type_error: "Payment method must be a valid enum value",
                    required_error: "Payment method is required",
                })
            )
            .nullish(),
    })
    .superRefine((data, ctx) => {
        // If delivery option is "SELF_PICKUP", set delivery address to null
        if (data.deliveryOption === "DELIVERY") {
            if (!data.deliveryAddress) {
                ctx.addIssue({
                    path: ["deliveryAddress"],
                    code: z.ZodIssueCode.custom,
                    message: "Delivery address is required for delivery",
                });
            } else if (!data.shippingCost) {
                ctx.addIssue({
                    path: ["shippingCost"],
                    code: z.ZodIssueCode.custom,
                    message: "Shipping cost is required for delivery",
                });
            }
        } else if (data.deliveryOption === "SELF_PICKUP") {
            data.deliveryAddress = null;
            data.shippingCost = 0;
        }
        // Check if payment method is provided for paid orders
        // 1. isPaid is true but paymentMethod is null
        if (data.isPaid && !data.paymentMethod) {
            ctx.addIssue({
                path: ["paymentMethod"],
                code: z.ZodIssueCode.custom,
                message: "Payment method is required for paid orders",
            });
        }
        // 2. isPaid is false and paymentMethod is null
        else if (!data.isPaid && !data.paymentMethod) {
            data.paymentMethod = null;
        }
        // 3. isPaid is false but paymentMethod is defined
        else if (!data.isPaid && data.paymentMethod) {
            ctx.addIssue({
                path: ["isPaid"],
                code: z.ZodIssueCode.custom,
                message: "IsPaid must be true if payment method is provided",
            });
        }
    });
export type UpdateType = z.infer<typeof update>;

export const updateOrderStatus = z.object({
    status: z.preprocess(
        (value) => (typeof value === "string" ? value.toUpperCase() : value),
        z.enum(["COMPLETED", "DELIVERY", "IN_PROCESS", "CANCELED"], {
            required_error: "Order status is required",
            invalid_type_error: "Order status must be a valid enum value",
        })
    ),
});

export type UpdateOrderStatusType = z.infer<typeof updateOrderStatus>;