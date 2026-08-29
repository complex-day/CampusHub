import { isValidObjectId } from "mongoose";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { Event } from "../models/event.model.js";
import { EventRSVP } from "../models/eventRsvp.model.js";

function generateTicketNumber(eventId: string): string {
  const shortId = eventId.slice(-4).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PASS-${shortId}-${randomSuffix}`;
}

export async function createOrUpdateRsvp(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    const eventId = String(request.params.id);
    if (!isValidObjectId(eventId)) {
      response.status(400).json({ error: "Invalid event id" });
      return;
    }

    const auth = request.auth;
    if (!auth) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const event = await Event.findOne({ _id: eventId, collegeId: auth.collegeId }).lean();
    if (!event) {
      response.status(404).json({ error: "Event not found" });
      return;
    }

    if (new Date(event.eventDate) <= new Date()) {
      response.status(400).json({ error: "Cannot RSVP to past events" });
      return;
    }

    if (event.departmentId && String(event.departmentId) !== auth.departmentId) {
      response.status(403).json({ error: "You are not eligible for this department-restricted event" });
      return;
    }

    const existing = await EventRSVP.findOne({
      eventId,
      userId: auth.userId,
      collegeId: auth.collegeId,
    });

    if (existing && existing.status === "confirmed") {
      response.status(200).json({ rsvp: existing });
      return;
    }

    if (typeof event.capacity === "number" && event.capacity > 0) {
      const confirmedCount = await EventRSVP.countDocuments({ eventId, status: "confirmed" });
      if (confirmedCount >= event.capacity) {
        response.status(409).json({ error: "Event has reached maximum capacity" });
        return;
      }
    }

    if (existing) {
      existing.status = "confirmed";
      existing.updatedAt = new Date();
      await existing.save();
      response.status(200).json({ rsvp: existing });
      return;
    }

    const ticketNumber = generateTicketNumber(eventId);
    const rsvp = await EventRSVP.create({
      eventId,
      userId: auth.userId,
      collegeId: auth.collegeId,
      status: "confirmed",
      ticketNumber,
    });

    response.status(201).json({ rsvp });
  } catch (error) {
    response.status(500).json({ error: "Unable to complete event RSVP" });
  }
}

export async function cancelRsvp(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    const eventId = String(request.params.id);
    if (!isValidObjectId(eventId)) {
      response.status(400).json({ error: "Invalid event id" });
      return;
    }

    const auth = request.auth;
    if (!auth) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const existing = await EventRSVP.findOne({
      eventId,
      userId: auth.userId,
      collegeId: auth.collegeId,
    });

    if (!existing || existing.status === "cancelled") {
      response.status(200).json({ message: "RSVP cancelled successfully" });
      return;
    }

    existing.status = "cancelled";
    existing.updatedAt = new Date();
    await existing.save();

    response.status(200).json({ message: "RSVP cancelled successfully", rsvp: existing });
  } catch (error) {
    response.status(500).json({ error: "Unable to cancel event RSVP" });
  }
}

export async function getRsvpStatus(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    const eventId = String(request.params.id);
    if (!isValidObjectId(eventId)) {
      response.status(400).json({ error: "Invalid event id" });
      return;
    }

    const auth = request.auth;
    if (!auth) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const rsvp = await EventRSVP.findOne({
      eventId,
      userId: auth.userId,
      collegeId: auth.collegeId,
      status: "confirmed",
    }).lean();

    response.json({ rsvp: rsvp || null, userRsvpd: Boolean(rsvp) });
  } catch (error) {
    response.status(500).json({ error: "Unable to fetch RSVP status" });
  }
}

export async function getMyPasses(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    const auth = request.auth;
    if (!auth) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const passes = await EventRSVP.find({
      userId: auth.userId,
      collegeId: auth.collegeId,
      status: "confirmed",
    })
      .populate("eventId")
      .sort({ createdAt: -1 })
      .lean();

    // Filter out passes whose event may have been deleted
    const validPasses = passes.filter((p) => p.eventId !== null);

    response.json({ passes: validPasses });
  } catch (error) {
    response.status(500).json({ error: "Unable to retrieve student passbook" });
  }
}

export async function getEventAttendees(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    const eventId = String(request.params.id);
    if (!isValidObjectId(eventId)) {
      response.status(400).json({ error: "Invalid event id" });
      return;
    }

    const auth = request.auth;
    if (!auth) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    const event = await Event.findOne({ _id: eventId, collegeId: auth.collegeId }).lean();
    if (!event) {
      response.status(404).json({ error: "Event not found" });
      return;
    }

    const isOwner = auth.role === "faculty" && String(event.createdBy) === auth.userId;
    if (auth.role !== "admin" && !isOwner) {
      response.status(403).json({ error: "Unauthorized to view attendee roster" });
      return;
    }

    const attendees = await EventRSVP.find({
      eventId,
      collegeId: auth.collegeId,
      status: "confirmed",
    })
      .populate("userId", "name email role departmentId")
      .sort({ createdAt: 1 })
      .lean();

    response.json({ attendees });
  } catch (error) {
    response.status(500).json({ error: "Unable to retrieve event attendees" });
  }
}
