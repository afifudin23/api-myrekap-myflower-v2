import { OtpType } from "@prisma/client";
import { TypeOf, z } from "zod";

export const login = z.object({
    username: z
        .string()
        .nonempty("Username is required")
        .min(3, "Username must be at least 3 characters long")
        .max(10, "Username must be at most 10 characters long"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginType = TypeOf<typeof login>;

export const registerCustomer = z
    .object({
        fullName: z.string(),
        username: z
            .string({ required_error: "Username is required" })
            .nonempty("Username is required")
            .min(3, "Username must be at least 3 characters long")
            .max(10, "Username must be at most 10 characters long"),
        email: z.string().email(),
        phoneNumber: z.string(),
        customerCategory: z.preprocess(
            (value) => (typeof value === "string" ? value.toUpperCase() : value),
            z.enum(["UMUM", "PEMDA", "PERBANKAN"], {
                required_error: "Customer category is required",
                invalid_type_error: "Customer category must be a valid enum value",
            })
        ),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confPassword: z.string().min(6, "Password must be at least 6 characters long"),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confPassword) {
            ctx.addIssue({
                path: ["confPassword"],
                message: "Confirmation password does not match",
                code: z.ZodIssueCode.custom,
            });
        }
    });

export type RegisterCustomerType = TypeOf<typeof registerCustomer>;

export const resendUserOtp = z.object({
    email: z.string().email(),
    type: z.preprocess((val) => (typeof val === "string" ? val.toUpperCase() : val), z.nativeEnum(OtpType)),
});

export const verifyUserOtp = z.object({
    email: z.string().email(),
    type: z.preprocess((val) => (typeof val === "string" ? val.toUpperCase() : val), z.nativeEnum(OtpType)),
    code: z.string().length(6, "OTP must be 6 characters long"),
});

export const resetPassword = z
    .object({
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confPassword: z.string().min(6, "Confirmation password must be at least 6 characters long"),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confPassword) {
            ctx.addIssue({
                path: ["confPassword"],
                message: "Confirmation password does not match",
                code: z.ZodIssueCode.custom,
            });
        }
    });
