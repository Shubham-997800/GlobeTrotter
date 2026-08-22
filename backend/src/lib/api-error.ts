import type { NextFunction, Request, Response } from "express";

export type ApiErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_NOT_FOUND"
  | "EMAIL_TAKEN"
  | "INVALID_REQUEST"
  | "TOKEN_INVALID"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFIG_MISSING"
  | "SERVER_ERROR";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  INVALID_CREDENTIALS: 401,
  ACCOUNT_NOT_FOUND: 404,
  EMAIL_TAKEN: 409,
  INVALID_REQUEST: 400,
  TOKEN_INVALID: 400,
  UNAUTHORIZED: 401,
  RATE_LIMITED: 429,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFIG_MISSING: 503,
  SERVER_ERROR: 500,
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status ?? STATUS_BY_CODE[code];
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
