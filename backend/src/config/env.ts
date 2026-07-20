import dotenv from "dotenv";

dotenv.config();

// Remove fallback JWT secret
// Step1 : JWT validation
function requireEnvironmentVariable(name: string): string{
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const jwtSecret = requireEnvironmentVariable("JWT_SECRET");

if (jwtSecret.length < 32){
  throw new Error("JWT_SECRET must contain at least 32 characters.");
}

export const env = {
  port: Number(process.env.PORT ?? 4000), 
  jwtSecret,
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",// other files can 'env.googleClientId'
  // instead of repeatedly accessing 'process.evn.GOOGLE_CLIENT_ID'
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
