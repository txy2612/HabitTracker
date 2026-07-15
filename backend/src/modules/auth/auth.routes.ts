import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { loginUser, registerUser } from "./auth.service.js";

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

async function register(request: Request, response: Response, next: NextFunction) {
  try {
    response.status(201).json({ message: "Registered successfully", data: await registerUser(request.body) });
  } catch (error) {
    next(error);
  }
}

async function login(request: Request, response: Response, next: NextFunction) {
  try {
    response.status(200).json({ message: "Logged in successfully", data: await loginUser(request.body) });
  } catch (error) {
    next(error);
  }
}

export const authRoutes = Router();
authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post("/login", validate(loginSchema), login);
