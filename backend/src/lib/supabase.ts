import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "../config/env.js";

/**
 * Admin client — service_role key, server-side ONLY. Bypasses RLS.
 *
 * IMPORTANT: never call `.auth.*` methods on this client. supabase-js caches
 * any signed-in session in memory and rewrites the Authorization header of
 * every subsequent data request with that user's token (breaking service-role
 * semantics). Auth operations must go through {@link createEphemeralAdmin}.
 */
let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(env.supabaseUrl ?? "", env.supabaseServiceRoleKey ?? "", {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

/**
 * Throwaway admin client for GoTrue operations (signUp, signInWithPassword,
 * getUser, admin.updateUserById, ...). Any session state it accumulates dies
 * with the instance, keeping the shared data client pristine.
 */
export function createEphemeralAdmin(): SupabaseClient {
  return createClient(env.supabaseUrl ?? "", env.supabaseServiceRoleKey ?? "", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Anonymous-key client used for flows that must run "as a user",
 * e.g. verifying a password-recovery OTP before updating the password.
 */
let anonClient: SupabaseClient | null = null;

export function getSupabaseAnon(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(env.supabaseUrl ?? "", env.supabaseAnonKey ?? "", {
      auth: { persistSession: true, autoRefreshToken: false },
    });
  }
  return anonClient;
}
