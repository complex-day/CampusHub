import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

vi.mock("../db.js", () => ({ disconnectDatabase: vi.fn() }));

const mockedUser = {
  _id: "user-1",
  name: "Raja",
  email: "raja@example.com",
  role: "student",
  collegeId: "college-1",
  passwordHash: "hashed-password"
};

describe("authentication", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("AUTH-001 registers a user without exposing the password", async () => {
    vi.spyOn(User, "findOne").mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);
    vi.spyOn(User, "create").mockResolvedValue(mockedUser as any);
    vi.spyOn(bcrypt, "hash").mockResolvedValue("hashed-password" as never);

    const response = await request(app).post("/api/auth/register").send({ name: "Raja", email: "Raja@example.com", password: "password123", collegeId: "college-1" });

    expect(response.status).toBe(201);
    expect(response.body.user).toEqual(expect.objectContaining({ email: "raja@example.com", collegeId: "college-1" }));
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it("AUTH-002 logs in and sets a session cookie", async () => {
    const query = { select: vi.fn().mockResolvedValue({ ...mockedUser }) };
    vi.spyOn(User, "findOne").mockReturnValue(query as any);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    const response = await request(app).post("/api/auth/login").send({ email: "raja@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"][0]).toContain("campushub_token=");
  });

  it("AUTH-003 rejects incorrect credentials with 401", async () => {
    const query = { select: vi.fn().mockResolvedValue({ ...mockedUser }) };
    vi.spyOn(User, "findOne").mockReturnValue(query as any);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

    const response = await request(app).post("/api/auth/login").send({ email: "raja@example.com", password: "wrong-password" });

    expect(response.status).toBe(401);
  });

  it("AUTH-005 rejects protected requests without authentication", async () => {
    const response = await request(app).get("/api/me");
    expect(response.status).toBe(401);
  });

  it("AUTH-004 persists the session across a subsequent request", async () => {
    const query = { select: vi.fn().mockResolvedValue({ ...mockedUser }) };
    vi.spyOn(User, "findOne").mockReturnValue(query as any);
    vi.spyOn(bcrypt, "compare").mockResolvedValue(true as never);

    const agent = request.agent(app);
    const loginResponse = await agent.post("/api/auth/login").send({ email: "raja@example.com", password: "password123" });
    const meResponse = await agent.get("/api/me");

    expect(loginResponse.status).toBe(200);
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.auth).toEqual(expect.objectContaining({ userId: "user-1", collegeId: "college-1", role: "student" }));
  });
});
