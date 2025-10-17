import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Environment variable schema
const envSchema = z.object({
  PORT: z.string().default("5050"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  TASK_PROCESS_INTERVAL_MS: z.string().default("10000"),
  TASK_PROGRESS_INCREMENT_MIN: z.string().default("10"),
  TASK_PROGRESS_INCREMENT_MAX: z.string().default("20"),
  AGING_FACTOR: z.string().default("10000"),
  LOG_LEVEL: z.enum(["DEBUG", "INFO", "WARN", "ERROR"]).default("INFO"),
  API_TASK_ADD_LIMIT_WINDOW_MS: z.string().default("60000"),
  API_TASK_ADD_LIMIT_MAX_REQUESTS: z.string().default("10"),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export environment variables
export const environment = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  frontendUrl: env.FRONTEND_URL,
  taskProcessIntervalMs: parseInt(env.TASK_PROCESS_INTERVAL_MS, 10),
  taskProgressIncrementMin: parseInt(env.TASK_PROGRESS_INCREMENT_MIN, 10),
  taskProgressIncrementMax: parseInt(env.TASK_PROGRESS_INCREMENT_MAX, 10),
  agingFactor: parseInt(env.AGING_FACTOR, 10),
  logLevel: env.LOG_LEVEL,
  apiTaskAddLimitWindowMs: parseInt(env.API_TASK_ADD_LIMIT_WINDOW_MS, 10),
  apiTaskAddLimitMaxRequests: parseInt(env.API_TASK_ADD_LIMIT_MAX_REQUESTS, 10),
};
