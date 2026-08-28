import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { config } from "../config.js";
import { Announcement } from "../models/announcement.model.js";
import { College } from "../models/college.model.js";
import { Department } from "../models/department.model.js";
import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";

const collegeId = "507f1f77bcf86cd799439011";
const otherCollegeId = "507f1f77bcf86cd799439012";
const userId = "507f1f77bcf86cd799439013";
const contentId = "507f1f77bcf86cd799439014";

function token(role = "admin", tenant = collegeId) {
  return jwt.sign({ userId, collegeId: tenant, role }, config.jwtSecret);
}

function query(value: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(value)
  };
}

describe("Bucket H admin dashboard", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("protects every admin route and rejects non-admin roles", async () => {
    expect((await request(app).get("/api/admin/metrics")).status).toBe(401);
    expect((await request(app).get("/api/admin/metrics").set("Authorization", `Bearer ${token("faculty")}`)).status).toBe(403);
    expect((await request(app).get("/api/admin/metrics").set("Authorization", `Bearer ${token("student")}`)).status).toBe(403);
  });

  it("returns tenant metrics with parallel model counts", async () => {
    vi.spyOn(User, "countDocuments").mockResolvedValue(4 as never);
    vi.spyOn(College, "countDocuments").mockResolvedValue(1 as never);
    vi.spyOn(Department, "countDocuments").mockResolvedValue(3 as never);
    vi.spyOn(Announcement, "countDocuments").mockResolvedValue(8 as never);
    vi.spyOn(Event, "countDocuments").mockResolvedValue(2 as never);

    const response = await request(app).get("/api/admin/metrics").set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ metrics: { users: 4, colleges: 1, departments: 3, announcements: 8, events: 2 } });
    expect(User.countDocuments).toHaveBeenCalledWith({ collegeId });
    expect(College.countDocuments).toHaveBeenCalledWith({ _id: collegeId });
  });

  it("lists users with pagination, search, filters, and no password hash", async () => {
    const usersQuery = query([{ _id: userId, name: "Raja", email: "raja@example.com", role: "student", collegeId }]);
    vi.spyOn(User, "find").mockReturnValue(usersQuery as any);
    vi.spyOn(User, "countDocuments").mockResolvedValue(11 as never);

    const response = await request(app).get("/api/admin/users?page=2&limit=20&search=raja&role=student&collegeId=" + collegeId).set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 2, limit: 20, total: 11, pages: 1 });
    expect(response.body.users[0].passwordHash).toBeUndefined();
    expect(usersQuery.skip).toHaveBeenCalledWith(20);
    expect(usersQuery.limit).toHaveBeenCalledWith(20);
    expect(User.find).toHaveBeenCalledWith(expect.objectContaining({ collegeId, role: "student", $or: expect.any(Array) }));
  });

  it("blocks cross-tenant user filters and invalid role payloads", async () => {
    const crossTenant = await request(app).get(`/api/admin/users?collegeId=${otherCollegeId}`).set("Authorization", `Bearer ${token()}`);
    expect(crossTenant.status).toBe(403);

    const findOne = vi.spyOn(User, "findOne");
    const invalid = await request(app).patch(`/api/admin/users/${userId}/role`).set("Authorization", `Bearer ${token()}`).send({ role: { $ne: "admin" } });
    expect(invalid.status).toBe(400);
    expect(findOne).not.toHaveBeenCalled();
  });

  it("updates only a same-college user's validated role", async () => {
    const user = { _id: userId, name: "Raja", email: "raja@example.com", role: "student", collegeId, departmentId: undefined, save: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(User, "findOne").mockResolvedValue(user as any);

    const response = await request(app).patch(`/api/admin/users/${userId}/role`).set("Authorization", `Bearer ${token()}`).send({ role: "faculty" });

    expect(response.status).toBe(200);
    expect(user.role).toBe("faculty");
    expect(user.save).toHaveBeenCalled();
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it("moderates content only inside the admin's college", async () => {
    vi.spyOn(Announcement, "findOne").mockResolvedValue(null);
    const foreign = await request(app).delete(`/api/admin/announcements/${contentId}`).set("Authorization", `Bearer ${token("admin", otherCollegeId)}`);
    expect(foreign.status).toBe(404);

    const item = { deleteOne: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Announcement, "findOne").mockResolvedValue(item as any);
    const deleted = await request(app).delete(`/api/admin/announcements/${contentId}`).set("Authorization", `Bearer ${token()}`);
    expect(deleted.status).toBe(204);
    expect(item.deleteOne).toHaveBeenCalled();
    expect(Announcement.findOne).toHaveBeenCalledWith({ _id: contentId, collegeId });
  });

  it("paginates moderation lists with a maximum limit", async () => {
    const eventsQuery = query([]);
    vi.spyOn(Event, "find").mockReturnValue(eventsQuery as any);
    vi.spyOn(Event, "countDocuments").mockResolvedValue(0 as never);

    const response = await request(app).get("/api/admin/events?page=3&limit=500").set("Authorization", `Bearer ${token()}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ events: [], pagination: { page: 3, limit: 50, total: 0, pages: 0 } });
    expect(eventsQuery.limit).toHaveBeenCalledWith(50);
  });

  it("keeps admin college and department management tenant-scoped", async () => {
    const departmentsQuery = query([]);
    vi.spyOn(Department, "find").mockReturnValue(departmentsQuery as any);
    const response = await request(app).get("/api/admin/departments").set("Authorization", `Bearer ${token()}`);
    expect(response.status).toBe(200);
    expect(Department.find).toHaveBeenCalledWith({ collegeId });
  });
});
