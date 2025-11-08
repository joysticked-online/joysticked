export type IGDBAPIResponse<T> = IGDBErrorResponse | IGDBSuccessResponse<T>;

export type ValidationError = {
  field: string;
  message: string;
};

export type ErrorResponse = {
  message: string;
  validation_errors?: ValidationError[];
};

export type IGDBErrorResponse = {
  data: null;
  error: ErrorResponse;
};

export type IGDBSuccessResponse<T> = {
  data: T;
  error: null;
};
