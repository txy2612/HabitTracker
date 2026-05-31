import type { RequestHandler } from "express";
import type { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      id: string;
      validated?: unknown;
    }
  }
}

export function validate(schema: z.ZodType): RequestHandler {
  return (request, _response, next) => {
    try {
      request.validated = schema.parse({
        body: request.body,
        query: request.query,
        params: request.params,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
}
