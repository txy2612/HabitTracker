import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../shared/httpErrors.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret_change_me";
type AuthPayload = { userId: string };

export const requireAuth: RequestHandler = (request, _response, next) => {
  try {
    const authorization = request.header("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpError(401, "Authentication required.", { title: "Unauthorized", type: "https://habit-tracker.local/problems/unauthorized" });
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
      throw new HttpError(401, "Authentication required.", { title: "Unauthorized", type: "https://habit-tracker.local/problems/unauthorized" });
    }

    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    request.user = { id: payload.userId };
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    next(new HttpError(401, "Invalid or expired token.", { title: "Unauthorized", type: "https://habit-tracker.local/problems/unauthorized" }));
  }
};
