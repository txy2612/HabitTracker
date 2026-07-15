import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { problemDetails, type ProblemDetailsErrors } from "../shared/httpErrors.js";

type ErrorLike = {
  code?: unknown;
  status?: unknown;
  statusCode?: unknown;
  message?: unknown;
  type?: unknown;
  title?: unknown;
};

function isErrorLike(error: unknown): error is ErrorLike {
  return typeof error === "object" && error !== null;
}

function getNumberProperty(error: unknown, key: "status" | "statusCode"): number | undefined {
  if (!isErrorLike(error)) {
    return undefined;
  }

  const value = error[key];
  return typeof value === "number" && Number.isInteger(value) ? value : undefined;
}

function getStringProperty(error: unknown, key: "message" | "type" | "title"): string | undefined {
  if (!isErrorLike(error)) {
    return undefined;
  }

  const value = error[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getOptionalStringProperty(error: unknown, key: "code"): string | undefined {
  if (!isErrorLike(error)) {
    return undefined;
  }

  const value = error[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function isPublicStatus(status: number): boolean {
  return status >= 400 && status < 500;
}

function getDatabaseProblem(error: unknown) {
  const code = getOptionalStringProperty(error, "code");

  if (code === "ECONNREFUSED" || code === "08001" || code === "08006" || code === "57P03") {
    return {
      status: 503,
      title: "Database unavailable",
      detail: "The app could not reach PostgreSQL. Make sure PostgreSQL is running and DATABASE_URL is correct.",
      type: "https://habit-tracker.local/problems/database-unavailable",
    };
  }

  if (code === "42P01") {
    return {
      status: 500,
      title: "Database schema out of date",
      detail: "The database is missing required tables. Re-apply backend/database/schema.sql.",
      type: "https://habit-tracker.local/problems/database-schema-out-of-date",
    };
  }

  return null;
}

function formatZodErrors(error: ZodError): ProblemDetailsErrors {
  return error.issues.reduce<ProblemDetailsErrors>((errors, issue) => {
    const path = issue.path.map(String);
    const fieldPath = ["body", "query", "params"].includes(path[0] ?? "") ? path.slice(1) : path;
    const field = fieldPath.length > 0 ? fieldPath.join(".") : "request";

    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

export const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    response
      .status(400)
      .type("application/problem+json")
      .json(
        problemDetails({
          type: "https://habit-tracker.local/problems/validation-error",
          title: "Invalid request",
          status: 400,
          detail: "The request payload, query string, or route parameters are invalid.",
          instance: request.originalUrl,
          requestId: String(request.id),
          errors: formatZodErrors(error),
        }),
      );
    return;
  }

  const databaseProblem = getDatabaseProblem(error);

  if (databaseProblem) {
    request.log.error(
      {
        err: error,
        requestId: String(request.id),
        path: request.originalUrl,
      },
      "Database request failed",
    );

    response
      .status(databaseProblem.status)
      .type("application/problem+json")
      .json(
        problemDetails({
          type: databaseProblem.type,
          title: databaseProblem.title,
          status: databaseProblem.status,
          detail: databaseProblem.detail,
          instance: request.originalUrl,
          requestId: String(request.id),
        }),
      );
    return;
  }

  const status = getNumberProperty(error, "status") ?? getNumberProperty(error, "statusCode") ?? 500;
  const safeStatus = status >= 400 && status < 600 ? status : 500;
  const publicMessage = isPublicStatus(safeStatus)
    ? (getStringProperty(error, "message") ?? "The request could not be completed.")
    : "Something went wrong.";

  // Expected 4xx responses (e.g. validation, authentication, not found)
  // are normal client-side failures and should not be logged as errors.
  // Only unexpected server-side failures (5xx) are logged.
  if (safeStatus >= 500) {
    request.log.error(
      {
        err: error,
        requestId: String(request.id),
        path: request.originalUrl,
        status: safeStatus,
      },
      "Unhandled request error",
    );
  }

  response
    .status(safeStatus)
    .type("application/problem+json")
    .json(
      problemDetails({
        type: getStringProperty(error, "type") ?? "about:blank",
        title: getStringProperty(error, "title") ?? (safeStatus === 500 ? "Internal Server Error" : "Request Error"),
        status: safeStatus,
        detail: publicMessage,
        instance: request.originalUrl,
        requestId: String(request.id),
      }),
    );
};
