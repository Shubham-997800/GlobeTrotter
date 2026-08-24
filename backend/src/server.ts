import app from "./app.js";
import { env } from "./config/env.js";

const missing = [
  !env.supabaseUrl && "SUPABASE_URL",
  !env.supabaseAnonKey && "SUPABASE_ANON_KEY",
  !env.supabaseServiceRoleKey && "SUPABASE_SERVICE_ROLE_KEY",
].filter(Boolean) as string[];

if (missing.length > 0) {
  console.warn(
    [
      "",
      "⚠️  Supabase is not configured — API endpoints will return 503.",
      `   Missing in backend/.env: ${missing.join(", ")}`,
      "   Fix: copy backend/.env.example to backend/.env, then fill the",
      "   values from supabase.com/dashboard → Project Settings → API.",
      "",
    ].join("\n"),
  );
}

app.listen(env.port, () => {
  console.log(
    `🌍 GlobeTrotter API ready on http://localhost:${env.port} (${env.nodeEnv})`,
  );
});
