import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { config } from "../config.js";
import { Announcement } from "../models/announcement.model.js";
import { Event } from "../models/event.model.js";

const collegeId = "507f1f77bcf86cd799439011";
const departmentId = "507f1f77bcf86cd799439012";
const userId = "507f1f77bcf86cd799439013";

function auth(role: "student" | "faculty" | "admin", department?: string, college = collegeId) {
  return jwt.sign({ userId, collegeId: college, role, ...(department ? { departmentId: department } : {}) }, config.jwtSecret);
}

function query(results: unknown[]) {
  return { sort: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue(results) };
}

describe("search system", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("SEARCH-001/002 searches announcements and events", async () => {
    const announcementQuery = query([{ _id: "announcement-1", title: "Hackathon Notice" }]);
    const eventQuery = query([{ _id: "event-1", title: "Hackathon" }]);
    vi.spyOn(Announcement, "find").mockReturnValue(announcementQuery as any);
    vi.spyOn(Event, "find").mockReturnValue(eventQuery as any);

    const response = await request(app).get("/api/search?q=hackathon").set("Authorization", `Bearer ${auth("student", departmentId)}`);

    expect(response.status).toBe(200);
    expect(response.body.announcements).toHaveLength(1);
    expect(response.body.events).toHaveLength(1);
    expect(Announcement.find).toHaveBeenCalledWith(expect.objectContaining({ collegeId, $text: { $search: "hackathon" }, $or: [{ departmentId: null }, { departmentId }] }), { score: { $meta: "textScore" } });
    expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({ collegeId, $text: { $search: "hackathon" }, $or: [{ departmentId: null }, { departmentId }] }), { score: { $meta: "textScore" } });
    expect(announcementQuery.sort).toHaveBeenCalledWith({ score: { $meta: "textScore" }, createdAt: -1 });
  });

  it("requires authentication and validates the query", async () => {
    expect((await request(app).get("/api/search?q=hackathon")).status).toBe(401);
    expect((await request(app).get("/api/search?q=%20%20").set("Authorization", `Bearer ${auth("student")}`)).status).toBe(400);
    expect((await request(app).get(`/api/search?q=${"x".repeat(101)}`).set("Authorization", `Bearer ${auth("student")}`)).status).toBe(400);
    expect((await request(app).get("/api/search?q=a&q=b").set("Authorization", `Bearer ${auth("student")}`)).status).toBe(400);
  });

  it("uses authenticated college scope and caps both result sets", async () => {
    const announcementQuery = query([]);
    const eventQuery = query([]);
    vi.spyOn(Announcement, "find").mockReturnValue(announcementQuery as any);
    vi.spyOn(Event, "find").mockReturnValue(eventQuery as any);
    const response = await request(app).get("/api/search?q=notice&collegeId=507f1f77bcf86cd799439099").set("Authorization", `Bearer ${auth("admin")}`);

    expect(response.status).toBe(200);
    expect((Announcement.find as any).mock.calls[0][0].collegeId).toBe(collegeId);
    expect((Event.find as any).mock.calls[0][0].collegeId).toBe(collegeId);
    expect(announcementQuery.limit).toHaveBeenCalledWith(20);
    expect(eventQuery.limit).toHaveBeenCalledWith(20);
  });

  it("returns a safe server error when text search fails", async () => {
    vi.spyOn(Announcement, "find").mockImplementation(() => { throw new Error("text index unavailable"); });
    vi.spyOn(Event, "find").mockReturnValue(query([]) as any);
    const response = await request(app).get("/api/search?q=notice").set("Authorization", `Bearer ${auth("faculty")}`);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Unable to search campus content" });
  });
});