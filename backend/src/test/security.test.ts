import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { config } from "../config.js";
import { Announcement } from "../models/announcement.model.js";
import { College } from "../models/college.model.js";
import { User } from "../models/user.model.js";
import { resetRateLimiters } from "../middleware/securityMiddleware.js";

const collegeId = "507f1f77bcf86cd799439011";
const userId = "507f1f77bcf86cd799439013";

function token(claims: Record<string, unknown> = {}) {
  return jwt.sign({ userId, collegeId, role: "faculty", ...claims }, config.jwtSecret);
}

describe("Bucket G security hardening", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetRateLimiters();
  });

  it("SEC-001 hashes passwords and rejects weak registration passwords", async () => {
    const hash = vi.spyOn(bcrypt, "hash").mockResolvedValue("safe-hash" as never);
    vi.spyOn(User, "findOne").mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);
    vi.spyOn(User, "create").mockResolvedValue({ _id: userId, name: "Raja", email: "raja@example.com", role: "student", collegeId, passwordHash: "safe-hash" } as any);

    const weak = await request(app).post("/api/auth/register").send({ name: "Raja", email: "weak@example.com", password: "password", collegeId });
    const valid = await request(app).post("/api/auth/register").send({ name: "Raja", email: "raja@example.com", password: "Password123", collegeId });

    expect(weak.status).toBe(400);
    expect(valid.status).toBe(201);
    expect(hash).toHaveBeenCalledWith("Password123", 12);
    expect(valid.body.user.passwordHash).toBeUndefined();
  });

  it("SEC-002 rejects tampered and malformed JWT claims", async () => {
    const signed = token();
    const tampered = `${signed.slice(0, -1)}x`;
    const badRole = token({ role: "owner" });

    expect((await request(app).get("/api/me").set("Authorization", `Bearer ${tampered}`)).status).toBe(401);
    expect((await request(app).get("/api/me").set("Authorization", `Bearer ${badRole}`)).status).toBe(401);
    expect((await request(app).get("/api/me").set("Authorization", "Bearer")).status).toBe(401);
  });

  it("SEC-003 rejects operator-shaped search input", async () => {
    const response = await request(app).get("/api/search?q%5B%24ne%5D=anything").set("Authorization", `Bearer ${token({ role: "student" })}`);
    expect(response.status).toBe(400);
  });

  it("sets security headers and sanitizes stored announcement text", async () => {
    vi.spyOn(College, "exists").mockResolvedValue({ _id: collegeId } as any);
    vi.spyOn(User, "findOne").mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: userId, collegeId }) } as any);
    vi.spyOn(Announcement, "create").mockResolvedValue({ _id: "announcement-1" } as any);

    const response = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${token()}`)
      .send({ title: "<script>alert(1)</script>", description: "<img src=x onerror=alert(1)>", collegeId });

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(response.status).toBe(201);
    expect(Announcement.create).toHaveBeenCalledWith(expect.objectContaining({ title: "&lt;script&gt;alert(1)&lt;/script&gt;", description: "&lt;img src=x onerror=alert(1)&gt;" }));
  });

  it("SEC-004 rate limits repeated login requests", async () => {
    vi.spyOn(User, "findOne").mockReturnValue({ select: vi.fn().mockResolvedValue(null) } as any);
    const responses = await Promise.all(Array.from({ length: 11 }, () => request(app).post("/api/auth/login").send({ email: "bad@example.com", password: "wrong" })));
    expect(responses.at(-1)?.status).toBe(429);
    expect(responses.at(-1)?.body).toEqual({ error: "Too many authentication attempts" });
  });

  it("returns a safe error for malformed JSON", async () => {
    const response = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send("{bad");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Malformed JSON request" });
    expect(JSON.stringify(response.body)).not.toContain("SyntaxError");
  });
});
