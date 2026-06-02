//start the express app on env.port

import { app } from "./app.js"; // import app
import { env } from "./config/env.js"; // import env.port
import { startReminderCron } from "./jobs/reminderCron.js";

// starts backend(express) server and listen for incoming http requests
app.listen(env.port, () => {
  console.log(`Habit tracker API running on http://localhost:${env.port}`);
  startReminderCron();
});
