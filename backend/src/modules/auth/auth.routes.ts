import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { loginUser, loginWithGoogle, registerUser } from "./auth.service.js";

/* Imports ⭐:
   1.Zod lets us define schemas 
   2.validate (middleware): take Zod schema and check whether req matches it 
   3.imports business logic (hire postman)

 */

/* The file does 4 things: (sounds like post office + postman) ⭐
 1. receive HTTP req (person go to post office & ask writer to write)
 2. validate input (person says, writer try to check grammar)
 3. calls service (writer pass letter to postman)
 4. sends response back (writer pass responds letter to the person)
*/

/* 4 parts in this file:
1. schema
2. infer
3. controller
4. register endpoint
 */
// 1. schema
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

const googleLoginSchema = z.object({
  body: z.object({
    credential: z.string().trim().min(1, "Google credential is required"),
  }),
});

// 2.infer
type RegisterRequest = z.infer<typeof registerSchema>;
type LoginRequest = z.infer<typeof loginSchema>;
type GoogleLoginRequest = z.infer<typeof googleLoginSchema>;

// 3. controllers
async function register(request: Request, response: Response, next: NextFunction) {
  try {
    const { body } = request.validated as RegisterRequest;
    response.status(201).json({ message: "Registered successfully", data: await registerUser(body) });
  } catch (error) {
    next(error);
  }
}

async function googleLogin(
  request: Request,
  response: Response,
  next: NextFunction,
){
  try{
    const { body } = request.validated as GoogleLoginRequest;

    response.status(200).json({
      message: "Logged in with Google successfully",
      data: await loginWithGoogle(body),
    });
  }catch(error){
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

//4. register end point
//creates a router (mini receptionist)
export const authRoutes = Router();
// because you need schema to register, so register last (you need writer to write b4 you want to send letter)
authRoutes.post("/register", validate(registerSchema), register);
authRoutes.post(
  "/google", validate(googleLoginSchema), googleLogin,
);
authRoutes.post("/login", validate(loginSchema), login);
