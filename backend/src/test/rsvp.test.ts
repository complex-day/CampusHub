import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { config } from "../config.js";
import { Event } from "../models/event.model.js";
import { EventRSVP } from "../models/eventRsvp.model.js";
import { User } from "../models/user.model.js";

const collegeId = "507f1f77bcf86cd799439011";
const otherCollegeId = "507f1f77bcf86cd799439021";
const departmentId = "507f1f77bcf86cd799439012";
const otherDepartmentId = "507f1f77bcf86cd799439099";
const studentId = "507f1f77bcf86cd799439013";
const student2Id = "507f1f77bcf86cd799439014";
const facultyId = "507f1f77bcf86cd799439015";
const eventId = "507f1f77bcf86cd799439016";
const futureDate = new Date(Date.now() + 86400000 * 10);
const pastDate = new Date(Date.now() - 86400000 * 2);

function auth(role: "student" | "faculty" | "admin", department?: string, user = studentId, college = collegeId) {
  return jwt.sign(
    { userId: user, collegeId: college, role, ...(department ? { departmentId: department } : {}) },
    config.jwtSecret
  );
}

describe("Bucket K: Event RSVP System", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("RSVP-001: creates an RSVP for student and issues a ticket", async () => {
    const mockEvent = {
      _id: eventId,
      title: "AI Workshop",
      collegeId,
      departmentId: null,
      eventDate: futureDate,
      capacity: 100,
    };

    vi.spyOn(Event, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockEvent),
    } as any);

    vi.spyOn(EventRSVP, "countDocuments").mockResolvedValue(10);
    vi.spyOn(EventRSVP, "findOne").mockResolvedValue(null);
    vi.spyOn(EventRSVP, "create").mockResolvedValue({
      _id: "rsvp-1",
      eventId,
      userId: studentId,
      collegeId,
      status: "confirmed",
      ticketNumber: `PASS-${eventId.slice(-4)}-ABC123`,
      createdAt: new Date(),
    } as any);

    const response = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set("Authorization", `Bearer ${auth("student")}`)
      .send({});

    expect(response.status).toBe(201);
    expect(response.body.rsvp).toBeDefined();
    expect(response.body.rsvp.status).toBe("confirmed");
    expect(response.body.rsvp.ticketNumber).toMatch(/^PASS-/);
  });

  it("RSVP-002: duplicate RSVP is idempotent and returns existing ticket", async () => {
    const mockEvent = {
      _id: eventId,
      title: "AI Workshop",
      collegeId,
      departmentId: null,
      eventDate: futureDate,
      capacity: null,
    };

    const existingRsvp = {
      _id: "rsvp-1",
      eventId,
      userId: studentId,
      collegeId,
      status: "confirmed",
      ticketNumber: "PASS-9016-EXISTING",
      createdAt: new Date(),
    };

    vi.spyOn(Event, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockEvent),
    } as any);

    vi.spyOn(EventRSVP, "findOne").mockResolvedValue(existingRsvp as any);

    const response = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set("Authorization", `Bearer ${auth("student")}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.rsvp.ticketNumber).toBe("PASS-9016-EXISTING");
    expect(response.body.rsvp.status).toBe("confirmed");
  });

  it("RSVP-003: cancels an existing RSVP and updates status to cancelled", async () => {
    const existingRsvp = {
      _id: "rsvp-1",
      eventId,
      userId: studentId,
      collegeId,
      status: "confirmed",
      save: vi.fn().mockResolvedValue(true),
    };

    vi.spyOn(EventRSVP, "findOne").mockResolvedValue(existingRsvp as any);

    const response = await request(app)
      .delete(`/api/events/${eventId}/rsvp`)
      .set("Authorization", `Bearer ${auth("student")}`);

    expect(response.status).toBe(200);
    expect(existingRsvp.status).toBe("cancelled");
    expect(existingRsvp.save).toHaveBeenCalled();
  });

  it("RSVP-004: blocks RSVP to an event in another college (multi-tenant boundary)", async () => {
    vi.spyOn(Event, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const response = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set("Authorization", `Bearer ${auth("student", undefined, studentId, otherCollegeId)}`)
      .send({});

    expect(response.status).toBe(404);
  });

  it("RSVP-005: blocks RSVP to a restricted department event for non-department student", async () => {
    const deptRestrictedEvent = {
      _id: eventId,
      title: "Mech Only Symposium",
      collegeId,
      departmentId: otherDepartmentId,
      eventDate: futureDate,
      capacity: 50,
    };

    vi.spyOn(Event, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(deptRestrictedEvent),
    } as any);

    const response = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set("Authorization", `Bearer ${auth("student", departmentId)}`)
      .send({});

    expect(response.status).toBe(403);
    expect(response.body.error).toContain("department");
  });

  it("RSVP-006: rejects RSVP for past events", async () => {
    const pastEvent = {
      _id: eventId,
      title: "Old Fest",
      collegeId,
      departmentId: null,
      eventDate: pastDate,
      capacity: 100,
    };

    vi.spyOn(Event, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(pastEvent),
    } as any);

    const response = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set("Authorization", `Bearer ${auth("student")}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("past");
  });

  it("RSVP-007: includes attendeeCount and userRsvpd in event listing and details", async () => {
    const mockEvents = [
      { _id: eventId, title: "Tech Fest", eventDate: futureDate, collegeId, departmentId: null },
    ];

    const findQuery = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockEvents),
    };
    vi.spyOn(Event, "find").mockReturnValue(findQuery as any);

    vi.spyOn(EventRSVP, "find").mockReturnValue({
      lean: vi.fn().mockResolvedValue([{ eventId, userId: studentId, status: "confirmed" }]),
    } as any);

    const response = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${auth("student")}`);

    expect(response.status).toBe(200);
    expect(response.body.events[0].attendeeCount).toBe(1);
    expect(response.body.events[0].userRsvpd).toBe(true);
  });

  it("RSVP-008: returns student's active passes for Passbook history", async () => {
    const mockRsvps = [
      {
        _id: "rsvp-1",
        eventId: {
          _id: eventId,
          title: "Robotics Expo",
          eventDate: futureDate,
          location: "Robotics Arena",
          posterUrl: "https://example.com/poster.png",
        },
        userId: studentId,
        collegeId,
        status: "confirmed",
        ticketNumber: "PASS-9016-ROBOT",
        createdAt: new Date(),
      },
    ];

    const query = {
      sort: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockRsvps),
    };
    vi.spyOn(EventRSVP, "find").mockReturnValue(query as any);

    const response = await request(app)
      .get("/api/me/passes")
      .set("Authorization", `Bearer ${auth("student")}`);

    expect(response.status).toBe(200);
    expect(response.body.passes).toHaveLength(1);
    expect(response.body.passes[0].ticketNumber).toBe("PASS-9016-ROBOT");
    expect(response.body.passes[0].eventId.title).toBe("Robotics Expo");
  });

  it("RSVP-009: allows event creator and admin to view attendee roster, blocks students", async () => {
    const mockEvent = {
      _id: eventId,
      title: "Robotics Expo",
      collegeId,
      createdBy: facultyId,
    };

    vi.spyOn(Event, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockEvent),
    } as any);

    const mockAttendees = [
      {
        _id: "rsvp-1",
        userId: { _id: studentId, name: "Rohan Varma", email: "rohan@campus.apex.edu" },
        ticketNumber: "PASS-9016-A1",
        status: "confirmed",
        createdAt: new Date(),
      },
    ];

    const query = {
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockAttendees),
    };
    vi.spyOn(EventRSVP, "find").mockReturnValue(query as any);

    // Block normal student
    const studentResp = await request(app)
      .get(`/api/admin/events/${eventId}/attendees`)
      .set("Authorization", `Bearer ${auth("student")}`);
    expect(studentResp.status).toBe(403);

    // Allow creator faculty
    const facultyResp = await request(app)
      .get(`/api/admin/events/${eventId}/attendees`)
      .set("Authorization", `Bearer ${auth("faculty", undefined, facultyId)}`);
    expect(facultyResp.status).toBe(200);
    expect(facultyResp.body.attendees).toHaveLength(1);
    expect(facultyResp.body.attendees[0].userId.name).toBe("Rohan Varma");

    // Allow admin
    const adminResp = await request(app)
      .get(`/api/admin/events/${eventId}/attendees`)
      .set("Authorization", `Bearer ${auth("admin")}`);
    expect(adminResp.status).toBe(200);
  });

  it("RSVP-010: blocks unauthenticated requests to RSVP endpoints", async () => {
    const postResp = await request(app).post(`/api/events/${eventId}/rsvp`).send({});
    expect(postResp.status).toBe(401);

    const deleteResp = await request(app).delete(`/api/events/${eventId}/rsvp`);
    expect(deleteResp.status).toBe(401);

    const passesResp = await request(app).get("/api/me/passes");
    expect(passesResp.status).toBe(401);
  });

  it("RSVP-011: rejects RSVP when event has reached maximum capacity", async () => {
    const cappedEvent = {
      _id: eventId,
      title: "Exclusive Seminar",
      collegeId,
      departmentId: null,
      eventDate: futureDate,
      capacity: 2,
    };

    vi.spyOn(Event, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(cappedEvent),
    } as any);

    vi.spyOn(EventRSVP, "findOne").mockResolvedValue(null); // No existing RSVP for this user
    vi.spyOn(EventRSVP, "countDocuments").mockResolvedValue(2); // Already 2 confirmed

    const response = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set("Authorization", `Bearer ${auth("student", undefined, student2Id)}`)
      .send({});

    expect(response.status).toBe(409);
    expect(response.body.error).toMatch(/capacity/i);
  });

  it("RSVP-012: allows RSVP when spots open up after a cancellation", async () => {
    const cappedEvent = {
      _id: eventId,
      title: "Exclusive Seminar",
      collegeId,
      departmentId: null,
      eventDate: futureDate,
      capacity: 2,
    };

    vi.spyOn(Event, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(cappedEvent),
    } as any);

    vi.spyOn(EventRSVP, "findOne").mockResolvedValue(null);
    vi.spyOn(EventRSVP, "countDocuments").mockResolvedValue(1); // 1 confirmed out of 2 spots
    vi.spyOn(EventRSVP, "create").mockResolvedValue({
      _id: "rsvp-2",
      eventId,
      userId: student2Id,
      collegeId,
      status: "confirmed",
      ticketNumber: "PASS-9016-FREEDSPOT",
      createdAt: new Date(),
    } as any);

    const response = await request(app)
      .post(`/api/events/${eventId}/rsvp`)
      .set("Authorization", `Bearer ${auth("student", undefined, student2Id)}`)
      .send({});

    expect(response.status).toBe(201);
    expect(response.body.rsvp.ticketNumber).toBe("PASS-9016-FREEDSPOT");
  });
});
