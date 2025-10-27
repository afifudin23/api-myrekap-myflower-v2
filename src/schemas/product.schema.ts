import { z } from "zod";

export const create = z.object({
    name: z.string().transform((val) => val.trim()),
    price: z.coerce.number({ invalid_type_error: "Price must be a number" }).min(1, "Price must be greater than 0"),
    description: z.string().transform((val) => val.trim()),
    isActive: z.string().transform((val) => val === "true"),
});

export type CreateType = z.infer<typeof create>;

export const update = z.object({
    name: z.string().transform((val) => val.trim()),
    price: z.coerce.number({ invalid_type_error: "Price must be a number" }).min(1, "Price must be greater than 0"),
    description: z.string().transform((val) => val.trim()),
    isActive: z.string().transform((val) => val === "true"),
    publicIdsToDelete: z.array(z.string()).optional(),
});
export type UpdateType = z.infer<typeof update>;

export const manageStock = z.object({
    type: z.preprocess(
        (val) => (typeof val === "string" ? val.toUpperCase() : val),
        z.enum(["STOCK_IN", "STOCK_OUT"], {
            invalid_type_error: "Type must be a valid enum value",
            required_error: "Type is required",
        })
    ),
    quantity: z.coerce
        .number({ invalid_type_error: "Quantity must be a number" })
        .min(1, "Quantity must be greater than 0"),
    note: z.string({ invalid_type_error: "Note must be a string" }).nonempty("Note is not empty").optional(),
});

export type ManageStockType = z.infer<typeof manageStock>;

export const createReport = z.object({
    month: z.coerce.number({ invalid_type_error: "Month must be a number" }).min(1, "Month must be greater than 0"),
    year: z.coerce.number({ invalid_type_error: "Year must be a number" }).min(1, "Year must be greater than 0"),
});
