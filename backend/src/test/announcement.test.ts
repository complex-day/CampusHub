import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { config } from "../config.js";
import { Announcement } from "../models/announcement.model.js";
import { College } from "../models/college.model.js";
import { Department } from "../models/department.model.js";
import { User } from "../models/user.model.js";

const collegeId = "507f1f77bcf86cd799439011";
const departmentId = "507f1f77bcf86cd799439012";
const userId = "507f1f77bcf86cd799439013";

function auth(role: "student" | "faculty" | "admin", department?: string) {
  return jwt.sign({ userId, collegeId, role, ...(department ? { departmentId: department } : {}) }, config.jwtSecret);
}

describe("announcement system", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("ANN-001 allows faculty to publish an announcement", async () => {
    vi.spyOn(College, "exists").mockResolvedValue({ _id: collegeId } as any);
    vi.spyOn(User, "findOne").mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: userId, collegeId }) } as any);
    vi.spyOn(Announcement, "create").mockResolvedValue({ _id: "announcement-1", title: "Notice" } as any);
    const response = await request(app).post("/api/announcements").set("Authorization", `Bearer ${auth("faculty")}`).send({ title: "Notice", description: "Details", collegeId });
    expect(response.status).toBe(201);
  });

  it.each([{ title: "", description: "Details" }, { title: "Notice", description: "" }])("ANN-002/003 rejects empty announcement fields", async (body) => {
    const response = await request(app).post("/api/announcements").set("Authorization", `Bearer ${auth("faculty")}`).send({ ...body, collegeId });
    expect(response.status).toBe(400);
  });

  it("ANN-004 blocks students from publishing", async () => {
    const response = await request(app).post("/api/announcements").set("Authorization", `Bearer ${auth("student")}`).send({ title: "Notice", description: "Details", collegeId });
    expect(response.status).toBe(403);
  });

  it("ANN-005/006 scopes and paginates the feed newest first", async () => {
    const query = { sort: vi.fn().mockReturnThis(), skip: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) };
    vi.spyOn(Announcement, "find").mockReturnValue(query as any);
    vi.spyOn(Announcement, "countDocuments").mockResolvedValue(0);
    const response = await request(app).get("/api/announcements?page=2&limit=500").set("Authorization", `Bearer ${auth("student", departmentId)}`);
    expect(response.status).toBe(200);
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(query.limit).toHaveBeenCalledWith(50);
    expect(query.skip).toHaveBeenCalledWith(50);
    expect((Announcement.find as any).mock.calls[0][0]).toEqual(expect.objectContaining({ collegeId, $or: [{ departmentId: null }, { departmentId }] }));
  });

  it("ANN-007 allows an admin to delete a same-college announcement", async () => {
    const announcement = { createdBy: "another-user", deleteOne: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Announcement, "findOne").mockResolvedValue(announcement as any);
    const response = await request(app).delete("/api/announcements/507f1f77bcf86cd799439014").set("Authorization", `Bearer ${auth("admin")}`);
    expect(response.status).toBe(204);
    expect(announcement.deleteOne).toHaveBeenCalled();
  });

  it("ANN-007 blocks a faculty member deleting another creator's announcement", async () => {
    vi.spyOn(Announcement, "findOne").mockResolvedValue({ createdBy: "another-user" } as any);
    const response = await request(app).delete("/api/announcements/507f1f77bcf86cd799439014").set("Authorization", `Bearer ${auth("faculty")}`);
    expect(response.status).toBe(403);
  });
});