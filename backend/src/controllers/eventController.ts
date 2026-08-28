import { isValidObjectId } from "mongoose";
import { z, ZodError } from "zod";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { Event } from "../models/event.model.js";
import { College } from "../models/college.model.js";
import { Department } from "../models/department.model.js";
import { User } from "../models/user.model.js";
import { sanitizeText } from "../middleware/securityMiddleware.js";

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const eventFields = {
  title: z.string().trim().min(1).max(200).transform(sanitizeText),
  description: z.string().trim().min(1).max(10000).transform(sanitizeText),
  location: z.string().trim().min(1).max(500).transform(sanitizeText),
  posterUrl: z.string().url().max(2048).refine(isHttpUrl, "Invalid poster URL").nullable().optional(),
  departmentId: z.string().refine(isValidObjectId, "Invalid department id").nullable().optional()
};

const createEventSchema = z.object({
  ...eventFields,
  collegeId: z.string().refine(isValidObjectId, "Invalid college id"),
  eventDate: z.string().datetime({ offset: true })
}).strict();

const updateEventSchema = z.object({
  ...eventFields,
  eventDate: z.string().datetime({ offset: true }).optional()
}).partial().strict().refine((data) => Object.keys(data).length > 0, "At least one field is required");

function futureDate(value: string): Date {
  const date = new Date(value);
  if (date <= new Date()) throw new Error("EVENT_DATE_PAST");
  return date;
}

function visibility(request: AuthenticatedRequest) {
  const departmentId = request.auth?.departmentId;
  return departmentId ? [{ departmentId: null }, { departmentId }] : [{ departmentId: null }];
}

function invalidInput(response: any, error: unknown, message = "Invalid event data"): boolean {
  if (error instanceof ZodError) {
    response.status(400).json({ error: message, details: error.issues });
    return true;
  }
  if (error instanceof Error && error.message === "EVENT_DATE_PAST") {
    response.status(400).json({ error: "Event date must be in the future" });
    return true;
  }
  return false;
}

export async function createEvent(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    const data = createEventSchema.parse(request.body);
    if (!request.auth || data.collegeId !== request.auth.collegeId) {
      response.status(403).json({ error: "Cannot create an event for another college" });
      return;
    }
    const eventDate = futureDate(data.eventDate);
    const [college, creator] = await Promise.all([
      College.exists({ _id: request.auth.collegeId }),
      User.findOne({ _id: request.auth.userId, collegeId: request.auth.collegeId }).lean()
    ]);
    if (!college) {
      response.status(404).json({ error: "College not found" });
      return;
    }
    if (!creator) {
      response.status(404).json({ error: "Creator not found" });
      return;
    }
    if (data.departmentId && !await Department.exists({ _id: data.departmentId, collegeId: request.auth.collegeId })) {
      response.status(400).json({ error: "Department is invalid for this college" });
      return;
    }
    const event = await Event.create({ ...data, collegeId: request.auth.collegeId, eventDate, createdBy: request.auth.userId, departmentId: data.departmentId ?? null });
    response.status(201).json({ event });
  } catch (error) {
    if (invalidInput(response, error)) return;
    response.status(500).json({ error: "Unable to create event" });
  }
}

export async function listEvents(request: AuthenticatedRequest, response: any): Promise<void> {
  const filter = { collegeId: request.auth?.collegeId, eventDate: { $gt: new Date() }, $or: visibility(request) };
  const events = await Event.find(filter).sort({ eventDate: 1 }).lean();
  response.json({ events });
}

export async function getEvent(request: AuthenticatedRequest, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: "Invalid event id" });
    return;
  }
  const event = await Event.findOne({ _id: request.params.id, collegeId: request.auth?.collegeId, $or: visibility(request) }).lean();
  if (!event) {
    response.status(404).json({ error: "Event not found" });
    return;
  }
  response.json({ event });
}

export async function updateEvent(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    if (!isValidObjectId(request.params.id)) {
      response.status(400).json({ error: "Invalid event id" });
      return;
    }
    const data = updateEventSchema.parse(request.body);
    const event = await Event.findOne({ _id: request.params.id, collegeId: request.auth?.collegeId });
    if (!event) {
      response.status(404).json({ error: "Event not found" });
      return;
    }
    const isOwner = request.auth?.role === "faculty" && String(event.createdBy) === request.auth.userId;
    if (request.auth?.role !== "admin" && !isOwner) {
      response.status(403).json({ error: "Cannot edit this event" });
      return;
    }
    const eventDate = data.eventDate ? futureDate(data.eventDate) : undefined;
    if (data.departmentId && !await Department.exists({ _id: data.departmentId, collegeId: request.auth?.collegeId })) {
      response.status(400).json({ error: "Department is invalid for this college" });
      return;
    }
    Object.assign(event, { ...data, ...(eventDate ? { eventDate } : {}), updatedAt: new Date() });
    await event.save();
    response.json({ event });
  } catch (error) {
    if (invalidInput(response, error)) return;
    response.status(500).json({ error: "Unable to update event" });
  }
}

export async function deleteEvent(request: AuthenticatedRequest, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: "Invalid event id" });
    return;
  }
  const event = await Event.findOne({ _id: request.params.id, collegeId: request.auth?.collegeId });
  if (!event) {
    response.status(404).json({ error: "Event not found" });
    return;
  }
  const isOwner = request.auth?.role === "faculty" && String(event.createdBy) === request.auth.userId;
  if (request.auth?.role !== "admin" && !isOwner) {
    response.status(403).json({ error: "Cannot delete this event" });
    return;
  }
  await event.deleteOne();
  response.status(204).send();
}