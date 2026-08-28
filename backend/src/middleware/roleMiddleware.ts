import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";

export type UserRole = "student" | "faculty" | "admin";

export function requireRole(...roles: UserRole[]) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const authenticatedRequest = request as AuthenticatedRequest;
    if (!authenticatedRequest.auth || !roles.includes(authenticatedRequest.auth.role as UserRole)) {
      response.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}