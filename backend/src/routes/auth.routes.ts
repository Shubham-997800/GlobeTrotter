import { Router, type Request } from "express";
import { z } from "zod";

import { env } from "../config/env.js";
import { assertSupabaseConfigured } from "../config/env.js";
import { ApiError, asyncHandler } from "../lib/api-error.js";
import { createEphemeralAdmin, getSupabaseAdmin, getSupabaseAnon } from "../lib/supabase.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

/* ── Schemas (mirror frontend payloads) ─────────────────────────── */

const loginSchema = z.object({
  identifier: z.string().trim().min(1),
  password: z.string().min(1),
  remember: z.boolean().optional().default(true),
});

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional().default(""),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
  city: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.string().trim().url().max(2048).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."),
  adminCode: z.string().trim().optional(),
});

const forgotSchema = z.object({ email: z.string().trim().email() });

const resetSchema = z
  .object({
    /** Access token from the recovery link (`#access_token=...`). */
    accessToken: z.string().trim().min(10).optional(),
    /** OTP token_hash from a custom recovery template (paid SMTP). */
    token: z.string().trim().min(10).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(8).max(72),
  })
  .refine((v) => Boolean(v.accessToken || v.token), {
    message: "Provide either accessToken or token.",
    path: ["accessToken"],
  });

function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new ApiError(
      "INVALID_REQUEST",
      issue ? `${issue.path.join(".") || "body"}: ${issue.message}` : "Invalid request body.",
    );
  }
  return result.data;
}

/* ── Profile mapping ────────────────────────────────────────────── */

interface ProfileRow {
  id: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string | null;
}

function mapUser(row: ProfileRow, fallbackEmail: string) {
  return {
    id: row.id,
    name: row.name ?? "",
    email: fallbackEmail,
    createdAt: row.created_at ?? new Date(0).toISOString(),
    role: (row.role as "user" | "admin") ?? "user",
    avatarUrl: row.avatar_url ?? undefined,
    phone: row.phone ?? undefined,
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    bio: row.bio ?? undefined,
  };
}

async function loadProfile(userId: string, email: string, jwt?: string) {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (data) {
    // Fallback: if profile role is missing/default but user_metadata has admin, sync it.
    if (data.role !== "admin" && jwt) {
      const resp = await createEphemeralAdmin().auth.getUser(jwt);
      const metaUser = resp.data.user as unknown as Record<string, unknown> | null;
      const metaRole = (metaUser as Record<string, unknown>)?.user_metadata
        ? ((metaUser as Record<string, unknown>).user_metadata as Record<string, unknown>)?.role as string | undefined
        : undefined;
      if (metaRole === "admin" && data.role !== "admin") {
        await admin.from("profiles").update({ role: "admin" }).eq("id", userId);
        return mapUser({ ...data, role: "admin" }, email);
      }
    }
    return mapUser(data, email);
  }

  // Self-heal: auth user exists but profile row missing.
  const resp = await createEphemeralAdmin().auth.getUser(jwt);
  const metaUser = resp.data.user as unknown as Record<string, unknown> | null;
  const meta = (metaUser as Record<string, unknown>)?.user_metadata as Record<string, unknown> | undefined;
  const name =
    (meta?.full_name as string | undefined) ??
    (meta?.name as string | undefined) ??
    "";
  const metaRole = (meta?.role as string | undefined) ?? "user";
  const inserted = await admin
    .from("profiles")
    .upsert({ id: userId, name, role: metaRole }, { onConflict: "id" })
    .select("*")
    .single<ProfileRow>();
  return mapUser(
    inserted.data ?? { id: userId, name, role: metaRole, created_at: null } as ProfileRow,
    email,
  );
}

function sessionResponse(user: ReturnType<typeof mapUser>, token: string) {
  return { user, token };
}

/** Maps GoTrue errors onto the frontend's AuthErrorCode set. */
function mapAuthError(message: string): never {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    throw new ApiError("INVALID_CREDENTIALS", "Incorrect email or password. Please try again.");
  }
  if (m.includes("already registered") || m.includes("already exists")) {
    throw new ApiError("EMAIL_TAKEN", "An account with this email already exists. Try signing in instead.");
  }
  if (m.includes("not confirmed")) {
    throw new ApiError(
      "INVALID_CREDENTIALS",
      "Please confirm your email first — check your inbox for the confirmation link.",
      403,
    );
  }
  if (m.includes("rate limit")) {
    throw new ApiError("SERVER_ERROR", "Too many attempts. Please wait a minute and try again.", 429);
  }
  throw new ApiError("SERVER_ERROR", message);
}

/* ── Routes ─────────────────────────────────────────────────────── */

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    if (!assertSupabaseConfigured(res)) return;
    const payload = parseBody(loginSchema, req.body);
    const admin = getSupabaseAdmin();

    let email = payload.identifier.toLowerCase();
    if (!email.includes("@")) {
      // Identifier is a name — resolve it to the account's email via profiles.
      // Names are not unique; most recently created matching account wins
      // (mirrors the frontend mock's find() semantics).
      const { data, error } = await admin
        .from("profiles")
        .select("id")
        .ilike("name", payload.identifier)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) mapAuthError(error.message);
      if (!data || data.length !== 1) {
        throw new ApiError("INVALID_CREDENTIALS", "Incorrect email or password. Please try again.");
      }
      const { data: userRow } = await admin.rpc("get_auth_email", {
        profile_id: data[0].id,
      });
      const resolved = typeof userRow === "string" ? userRow : null;
      if (!resolved) {
        throw new ApiError("INVALID_CREDENTIALS", "Incorrect email or password. Please try again.");
      }
      email = resolved;
    }

    const { data, error } = await createEphemeralAdmin().auth.signInWithPassword({
      email,
      password: payload.password,
    });
    if (error) mapAuthError(error.message);
    if (!data.session || !data.user) {
      throw new ApiError("INVALID_CREDENTIALS", "Incorrect email or password. Please try again.");
    }

    const user = await loadProfile(data.user.id, data.user.email ?? email, data.session.access_token);

    // Bulletproof role sync: read the authoritative user record from auth
    // and force-sync the profile if needed.
    try {
      const admin = getSupabaseAdmin();
      const { data: fullUser } = await createEphemeralAdmin().auth.admin.getUserById(data.user.id);
      const authMetaRole = fullUser?.user?.user_metadata?.role as string | undefined;
      if (authMetaRole === "admin" && user.role !== "admin") {
        await admin.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
        user.role = "admin";
      }
    } catch {
      // Non-fatal — fall through with whatever role loadProfile returned
    }

    res.json(sessionResponse(user, data.session.access_token));
  }),
);

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    if (!assertSupabaseConfigured(res)) return;
    const payload = parseBody(registerSchema, req.body);
    const admin = getSupabaseAdmin();
    const name =
      `${payload.firstName} ${payload.lastName}`.trim() || payload.firstName;

    const isAdmin =
      payload.adminCode !== undefined &&
      payload.adminCode.length > 0 &&
      payload.adminCode === env.adminSecretCode;

    const { data, error } = await createEphemeralAdmin().auth.signUp({
      email: payload.email.toLowerCase(),
      password: payload.password,
      options: {
        data: {
          full_name: name,
          role: isAdmin ? "admin" : "user",
        },
      },
    });
    if (error) mapAuthError(error.message);

    // Persist the extended profile regardless of confirmation state.

    const { error: upsertError } = await admin.from("profiles").upsert(
      {
        id: data.user!.id,
        name,
        phone: payload.phone ?? null,
        city: payload.city ?? null,
        country: payload.country ?? null,
        bio: payload.bio ?? null,
        avatar_url: payload.avatarUrl ?? null,
        role: isAdmin ? "admin" : "user",
      },
      { onConflict: "id" },
    );
    if (upsertError) {
      console.error("[register] profile upsert failed:", upsertError.message);
    }

    // Belt-and-suspenders: explicitly set the role via UPDATE in case the
    // upsert silently failed or a Supabase trigger overwrote it.
    if (isAdmin) {
      const { error: roleError } = await admin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", data.user!.id);
      if (roleError) {
        console.error("[register] explicit role update failed:", roleError.message);
      }

      // Also store role in auth user_metadata as a bulletproof fallback.
      // This survives any trigger that might recreate/overwrite the profile row.
      try {
        await createEphemeralAdmin().auth.admin.updateUserById(data.user!.id, {
          user_metadata: { role: "admin" },
        });
      } catch (metaErr) {
        console.error("[register] user_metadata role update failed:", (metaErr as Error).message);
      }
    }

    if (!data.session) {
      // Email confirmation is enabled on the project.
      res.status(403).json({
        code: "EMAIL_CONFIRMATION_REQUIRED",
        message:
          "Account created! Check your inbox to confirm your email before signing in.",
      });
      return;
    }

    const user = await loadProfile(data.user!.id, data.user!.email ?? payload.email, data.session?.access_token);

    // Absolute fallback: read role from auth user record and force-sync
    if (user.role !== "admin" && isAdmin) {
      const ephemeral = createEphemeralAdmin();
      const { data: fullUser } = await ephemeral.auth.admin.getUserById(data.user!.id);
      const authRole = fullUser?.user?.user_metadata?.role as string | undefined;
      if (authRole === "admin") {
        user.role = "admin";
      }
    }

    console.log("[register] userId:", data.user!.id, "isAdmin:", isAdmin, "returnedRole:", user.role);
    res.status(201).json(sessionResponse(user, data.session.access_token));
  }),
);

authRouter.post("/logout", requireAuth, (_req, res) => {
  // JWTs are stateless; the client discards its token.
  res.status(204).send();
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: Request, res) => {
    const user = await loadProfile(req.userId!, req.authEmail!);
    const header = req.headers.authorization ?? "";
    res.json(sessionResponse(user, header.replace(/^Bearer\s+/i, "")));
  }),
);

authRouter.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    if (!assertSupabaseConfigured(res)) return;
    const payload = parseBody(forgotSchema, req.body);

    // Always resolves without revealing whether the email exists.
    try {
      await createEphemeralAdmin().auth.resetPasswordForEmail(payload.email, {
        redirectTo: env.passwordResetRedirectUrl,
      });
    } catch {
      // swallow — never leak account existence
    }
    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  }),
);

authRouter.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    if (!assertSupabaseConfigured(res)) return;
    const payload = parseBody(resetSchema, req.body);

    // Default-template flow: the emailed link redirects to the frontend with
    // `#access_token=...`; verify it, then set the new password.
    if (payload.accessToken) {
      const admin = createEphemeralAdmin();
      const { data, error } = await admin.auth.getUser(payload.accessToken);
      if (error || !data.user) {
        throw new ApiError(
          "TOKEN_INVALID",
          "This password reset link is invalid or has expired. Request a new one.",
        );
      }
      const { error: updateError } = await admin.auth.admin.updateUserById(
        data.user.id,
        { password: payload.password },
      );
      if (updateError) throw new ApiError("SERVER_ERROR", updateError.message);
      // Invalidate all sessions for this user (recovery tokens included).
      await admin.auth.admin.signOut(payload.accessToken!, "global");
      res.status(200).json({ message: "Password updated. You can sign in now." });
      return;
    }

    const anon = getSupabaseAnon();
    // Custom-template flow: recovery links carry a `token_hash` OTP.
    let verified = await anon.auth.verifyOtp({
      type: "recovery",
      token_hash: payload.token!,
    });
    if ((verified.error || !verified.data.session) && payload.email) {
      verified = await anon.auth.verifyOtp({
        type: "recovery",
        email: payload.email,
        token: payload.token!,
      });
    }
    if (verified.error || !verified.data.session || !verified.data.user) {
      throw new ApiError(
        "TOKEN_INVALID",
        "This password reset link is invalid or has expired. Request a new one.",
      );
    }

    const { error: updateError } = await anon.auth.updateUser({
      password: payload.password,
    });
    await anon.auth.signOut();
    if (updateError) {
      throw new ApiError("SERVER_ERROR", updateError.message);
    }
    res.status(200).json({ message: "Password updated. You can sign in now." });
  }),
);
