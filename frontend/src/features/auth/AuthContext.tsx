import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "./auth.service";
import {
  type AuthSession,
  type ForgotPasswordPayload,
  type LoginPayload,
  type RegisterPayload,
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
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(authService.getSession());
    setIsLoading(false);
  }, []);

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

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      isLoading,
      login,
      register,
      requestPasswordReset,
      resetPassword,
      logout,
    }),
    [
      session,
      isLoading,
      login,
      register,
      requestPasswordReset,
      resetPassword,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
