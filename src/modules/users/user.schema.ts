import { z } from "zod";

export const userBodySchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.email("Invalid email address").lowercase(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    photo: z.string().min(1, "Photo is required"),
    passwordChangedAt: z.string().optional(),
    role: z.enum(["user", "admin", "lead-guide", "guide"]).optional().default("user"),
    passwordResetToken: z.string().optional(),
    passwordResetTokenExprire: z.date().optional(),
    _id: z.string().optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

////////////////////////////////USer route specific schemas///////////////////////////////////////
export const createUserSchema = z.object({
  body: userBodySchema,
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.email({ error: "Please enter a valid email address!" }) }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }),
  params: z.object({ token: z.string().min(1, "Please enter token") }),
});

export const updatePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Please enter current password"),
      newPassword: z.string().min(8, "New Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please enter confirm password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }),
});

export const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
    email: z.email("Invalid email address").lowercase().optional(),
  }),
});

export type UserType = Omit<z.infer<typeof userBodySchema>, "confirmPassword"> & { confirmPassword?: string };
