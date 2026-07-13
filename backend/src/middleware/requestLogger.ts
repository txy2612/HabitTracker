import { pinoHttp } from "pino-http";
import { logger } from "../logging/logger.js";

export const requestLogger = pinoHttp({
  logger,

  // attach existing reqId to each HTTP log
  customProps: (request) =>({
    requestId: String(request.id),
  }),

  customLogLevel: (_request, response, error) =>{
    if (error || response.statusCode >= 500) {
      return "error";
    }

    if (response.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },
});