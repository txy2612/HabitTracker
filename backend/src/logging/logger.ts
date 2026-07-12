import pino from "pino";// pino logging lib

// checks whether backend is running in development
// developing -> readable logs; production -> JSON logs (easy for monitoring tools to search 🔎)
const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino({
    // controls which logs are shown
    // if in process.env, LOG_LEVEL=debug -> return debug 
    // ?? : use value on left unless null/undefined
    level: process.env.LOG_LEVEL ?? "info",

    // ? ternarary operator
    transport: isDevelopment
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