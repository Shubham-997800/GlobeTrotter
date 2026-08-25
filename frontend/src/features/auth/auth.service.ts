import {
  ApiError,
  type AuthSession,
  type ChangePasswordPayload,
  type ForgotPasswordPayload,
  type LoginPayload,
  type RegisterPayload,
  type ResetPasswordPayload,
  type UpdateProfilePayload,
  type User,
} from "./auth.types";
import { apiClient } from "@/services/api/client";

const SESSION_KEY = "globetrotter.auth.session";
const AUTH_TOKEN_KEY = "globetrotter.auth.token";

function readSession(): AuthSession | null {
  const raw =
    localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.user?.id || !parsed?.token) return null;
    // Sync the separate token key so the apiClient interceptor can find it.
    const isRemember = localStorage.getItem(SESSION_KEY) !== null;
    const store = isRemember ? localStorage : sessionStorage;
    if (!store.getItem(AUTH_TOKEN_KEY)) {
      store.setItem(AUTH_TOKEN_KEY, parsed.token);
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession, remember: boolean): void {
  clearSession();
  const json = JSON.stringify(session);
  if (remember) {
    localStorage.setItem(SESSION_KEY, json);
    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  } else {
    sessionStorage.setItem(SESSION_KEY, json);
    sessionStorage.setItem(AUTH_TOKEN_KEY, session.token);
  }
}

function handleAuthError(err: unknown, fallback: string): never {
  if (err instanceof ApiError) throw err;

  // Axios error with a server response
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err
  ) {
    const resp = (err as { response?: { status?: number; data?: unknown } }).response;
    const status = resp?.status;
    const data = resp?.data;

    // Backend returned structured JSON error
    if (data && typeof data === "object" && "code" in (data as Record<string, unknown>)) {
      const body = data as { code?: string; message?: string };
      throw new ApiError(
        (body.code as AuthErrorCode) ?? "SERVER_ERROR",
        body.message ?? fallback,
      );
    }

    // Backend returned something but not our shape (Render cold start HTML, 503, etc.)
    if (status === 503) {
      throw new ApiError("SERVER_ERROR", "Server is starting up. Please wait a moment and try again.");
    }
    if (status && status >= 400) {
      throw new ApiError("SERVER_ERROR", `Server error (${status}). Please try again.`);
    }
  }

  // Axios timeout or network failure
  if (typeof err === "object" && err !== null && "code" in (err as Record<string, unknown>)) {
    const code = (err as { code?: string }).code;
    if (code === "ECONNABORTED" || code === "ERR_NETWORK") {
      throw new ApiError("NETWORK_ERROR", "Unable to reach the server. Please check your connection and try again.");
    }
  }

  throw new ApiError("NETWORK_ERROR", fallback);
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

function refreshSessionUser(user: User): void {
  for (const storage of [localStorage, sessionStorage]) {
    const raw = storage.getItem(SESSION_KEY);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed?.user?.id === user.id) {
        storage.setItem(
          SESSION_KEY,
          JSON.stringify({ ...parsed, user }),
        );
      }
    } catch {
      // corrupted session — leave as-is
    }
    return;
  }
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<AuthSession>("/auth/login", {
        identifier: payload.identifier.trim(),
        password: payload.password,
      });
      writeSession(data, payload.remember);
      return data;
    } catch (err) {
      handleAuthError(err, "Unable to reach the server. Check your connection.");
    }
  },

  async register(
    payload: RegisterPayload,
    remember = true,
  ): Promise<AuthSession> {
    try {
      const { data } = await apiClient.post<AuthSession>("/auth/register", {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim(),
        phone: payload.phone?.trim() || undefined,
        city: payload.city?.trim() || undefined,
        country: payload.country?.trim() || undefined,
        bio: payload.bio?.trim() || undefined,
        avatarUrl: payload.avatarUrl || undefined,
        password: payload.password,
        adminCode: payload.adminCode || undefined,
      });
      writeSession(data, remember);
      return data;
    } catch (err) {
      handleAuthError(err, "Registration failed. Please try again.");
    }
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ token: string }> {
    try {
      const { data } = await apiClient.post<{ token: string }>("/auth/forgot-password", {
        email: payload.email.trim(),
      });
      return data;
    } catch (err) {
      handleAuthError(err, "Failed to send reset email.");
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    try {
      await apiClient.post("/auth/reset-password", {
        token: payload.token,
        password: payload.password,
      });
    } catch (err) {
      handleAuthError(err, "Failed to reset password.");
    }
  },

  async updateProfile(
    _userId: string,
    patch: UpdateProfilePayload,
  ): Promise<User> {
    try {
      const { data } = await apiClient.patch<{ user: User }>("/auth/me", patch);
      refreshSessionUser(data.user);
      return data.user;
    } catch {
      // Fallback: update locally if backend doesn't support profile patch yet
      const session = readSession();
      if (!session) {
        throw new ApiError("ACCOUNT_NOT_FOUND", "No active session.");
      }
      const updated: User = {
        ...session.user,
        ...patch,
        avatarUrl: patch.avatarUrl === null ? undefined : (patch.avatarUrl ?? session.user.avatarUrl),
      };
      refreshSessionUser(updated);
      return updated;
    }
  },

  async changePassword(
    _userId: string,
    payload: ChangePasswordPayload,
  ): Promise<void> {
    try {
      await apiClient.post("/auth/change-password", {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      });
    } catch (err) {
      handleAuthError(err, "Failed to change password.");
    }
  },

  async deactivateAccount(userId: string): Promise<void> {
    try {
      await apiClient.post(`/auth/deactivate`, { userId });
    } catch {
      // Fallback: clear session locally
    }
    clearSession();
  },

  async deleteAccount(userId: string): Promise<void> {
    try {
      await apiClient.delete(`/auth/account`, { data: { userId } });
    } catch {
      // Fallback: clear session locally
    }
    clearSession();
  },

  logout(): void {
    clearSession();
  },

  getSession(): AuthSession | null {
    return readSession();
  },
};

type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_NOT_FOUND"
  | "EMAIL_TAKEN"
  | "EMAIL_CONFIRMATION_REQUIRED"
  | "INVALID_REQUEST"
  | "TOKEN_INVALID"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN";
