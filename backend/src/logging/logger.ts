import pino from "pino";// pino logging lib
import { env } from "../config/env.js";

// checks whether backend is running in development
// developing -> readable logs; production -> JSON logs (easy for monitoring tools to search 🔎)
const usePrettyLogs = env.logging.pretty;

export const logger = pino({
    // controls which logs are shown
    // if in process.env, LOG_LEVEL=debug -> return debug 
    // ?? : use value on left unless null/undefined
    level: env.logging.level,

    // tells pino not to print sensitive values
    // etc: password: "[Redacted]"
    redact: {
        paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "password",
        "smtpPass",
        ],
        censor: "[Redacted]",
    },

    // ? ternarary operator
    transport: usePrettyLogs
    ? {
        target: "pino-pretty",
        options: {
            colorize: true,//add color
            translateTime: "SYS:standard",// convert to readable time stamp format
            ignore: "pid,hostname",//hides process id and computer hostname
        },
    }
    : undefined,
})