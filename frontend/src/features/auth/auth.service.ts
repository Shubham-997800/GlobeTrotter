import {
  ApiError,
  type AuthSession,
  type LoginPayload,
  type SignupPayload,
  type User,
} from "./auth.types";

/**
 * Mock auth service — the ONLY place with fake auth logic.
 *
 * Swapping to a real backend (Express + PostgreSQL + Prisma):
 *   login()    → apiClient.post<AuthSession>("/auth/login", payload)
 *   signup()   → apiClient.post<AuthSession>("/auth/register", payload)
 *   logout()   → apiClient.post("/auth/logout")
 *   getSession() → GET /auth/me using the stored bearer token
 * Delete everything below the marker and keep the exported shape.
 */

const SESSION_KEY = "globetrotter.auth.session";
const MOCK_USERS_KEY = "globetrotter.mock.users";
const MOCK_LATENCY_MS = 700;

interface StoredUser extends User {
  password: string;
}

const DEMO_USER: StoredUser = {
  id: "usr_demo_001",
  name: "Demo User",
  email: "demo@globetrotter.app",
  password: "Demo@1234",
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
  const { password: _password, ...safeUser } = user;
  return {
    user: safeUser,
    token: `mock.${btoa(`${user.id}:${Date.now()}`)}`,
  };
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

  async signup(payload: SignupPayload, remember = true): Promise<AuthSession> {
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
      name: payload.name.trim(),
      email,
      password: payload.password,
      createdAt: new Date().toISOString(),
    };
    writeStoredUsers([...users, user]);
    const session = createSession(user);
    writeSession(session, remember);
    return session;
  },

  logout(): void {
    clearSession();
  },

  getSession(): AuthSession | null {
    return readSession();
  },
};
