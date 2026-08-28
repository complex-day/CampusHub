import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { config } from "../config.js";
import { College } from "../models/college.model.js";
import { Department } from "../models/department.model.js";
import { User } from "../models/user.model.js";

const collegeA = "507f1f77bcf86cd799439011";
const collegeB = "507f1f77bcf86cd799439012";
const departmentA = "507f1f77bcf86cd799439013";
const userA = "507f1f77bcf86cd799439014";

function token(role: "student" | "faculty" | "admin", collegeId = collegeA, userId = userA): string {
  return jwt.sign({ userId, collegeId, role }, config.jwtSecret);
}

describe("Bucket B college and department management", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("COL-003 allows an admin to create a college", async () => {
    vi.spyOn(College, "create").mockResolvedValue({ _id: collegeA, name: "Engineering", description: "Engineering college" } as any);

    const response = await request(app)
      .post("/api/colleges")
      .set("Authorization", `Bearer ${token("admin")}`)
      .send({ name: "Engineering", description: "Engineering college" });

    expect(response.status).toBe(201);
    expect(response.body.college.name).toBe("Engineering");
  });

  it.each([["student"], ["faculty"]] as const)("ROLE blocks %s from creating colleges", async (role) => {
    const response = await request(app)
      .post("/api/colleges")
      .set("Authorization", `Bearer ${token(role)}`)
      .send({ name: "Engineering", description: "Engineering college" });

    expect(response.status).toBe(403);
  });

  it("DEP-001 creates a department linked to an existing college", async () => {
    vi.spyOn(College, "exists").mockResolvedValue({ _id: collegeA } as any);
    vi.spyOn(Department, "create").mockResolvedValue({ _id: departmentA, name: "CSE", collegeId: collegeA } as any);

    const response = await request(app)
      .post("/api/departments")
      .set("Authorization", `Bearer ${token("admin")}`)
      .send({ name: "CSE", collegeId: collegeA });

    expect(response.status).toBe(201);
    expect(response.body.department.collegeId).toBe(collegeA);
  });

  it("DEP-002 rejects duplicate department names", async () => {
    vi.spyOn(College, "exists").mockResolvedValue({ _id: collegeA } as any);
    vi.spyOn(Department, "create").mockRejectedValue({ code: 11000 });

    const response = await request(app)
      .post("/api/departments")
      .set("Authorization", `Bearer ${token("admin")}`)
      .send({ name: "CSE", collegeId: collegeA });

    expect(response.status).toBe(409);
  });

  it("DEP-003 assigns a same-college department", async () => {
    const user = { _id: userA, collegeId: collegeA, save: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(User, "findOne").mockResolvedValue(user as any);
    vi.spyOn(Department, "findOne").mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: departmentA, collegeId: collegeA }) } as any);

    const response = await request(app)
      .patch(`/api/users/${userA}/department`)
      .set("Authorization", `Bearer ${token("student")}`)
      .send({ departmentId: departmentA });

    expect(response.status).toBe(200);
    expect(user.save).toHaveBeenCalled();
  });

  it("DEP-004 blocks a cross-college department assignment", async () => {
    const user = { _id: userA, collegeId: collegeA, save: vi.fn() };
    vi.spyOn(User, "findOne").mockResolvedValue(user as any);
    vi.spyOn(Department, "findOne").mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: departmentA, collegeId: collegeB }) } as any);

    const response = await request(app)
      .patch(`/api/users/${userA}/department`)
      .set("Authorization", `Bearer ${token("student")}`)
      .send({ departmentId: departmentA });

    expect(response.status).toBe(403);
    expect(user.save).not.toHaveBeenCalled();
  });
});