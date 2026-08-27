import type { NextFunction, Request, Response } from "express";
import { verifyToken, type AuthTokenPayload } from "./auth.service.js";

export type AuthenticatedRequest = Request & { auth?: AuthTokenPayload };

export function requireAuth(request: Request, response: Response, next: NextFunction): void {
  const authenticatedRequest = request as AuthenticatedRequest;
  const token = request.cookies?.campushub_token ?? request.header("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    authenticatedRequest.auth = verifyToken(token);
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired token" });
  }
}
