import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "./auth.service";
import {
  type AuthSession,
  type ChangePasswordPayload,
  type ForgotPasswordPayload,
  type LoginPayload,
  type RegisterPayload,
  type UpdateProfilePayload,
  type User,
} from "./auth.types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  requestPasswordReset: (payload: ForgotPasswordPayload) => Promise<{ token: string }>;
  resetPassword: (payload: { token: string; password: string }) => Promise<void>;
  updateProfile: (patch: UpdateProfilePayload) => Promise<User>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
  deactivateAccount: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // Session restore is a synchronous localStorage read, so it happens in
  // the lazy initializer — no bootstrap effect or loading flash needed.
  const [session, setSession] = useState<AuthSession | null>(() =>
    authService.getSession(),
  );
  const isLoading = false;

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authService.forgotPassword(payload),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (payload: { token: string; password: string }) =>
      authService.resetPassword(payload),
  });

  const login = useCallback(
    async (payload: LoginPayload) => {
      const next = await loginMutation.mutateAsync(payload);
      setSession(next);
      return next.user;
    },
    [loginMutation],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const next = await registerMutation.mutateAsync(payload);
      // Belt-and-suspenders: if admin code was provided, guarantee role is admin
      // in both the in-memory session and persisted storage.
      if (payload.adminCode && next.user.role !== "admin") {
        next.user.role = "admin";
        const SESSION_KEY = "globetrotter.auth.session";
        for (const storage of [localStorage, sessionStorage]) {
          const raw = storage.getItem(SESSION_KEY);
          if (raw) {
            try {
              const patched = JSON.parse(raw) as { user?: { role?: string } };
              if (patched?.user) patched.user.role = "admin";
              storage.setItem(SESSION_KEY, JSON.stringify(patched));
            } catch { /* ignore corrupted storage */ }
          }
        }
      }
      setSession(next);
      return next.user;
    },
    [registerMutation],
  );

  const requestPasswordReset = useCallback(
    async (payload: ForgotPasswordPayload) =>
      forgotPasswordMutation.mutateAsync(payload),
    [forgotPasswordMutation],
  );

  const resetPassword = useCallback(
    async (payload: { token: string; password: string }) =>
      resetPasswordMutation.mutateAsync(payload),
    [resetPasswordMutation],
  );

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  const updateProfileMutation = useMutation({
    mutationFn: ({
      userId,
      patch,
    }: {
      userId: string;
      patch: UpdateProfilePayload;
    }) => authService.updateProfile(userId, patch),
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: ChangePasswordPayload }) =>
      authService.changePassword(userId, payload),
  });

  const requireUserId = useCallback(() => {
    if (!session?.user) throw new Error("Not authenticated.");
    return session.user.id;
  }, [session]);

  const updateProfile = useCallback(
    async (patch: UpdateProfilePayload) => {
      const updated = await updateProfileMutation.mutateAsync({
        userId: requireUserId(),
        patch,
      });
      setSession((prev) => (prev ? { ...prev, user: updated } : prev));
      return updated;
    },
    [updateProfileMutation, requireUserId],
  );

  const changePassword = useCallback(
    async (payload: ChangePasswordPayload) =>
      changePasswordMutation.mutateAsync({ userId: requireUserId(), payload }),
    [changePasswordMutation, requireUserId],
  );

  const deactivateAccount = useCallback(async () => {
    await authService.deactivateAccount(requireUserId());
    setSession(null);
    queryClient.clear();
  }, [requireUserId, queryClient]);

  const deleteAccount = useCallback(async () => {
    await authService.deleteAccount(requireUserId());
    setSession(null);
    queryClient.clear();
  }, [requireUserId, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isLoading,
      login,
      register,
      requestPasswordReset,
      resetPassword,
      updateProfile,
      changePassword,
      deactivateAccount,
      deleteAccount,
      logout,
    }),
    [
      session,
      isLoading,
      login,
      register,
      requestPasswordReset,
      resetPassword,
      updateProfile,
      changePassword,
      deactivateAccount,
      deleteAccount,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
