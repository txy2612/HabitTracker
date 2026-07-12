//start the express app on env.port

import { app } from "./app.js"; // import app
import { env } from "./config/env.js"; // import env.port
import { startReminderCron } from "./jobs/reminderCron.js";
import { logger } from "./logging/logger.js";

// starts backend(express) server and listen for incoming http requests
app.listen(env.port, () => {
  logger.info(`Habit tracker API running on http://localhost:${env.port}`);
  startReminderCron();
});

logger.debug("Debug logging is enabled");
logger.info("Logger initialized.");
