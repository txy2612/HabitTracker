//start the express app on env.port

import { app } from "./app.js"; // import app
import { env } from "./config/env.js"; // import env.port
import { startReminderCron, stopReminderCron } from "./jobs/reminderCron.js";
import { logger } from "./logging/logger.js";

/*
// starts backend(express) server and listen for incoming http requests
app.listen(env.port, () => {
  logger.info(`Habit tracker API running on http://localhost:${env.port}`);
  startReminderCron();
});

logger.debug("Debug logging is enabled");
logger.info("Logger initialized.");
*/

// store server instance -> can close properly later
/* app.listen(2 arguments):
  arg1: port - 300/500 dependig on env file -> listen to this port
  arg2: arrow func -> when server starts, execute this
*/
const server = app.listen(env.port, () => {
  logger.info(
    {
      port: env.port,// argument1: object
    },
    "Habit tracker API started",// argument 2: message
  );

  startReminderCron();
});

// wait for signal to shutdown
function shutdown(signal: string) {
  logger.info({ signal }, "Shutdown signal received");

  stopReminderCron();//1.

  server.close((error) => {//2. close server
    if (error) {
      logger.error({ err: error }, "Failed to close HTTP server");
      process.exit(1);
    }

    logger.info("HTTP server closed");
    process.exit(0);//ends Node process (if evth ends well)
    // exit(0) -> evth ends well -> normal shutdown
    // exit(1) -> the app crash -> abnormal exit (might restart)
  });
}

// When SIGINT/SIGTERM received -> shut down
process.on("SIGTERM", () => shutdown("SIGTERM"));//SIGTERM sent by Docker/ Cloud platforms
process.on("SIGINT", () => shutdown("SIGINT"));// SIGINT 

/* uncaughtException unhandledRejection 
  Logs fatal failures that escaped normal error handling
*/
process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);// process may be in unreliable state -> exit is safer
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  process.exit(1);
});