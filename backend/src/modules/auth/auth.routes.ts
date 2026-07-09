import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { loginController, registerController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

// same as java: final Router authRoutes;
// the varaiables shouldnt point to another object later
export const authRoutes = Router();

// routes
// each corresponds to an HTP method (get, put, post, delete, patch)
// validate() -> parentheses bcz its a function, we pass para
authRoutes.post("/register", validate(registerSchema), registerController);
authRoutes.post("/login", validate(loginSchema), loginController);
