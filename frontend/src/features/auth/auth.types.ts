export type UserRole = "user" | "admin";

export type AccountStatus = "active" | "deactivated";

export type BudgetPreference = "budget" | "mid-range" | "luxury" | "flexible";

export type TripDurationPreference =
  | "weekend"
  | "one-week"
  | "two-weeks"
  | "longer"
  | "flexible";

export interface TravelPreferences {
  travelStyle: string[];
  favoriteDestinations: string[];
  interests: string[];
  activities: string[];
  budget: BudgetPreference;
  tripDuration: TripDurationPreference;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role?: UserRole;
  status?: AccountStatus;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  stateRegion?: string;
  country?: string;
  timezone?: string;
  bio?: string;
  preferences?: TravelPreferences;
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
  adminCode?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  avatarUrl?: string | null;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  stateRegion?: string;
  country?: string;
  timezone?: string;
  bio?: string;
  preferences?: TravelPreferences;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
