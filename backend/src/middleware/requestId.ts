import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestId: RequestHandler = (request, response, next) => {
  const headerValue = request.header("x-request-id");
  const id = headerValue?.trim() || randomUUID();

  request.id = id;
  response.setHeader("X-Request-Id", id);
  next();
};
