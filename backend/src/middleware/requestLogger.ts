import { pinoHttp } from "pino-http";
import { logger } from "../logging/logger.js";

export const requestLogger = pinoHttp({
  logger,
});