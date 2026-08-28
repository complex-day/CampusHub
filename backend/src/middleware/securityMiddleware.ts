import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import helmet from "helmet";

export const securityHeaders = helmet();

const limiterOptions = {
  standardHeaders: "draft-8" as const,
  legacyHeaders: false,
  skip: () => process.env.DISABLE_RATE_LIMIT === "true"
};

export const authRateLimit = rateLimit({ ...limiterOptions, windowMs: 15 * 60 * 1000, limit: 10, message: { error: "Too many authentication attempts" } });
export const searchRateLimit = rateLimit({ ...limiterOptions, windowMs: 60 * 1000, limit: 30, message: { error: "Too many search requests" } });
export const uploadRateLimit = rateLimit({ ...limiterOptions, windowMs: 60 * 1000, limit: 10, message: { error: "Too many upload requests" } });
export const contentCreationRateLimit = rateLimit({ ...limiterOptions, windowMs: 60 * 1000, limit: 20, message: { error: "Too many content creation requests" } });

export function resetRateLimiters(): void {
  for (const limiter of [authRateLimit, searchRateLimit, uploadRateLimit, contentCreationRateLimit] as RateLimitRequestHandler[]) {
    limiter.resetKey?.("::ffff:127.0.0.1");
    limiter.resetKey?.("127.0.0.1");
  }
}

export function sanitizeText(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}
