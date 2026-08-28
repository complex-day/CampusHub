import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { config } from "../config.js";
import { Event } from "../models/event.model.js";
import { College } from "../models/college.model.js";
import { Department } from "../models/department.model.js";
import { User } from "../models/user.model.js";

const collegeId = "507f1f77bcf86cd799439011";
const otherCollegeId = "507f1f77bcf86cd799439021";
const departmentId = "507f1f77bcf86cd799439012";
const userId = "507f1f77bcf86cd799439013";
const futureDate = "2099-06-01T10:00:00.000Z";

function auth(role: "student" | "faculty" | "admin", department?: string, user = userId, college = collegeId) {
  return jwt.sign({ userId: user, collegeId: college, role, ...(department ? { departmentId: department } : {}) }, config.jwtSecret);
}

function validEvent() {
  return { title: "Tech Fest", description: "Campus technology showcase", collegeId, eventDate: futureDate, location: "Auditorium" };
}

describe("event system", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("EVENT-001 creates an event for faculty", async () => {
    vi.spyOn(College, "exists").mockResolvedValue({ _id: collegeId } as any);
    vi.spyOn(User, "findOne").mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: userId, collegeId }) } as any);
    vi.spyOn(Department, "exists").mockResolvedValue({ _id: departmentId } as any);
    vi.spyOn(Event, "create").mockResolvedValue({ _id: "event-1", title: "Tech Fest" } as any);

    const response = await request(app).post("/api/events").set("Authorization", `Bearer ${auth("faculty")}`).send(validEvent());
    expect(response.status).toBe(201);
    expect(Event.create).toHaveBeenCalledWith(expect.objectContaining({ collegeId, createdBy: userId, eventDate: new Date(futureDate), departmentId: null }));
  });

  it("EVENT-002 rejects missing and past required data", async () => {
    const missing = await request(app).post("/api/events").set("Authorization", `Bearer ${auth("faculty")}`).send({ collegeId });
    const past = await request(app).post("/api/events").set("Authorization", `Bearer ${auth("faculty")}`).send({ ...validEvent(), eventDate: "2020-01-01T10:00:00.000Z" });
    expect(missing.status).toBe(400);
    expect(past.status).toBe(400);
  });

  it("blocks unauthenticated students and client tenant changes", async () => {
    expect((await request(app).get("/api/events")).status).toBe(401);
    expect((await request(app).post("/api/events").set("Authorization", `Bearer ${auth("student")}`).send(validEvent())).status).toBe(403);
    expect((await request(app).post("/api/events").set("Authorization", `Bearer ${auth("faculty")}`).send({ ...validEvent(), collegeId: otherCollegeId })).status).toBe(403);
  });

  it("EVENT-003/004 lists only visible future events nearest first", async () => {
    const query = { sort: vi.fn().mockReturnThis(), lean: vi.fn().mockResolvedValue([]) };
    vi.spyOn(Event, "find").mockReturnValue(query as any);
    const response = await request(app).get("/api/events").set("Authorization", `Bearer ${auth("student", departmentId)}`);
    expect(response.status).toBe(200);
    expect(query.sort).toHaveBeenCalledWith({ eventDate: 1 });
    const filter = (Event.find as any).mock.calls[0][0];
    expect(filter).toEqual(expect.objectContaining({ collegeId, $or: [{ departmentId: null }, { departmentId }] }));
    expect(filter.eventDate.$gt).toBeInstanceOf(Date);
  });

  it("hides department events from users in another department and another college", async () => {
    const query = { lean: vi.fn().mockResolvedValue(null) };
    vi.spyOn(Event, "findOne").mockReturnValue(query as any);
    const departmentResponse = await request(app).get("/api/events/507f1f77bcf86cd799439014").set("Authorization", `Bearer ${auth("student", "507f1f77bcf86cd799439099")}`);
    expect(departmentResponse.status).toBe(404);
    expect((Event.findOne as any).mock.calls[0][0]).toEqual(expect.objectContaining({ collegeId, $or: [{ departmentId: null }, { departmentId: "507f1f77bcf86cd799439099" }] }));

    vi.restoreAllMocks();
    vi.spyOn(Event, "findOne").mockReturnValue({ lean: vi.fn().mockResolvedValue(null) } as any);
    const crossCollegeResponse = await request(app).get("/api/events/507f1f77bcf86cd799439014").set("Authorization", `Bearer ${auth("student", undefined, userId, otherCollegeId)}`);
    expect(crossCollegeResponse.status).toBe(404);
    expect((Event.findOne as any).mock.calls[0][0].collegeId).toBe(otherCollegeId);
  });

  it("allows admins in the college and owners to edit/delete, but blocks other faculty", async () => {
    const event = { createdBy: userId, save: vi.fn().mockResolvedValue(undefined), deleteOne: vi.fn().mockResolvedValue(undefined) };
    vi.spyOn(Event, "findOne").mockResolvedValue(event as any);
    const otherFaculty = await request(app).patch("/api/events/507f1f77bcf86cd799439014").set("Authorization", `Bearer ${auth("faculty", undefined, "another-user")}`).send({ title: "Changed" });
    expect(otherFaculty.status).toBe(403);

    const owner = await request(app).patch("/api/events/507f1f77bcf86cd799439014").set("Authorization", `Bearer ${auth("faculty")}`).send({ title: "Changed" });
    expect(owner.status).toBe(200);
    expect(event.save).toHaveBeenCalled();

    const adminDelete = await request(app).delete("/api/events/507f1f77bcf86cd799439014").set("Authorization", `Bearer ${auth("admin")}`);
    expect(adminDelete.status).toBe(204);
    expect(event.deleteOne).toHaveBeenCalled();
  });

  it("rejects an invalid department and poster URL", async () => {
    vi.spyOn(College, "exists").mockResolvedValue({ _id: collegeId } as any);
    vi.spyOn(User, "findOne").mockReturnValue({ lean: vi.fn().mockResolvedValue({ _id: userId, collegeId }) } as any);
    vi.spyOn(Department, "exists").mockResolvedValue(null);
    const invalidDepartment = await request(app).post("/api/events").set("Authorization", `Bearer ${auth("faculty")}`).send({ ...validEvent(), departmentId });
    const invalidPoster = await request(app).post("/api/events").set("Authorization", `Bearer ${auth("faculty")}`).send({ ...validEvent(), posterUrl: "not-a-url" });
    expect(invalidDepartment.status).toBe(400);
    expect(invalidPoster.status).toBe(400);
  });
});
