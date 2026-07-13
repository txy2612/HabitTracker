import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000), 
  logging:{
    // use log level from env, if missing -> use "info"
      level: process.env.LOG_LEVEL ?? "info",
      // Pretty logging is enabled unles LOG_PRETTY = the string "false"
      pretty: process.env.LOG_PRETTY !== "false",
  },
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5432/habit_tracker",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  email: {
    smtpHost: process.env.SMTP_HOST ?? "",
    smtpPort: Number(process.env.SMTP_PORT ?? 587),
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpUser: process.env.SMTP_USER ?? "",
    smtpPass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "",
  },
};
