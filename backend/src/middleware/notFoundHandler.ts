import type { RequestHandler } from "express";
import { problemDetails } from "../shared/problemDetails.js";

export const notFoundHandler: RequestHandler = (request, response) => {
  response
    .status(404)
    .type("application/problem+json")
    .json(
      problemDetails({
        type: "https://habit-tracker.local/problems/not-found",
        title: "Not Found",
        status: 404,
        detail: `No route matches ${request.method} ${request.originalUrl}.`,
        instance: request.originalUrl,
        requestId: String(request.id),// gurantees result has type string -> satifies requestId = string
      }),
    );
};
