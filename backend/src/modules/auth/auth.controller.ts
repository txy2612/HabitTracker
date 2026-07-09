import type { Request, Response, NextFunction } from "express";// type for type checking (req = client's request with input, res = what we send back ltr )
import { loginUser, registerUser } from "./auth.service.js";

// Controller :
//1. receive req
//2. asks service to do work
//3. sends res back

export async function registerController(
    // parameters
    req: Request,
    res: Response,
    next: NextFunction
) {
    try{
        // Controller: "Service, here's the user data"
        // await = don't continue yet, wait for service
        const result = await registerUser(req.body);

        // send JSON back to client
        res.status(201).json({
            message: "Registered successfully",
            data: result,
        });
    }catch (error) {
        next(error);
    }
}

export async function loginController(
    req: Request,
    res: Response,
    next: NextFunction
){
    try{
        const result = await loginUser(req.body);

        res.status(200).json({
      message: "Logged in successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
