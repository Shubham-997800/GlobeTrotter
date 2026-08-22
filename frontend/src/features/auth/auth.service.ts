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

/**
 * Mock auth service — the ONLY place with fake auth logic.
 *
 * Swapping to a real backend (Express + PostgreSQL + Prisma):
 *   login()            → apiClient.post<AuthSession>("/auth/login", payload)
 *   register()         → apiClient.post<AuthSession>("/auth/register", payload)
 *   logout()           → apiClient.post("/auth/logout")
 *   getSession()       → GET /auth/me using the stored bearer token
 *   forgotPassword()   → POST /auth/forgot-password { email } (token is emailed)
 *   resetPassword()    → POST /auth/reset-password { token, password }
 *
 * The mock returns the reset token directly so the flow stays testable
 * without an email provider; the real backend must never do that.
 * Delete everything below the marker and keep the exported shape.
 */

const SESSION_KEY = "globetrotter.auth.session";
const MOCK_USERS_KEY = "globetrotter.mock.users";
const MOCK_RESETS_KEY = "globetrotter.mock.password-resets";
const MOCK_LATENCY_MS = 700;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

interface StoredUser extends User {
  password: string;
}

interface StoredReset {
  email: string;
  token: string;
  expiresAt: number;
}

const DEMO_USER: StoredUser = {
  id: "usr_demo_001",
  name: "Demo User",
  email: "demo@globetrotter.app",
  password: "Demo@1234",
  role: "admin",
  createdAt: new Date("2026-01-01").toISOString(),
};

function readStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    if (!raw) return [DEMO_USER];
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEMO_USER];
  } catch {
    return [DEMO_USER];
  }
}

function writeStoredUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  } catch {
    // storage unavailable — mock only
  }
}

function delay(ms = MOCK_LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createSession(user: StoredUser): AuthSession {
  return {
    user: stripPassword(user),
    token: `mock.${btoa(`${user.id}:${Date.now()}`)}`,
  };
}

function stripPassword(user: StoredUser): User {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function readSession(): AuthSession | null {
  const raw =
    localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed?.user?.id && parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

function writeSession(session: AuthSession, remember: boolean): void {
  clearSession();
  const json = JSON.stringify(session);
  if (remember) {
    localStorage.setItem(SESSION_KEY, json);
  } else {
    sessionStorage.setItem(SESSION_KEY, json);
  }
  // Keep axios interceptor key in sync so real-API calls attach the token.
  (remember ? localStorage : sessionStorage).setItem(
    "globetrotter.auth.token",
    session.token,
  );
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("globetrotter.auth.token");
  sessionStorage.removeItem("globetrotter.auth.token");
}

function createResetToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/** Replaces the user inside whichever storage currently holds the session. */
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
      // corrupted session — leave as-is; readSession() guards against it
    }
    return;
  }
}

function readResets(): StoredReset[] {
  try {
    const raw = localStorage.getItem(MOCK_RESETS_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredReset[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeResets(resets: StoredReset[]): void {
  try {
    localStorage.setItem(MOCK_RESETS_KEY, JSON.stringify(resets));
  } catch {
    // storage unavailable — mock only
  }
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    await delay();
    const identifier = payload.identifier.trim().toLowerCase();
    const user = readStoredUsers().find(
      (candidate) =>
        candidate.email.toLowerCase() === identifier ||
        candidate.name.toLowerCase() === identifier,
    );
    if (!user || user.password !== payload.password) {
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "Incorrect email or password. Please try again.",
      );
    }
    const session = createSession(user);
    writeSession(session, payload.remember);
    return session;
  },

  async register(
    payload: RegisterPayload,
    remember = true,
  ): Promise<AuthSession> {
    await delay();
    const email = payload.email.trim().toLowerCase();
    const users = readStoredUsers();
    if (users.some((candidate) => candidate.email.toLowerCase() === email)) {
      throw new ApiError(
        "EMAIL_TAKEN",
        "An account with this email already exists. Try signing in instead.",
      );
    }
    const user: StoredUser = {
      id: `usr_${Date.now().toString(36)}`,
      name:
        `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim() ||
        payload.firstName.trim(),
      email,
      phone: payload.phone?.trim() || undefined,
      city: payload.city?.trim() || undefined,
      country: payload.country?.trim() || undefined,
      bio: payload.bio?.trim() || undefined,
      avatarUrl: payload.avatarUrl || undefined,
      password: payload.password,
      createdAt: new Date().toISOString(),
    };
    writeStoredUsers([...users, user]);
    const session = createSession(user);
    writeSession(session, remember);
    return session;
  },

  /** Always resolves — never reveals whether the email is registered. */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ token: string }> {
    await delay();
    const email = payload.email.trim().toLowerCase();
    const token = createResetToken();
    const resets = readResets().filter(
      (reset) =>
        reset.email !== email && reset.expiresAt > Date.now(),
    );
    writeResets([
      ...resets,
      { email, token, expiresAt: Date.now() + RESET_TOKEN_TTL_MS },
    ]);
    // Real backend: email `{ token }` to the user instead of returning it.
    return { token };
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await delay();
    const resets = readResets();
    const reset = resets.find((candidate) => candidate.token === payload.token);
    if (!reset || reset.expiresAt < Date.now()) {
      throw new ApiError(
        "TOKEN_INVALID",
        "This password reset link is invalid or has expired. Request a new one.",
      );
    }
    const users = readStoredUsers();
    const userIndex = users.findIndex(
      (candidate) => candidate.email.toLowerCase() === reset.email,
    );
    if (userIndex === -1) {
      throw new ApiError(
        "ACCOUNT_NOT_FOUND",
        "This password reset link is invalid or has expired. Request a new one.",
      );
    }
    users[userIndex] = { ...users[userIndex], password: payload.password };
    writeStoredUsers(users);
    writeResets(resets.filter((candidate) => candidate.token !== reset.token));
  },

  async updateProfile(
    userId: string,
    patch: UpdateProfilePayload,
  ): Promise<User> {
    await delay();
    const users = readStoredUsers();
    const index = users.findIndex((candidate) => candidate.id === userId);
    if (index === -1) {
      throw new ApiError(
        "ACCOUNT_NOT_FOUND",
        "This account no longer exists.",
      );
    }
    const { avatarUrl, ...rest } = patch;
    const next: StoredUser = {
      ...users[index],
      ...rest,
      ...(avatarUrl === null
        ? { avatarUrl: undefined }
        : avatarUrl !== undefined
          ? { avatarUrl }
          : {}),
    };
    users[index] = next;
    writeStoredUsers(users);
    refreshSessionUser(stripPassword(next));
    return stripPassword(next);
  },

  async changePassword(
    userId: string,
    payload: ChangePasswordPayload,
  ): Promise<void> {
    await delay();
    const users = readStoredUsers();
    const index = users.findIndex((candidate) => candidate.id === userId);
    if (index === -1) {
      throw new ApiError(
        "ACCOUNT_NOT_FOUND",
        "This account no longer exists.",
      );
    }
    if (users[index].password !== payload.currentPassword) {
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "Your current password is incorrect.",
      );
    }
    users[index] = { ...users[index], password: payload.newPassword };
    writeStoredUsers(users);
  },

  async deactivateAccount(userId: string): Promise<void> {
    await delay();
    const users = readStoredUsers();
    const index = users.findIndex((candidate) => candidate.id === userId);
    if (index === -1) {
      throw new ApiError(
        "ACCOUNT_NOT_FOUND",
        "This account no longer exists.",
      );
    }
    users[index] = { ...users[index], status: "deactivated" };
    writeStoredUsers(users);
    clearSession();
  },

  async deleteAccount(userId: string): Promise<void> {
    await delay();
    writeStoredUsers(
      readStoredUsers().filter((candidate) => candidate.id !== userId),
    );
    clearSession();
  },

  logout(): void {
    clearSession();
  },

  getSession(): AuthSession | null {
    return readSession();
  },
};
