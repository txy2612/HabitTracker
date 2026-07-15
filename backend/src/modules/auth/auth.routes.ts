import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { loginUser, registerUser } from "./auth.service.js";

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().toLowerCase().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

type RegisterRequest = z.infer<typeof registerSchema>;
type LoginRequest = z.infer<typeof loginSchema>;

async function register(request: Request, response: Response, next: NextFunction) {
  try {
    const { body } = request.validated as RegisterRequest;
    response.status(201).json({ message: "Registered successfully", data: await registerUser(body) });
  } catch (error) {
    next(error);
  }
}

async function login(request: Request, response: Response, next: NextFunction) {
  try {
    const { body } = request.validated as LoginRequest;
    response.status(200).json({ message: "Logged in successfully", data: await loginUser(body) });
  } catch (error) {
    next(error);
  }
}

export const authRoutes = Router();
authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
