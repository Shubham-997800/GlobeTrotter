import "dotenv/config";

function withFallback(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  nodeEnv: withFallback("NODE_ENV", "development"),
  port: Number(withFallback("PORT", "4000")),
  corsOrigin: withFallback("CORS_ORIGIN", "http://localhost:5173"),
} as const;

export type Env = typeof env;
