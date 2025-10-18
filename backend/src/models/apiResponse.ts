export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code?: string;
    details?: any;
  };
}

// Úspešná odpoveď API
export const successResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (message !== undefined) {
    response.message = message;
  }
  return response;
};

// Chybová odpoveď API
export const errorResponse = (
  message: string,
  code?: string,
  details?: any
): ApiResponse => {
  const errorObj: NonNullable<ApiResponse["error"]> = {};
  if (code !== undefined) {
    errorObj.code = code;
  }
  if (details !== undefined) {
    errorObj.details = details;
  }

  const response: ApiResponse = {
    success: false,
    error: errorObj,
  };
  if (message !== undefined) {
    response.message = message;
  }
  return response;
};
