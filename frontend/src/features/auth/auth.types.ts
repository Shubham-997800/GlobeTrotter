export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role?: UserRole;
  avatarUrl?: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_NOT_FOUND"
  | "EMAIL_TAKEN"
  | "INVALID_REQUEST"
  | "TOKEN_INVALID"
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

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  bio?: string;
  avatarUrl?: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
