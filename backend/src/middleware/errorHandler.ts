import { Response } from "express";
import { error as logError } from "../utils/logger";
import { environment } from "../config/environment";
import { ZodError } from "zod";
import { errorResponse } from "../models/apiResponse";

// Trieda pre chyby aplikácie
export class AppError extends Error {
  constructor(public override message: string, public statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handler pre Zod chyby
export const formatZodError = (err: ZodError) => {
  return {
    message: "Validation error",
    statusCode: 400,
    errors: err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
};

// Globálny error handler middleware
export const globalErrorHandler = (err: unknown, res: Response) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errorDetails: any = undefined; // Pre detaily chyby
  let errorCode: string | undefined = undefined;
  let stack: string | undefined = undefined;

  if (err instanceof ZodError) {
    const zodErrorDetails = formatZodError(err);
    statusCode = zodErrorDetails.statusCode;
    message = zodErrorDetails.message;
    errorDetails = zodErrorDetails.errors; // Detaily validácie
    errorCode = "VALIDATION_FAILED";
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorCode = "APPLICATION_ERROR";
  } else if (err instanceof Error) {
    message = err.message;
    stack = err.stack;
    errorCode = "GENERIC_ERROR";
  } else {
    // Neznámy typ chyby
    message = String(err);
    errorCode = "UNKNOWN_ERROR";
  }

  logError(`Error: ${message}`, stack);

  // Chybová odpoveď
  const apiErrorResponse = errorResponse(
    message,
    errorCode,
    errorDetails ||
      (environment.nodeEnv === "development" ? { stack } : undefined) // Stack len vo vývoji
  );

  // Stack trace iba vo vývoji
  if (environment.nodeEnv !== "development") {
    delete apiErrorResponse.error?.details?.stack;

    res.status(statusCode).json(apiErrorResponse);
  }
};
