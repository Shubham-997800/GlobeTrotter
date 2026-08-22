export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_TAKEN"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN";

export class ApiError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export interface LoginPayload {
  identifier: string;
  password: string;
  remember: boolean;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
