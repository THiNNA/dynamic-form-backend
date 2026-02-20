export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors?: any;

  constructor(statusCode: number, message: string, errors?: any, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
