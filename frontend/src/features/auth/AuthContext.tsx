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
import type { AuthSession, LoginPayload, SignupPayload, User } from "./auth.types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<User>;
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

  const signupMutation = useMutation({
    mutationFn: (payload: SignupPayload) => authService.signup(payload),
  });

  const login = useCallback(
    async (payload: LoginPayload) => {
      const next = await loginMutation.mutateAsync(payload);
      setSession(next);
      return next.user;
    },
    [loginMutation],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const next = await signupMutation.mutateAsync(payload);
      setSession(next);
      return next.user;
    },
    [signupMutation],
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
      signup,
      logout,
    }),
    [session, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
