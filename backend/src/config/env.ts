import "dotenv/config";

function withFallback(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

function required(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export const env = {
  nodeEnv: withFallback("NODE_ENV", "development"),
  port: Number(withFallback("PORT", "4000")),
  corsOrigin: withFallback("CORS_ORIGIN", "http://localhost:5173"),

  supabaseUrl: required("SUPABASE_URL"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  passwordResetRedirectUrl: withFallback(
    "PASSWORD_RESET_REDIRECT_URL",
    "http://localhost:5173/reset-password",
  ),
  adminSecretCode: withFallback("ADMIN_SECRET_CODE", "globetrotter-admin-2026"),
} as const;

export type Env = typeof env;

export function assertSupabaseConfigured(res: {
  status(code: number): { json(body: unknown): void };
}): boolean {
  if (env.supabaseUrl && env.supabaseServiceRoleKey) return true;
  res.status(503).json({
    code: "CONFIG_MISSING",
    message:
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.",
  });
  return false;
}
