import { z } from "zod";

export const userBodySchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.email("Invalid email address").lowercase(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    photo: z.string().min(1, "Photo is required"),
    passwordChangedAt: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

////////////////////////////////USer route specific schemas///////////////////////////////////////
export const createUserSchema = z.object({
  body: userBodySchema,
});

export type UserType = Omit<z.infer<typeof userBodySchema>, "confirmPassword"> & { confirmPassword?: string };
