import { z } from "zod";

export const registerSchema = z.object({
// when someone sends POST /register with name, email, pw
// these are stored in req.body (body)
// body = an object
  body: z.object({
    name: z.string().min(1, "Name is required"),// must be at least len 1
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

// TypeScript type -> other files will fig out the types from Zod Schema
export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
