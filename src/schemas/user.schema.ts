import z, { object, string, TypeOf } from "zod";

export const create = z
    .object({
        fullName: z.string(),
        username: z.string(),
        email: z.string().email(),
        phoneNumber: z.string(),
        password: z.string().min(5),
        confPassword: z.string().min(5),
    })
    .superRefine((data, ctx) => {
        if (data.password && data.confPassword && data.password !== data.confPassword) {
            ctx.addIssue({
                path: ["password", "confPassword"],
                message: "Confirm password does not match new password",
                code: z.ZodIssueCode.custom,
            });
        }
    });
export type CreateType = TypeOf<typeof create>;

export const update = object({
    fullName: string().optional(),
    username: string().optional(),
    email: string().email().optional(),
    phoneNumber: string().optional(),
    password: string().nullish().optional(),
    confPassword: string().nullish().optional(),
}).superRefine((data, ctx) => {
    if (data.password || data.confPassword) {
        if (!data.password) {
            ctx.addIssue({
                path: ["password"],
                message: "Password is required",
                code: z.ZodIssueCode.custom,
            });
        } else if (!data.confPassword) {
            ctx.addIssue({
                path: ["confPassword"],
                message: "Confirmation password is required",
                code: z.ZodIssueCode.custom,
            });
        } else if (data.password !== data.confPassword) {
            ctx.addIssue({
                path: ["password", "confPassword"],
                message: "Confirm password does not match new password",
                code: z.ZodIssueCode.custom,
            });
        }
        data.confPassword = undefined;
    }
});

export type UpdateType = TypeOf<typeof update>;

export const updateProfile = object({
    fullName: string().optional(),
    username: string().optional(),
    email: string().email().optional(),
    phoneNumber: string().optional(),
    customerCategory: z.preprocess(
        (value) => (typeof value === "string" ? value.toUpperCase() : value),
        z
            .enum(["UMUM", "PEMDA", "PERBANKAN"], {
                required_error: "Customer category is required",
                invalid_type_error: "Customer category must be a valid enum value",
            })
            .nullish()
    ),
    oldPassword: string().optional(),
    newPassword: string().optional(),
    confPassword: string().optional(),
}).superRefine((data, ctx) => {
    const oneFilled = !!(data.oldPassword || data.newPassword || data.confPassword);
    const allFilled = !!(data.oldPassword && data.newPassword && data.confPassword);

    if (oneFilled && !allFilled) {
        if (!data.oldPassword) {
            ctx.addIssue({
                path: ["oldPassword"],
                message: "Old password is required",
                code: z.ZodIssueCode.custom,
            });
        }
        if (!data.newPassword) {
            ctx.addIssue({
                path: ["newPassword"],
                message: "New password is required",
                code: z.ZodIssueCode.custom,
            });
        }
        if (!data.confPassword) {
            ctx.addIssue({
                path: ["confPassword"],
                message: "Confirmation password is required",
                code: z.ZodIssueCode.custom,
            });
        }
    }

    if (allFilled) {
        if (data.oldPassword === data.newPassword) {
            ctx.addIssue({
                path: ["newPassword"],
                message: "New password cannot be the same as old password",
                code: z.ZodIssueCode.custom,
            });
        }

        if (data.newPassword && data.confPassword && data.newPassword !== data.confPassword) {
            ctx.addIssue({
                path: ["confPassword"],
                message: "Confirm password does not match new password",
                code: z.ZodIssueCode.custom,
            });
        }
    }
    return data;
});

export type UpdateProfileType = TypeOf<typeof updateProfile>;
