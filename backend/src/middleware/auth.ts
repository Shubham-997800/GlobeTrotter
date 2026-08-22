import { createHash } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

import { getSupabaseAdmin } from "../lib/supabase.js";
import { ApiError } from "../lib/api-error.js";
import { assertSupabaseConfigured } from "../config/env.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      authEmail?: string;
    }
  }
}

/**
 * Short-TTL cache of verified tokens. Saves a GoTrue round-trip per
 * request and keeps bursts (SPA refetch storms, test suites) under
 * GoTrue's per-IP rate limits. Tokens are 1-hour JWTs, so a 60s trust
 * window does not meaningfully extend revocation latency.
 */
const CACHE_TTL_MS = 60_000;
const CACHE_MAX_ENTRIES = 1_000;

interface CachedIdentity {
  userId: string;
  email: string;
  expiresAt: number;
}

const verifiedTokens = new Map<string, CachedIdentity>();

function cacheKey(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function cachedIdentity(key: string): CachedIdentity | null {
  const hit = verifiedTokens.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    verifiedTokens.delete(key);
    return null;
  }
  return hit;
}

function rememberIdentity(key: string, identity: CachedIdentity): void {
  if (verifiedTokens.size >= CACHE_MAX_ENTRIES) {
    const oldest = verifiedTokens.keys().next().value;
    if (oldest !== undefined) verifiedTokens.delete(oldest);
  }
  verifiedTokens.set(key, identity);
}

async function verifyWithGoTrue(
  token: string,
): Promise<{ userId: string; email: string }> {
  const attempt = () =>
    getSupabaseAdmin().auth.getUser(token);

  let { data, error } = await attempt();

  // Transient throttling — one paced retry before giving up.
  if (error && /rate|too many/i.test(error.message)) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    ({ data, error } = await attempt());
  }

  if (error && /rate|too many/i.test(error.message)) {
    throw new ApiError(
      "RATE_LIMITED",
      "Too many requests — please slow down and try again shortly.",
      429,
    );
  }
  if (error || !data.user) {
    throw new ApiError("UNAUTHORIZED", "Session expired. Please sign in again.");
  }
  return { userId: data.user.id, email: data.user.email ?? "" };
}

/**
 * Verifies the Supabase access token in the Authorization header.
 * On success attaches `req.userId` / `req.authEmail`.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!assertSupabaseConfigured(_res)) return;

    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!token) {
      throw new ApiError("UNAUTHORIZED", "Missing bearer token.");
    }

    const key = cacheKey(token);
    const hit = cachedIdentity(key);
    const identity = hit ?? (await verifyWithGoTrue(token));

    if (!hit) {
      rememberIdentity(key, {
        userId: identity.userId,
        email: identity.email,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
    }

    req.userId = identity.userId;
    req.authEmail = identity.email;
    next();
  } catch (error) {
    next(error);
  }
}
