import { Router, type Request, type Response } from "express";

/**
 * Placeholder auth routes.
 *
 * The contract mirrors the frontend mock layer — see the swap notes in
 * frontend/src/features/auth/auth.service.ts before wiring real handlers:
 *
 *   POST /api/auth/login     { identifier, password, remember }  → AuthSession
 *   POST /api/auth/register  { name, email, password }           → AuthSession
 *   POST /api/auth/logout                                        → 204
 *   GET  /api/auth/me        (Bearer token)                      → AuthSession
 */
export const authRouter = Router();

function placeholder(endpoint: string) {
  return (_req: Request, res: Response) => {
    res.status(501).json({
      code: "NOT_IMPLEMENTED",
      message: `${endpoint} is a placeholder — replace it with a real controller.`,
    });
  };
}

authRouter.post("/login", placeholder("POST /api/auth/login"));
authRouter.post("/register", placeholder("POST /api/auth/register"));
authRouter.post("/logout", placeholder("POST /api/auth/logout"));
authRouter.get("/me", placeholder("GET /api/auth/me"));
