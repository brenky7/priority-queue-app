import dotenv from "dotenv";

dotenv.config();

type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const LOG_LEVEL_MAP: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const MIN_LOG_LEVEL_NAME: LogLevel =
  (process.env.LOG_LEVEL?.toUpperCase() as LogLevel) || "INFO";
const MIN_LOG_LEVEL_VALUE = LOG_LEVEL_MAP[MIN_LOG_LEVEL_NAME];

const log = (level: LogLevel, message: string, ...args: any[]) => {
  if (LOG_LEVEL_MAP[level] >= MIN_LOG_LEVEL_VALUE) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`, ...args);
  }
};

export const debug = (message: string, ...args: any[]) =>
  log("DEBUG", message, ...args);
export const info = (message: string, ...args: any[]) =>
  log("INFO", message, ...args);
export const warn = (message: string, ...args: any[]) =>
  log("WARN", message, ...args);
export const error = (message: string, ...args: any[]) =>
  log("ERROR", message, ...args);
