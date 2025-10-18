import { Response } from "express";
import { error as logError } from "../utils/logger";
import { environment } from "../config/environment";
import { ZodError } from "zod";

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
  let errorResponse = {
    message: "Internal server error",
    statusCode: 500,
    stack: undefined as string | undefined,
  };

  if (err instanceof AppError) {
    errorResponse.message = err.message;
    errorResponse.statusCode = err.statusCode;
    errorResponse.stack = err.stack;
  } else if (err instanceof ZodError) {
    const zodError = formatZodError(err);
    errorResponse.message = zodError.message;
    errorResponse.statusCode = zodError.statusCode;
  } else if (err instanceof Error) {
    errorResponse.message = err.message;
    errorResponse.stack = err.stack;
  }

  logError(`Error: ${errorResponse.message}`, errorResponse.stack);

  // Stack trace len v development prostredí
  if (environment.nodeEnv !== "development") {
    errorResponse.stack = undefined;
  }

  res.status(errorResponse.statusCode).json({
    message: errorResponse.message,
    stack: errorResponse.stack,
  });
};
