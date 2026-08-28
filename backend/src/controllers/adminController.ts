import { isValidObjectId } from "mongoose";
import { z, ZodError } from "zod";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { Announcement } from "../models/announcement.model.js";
import { College } from "../models/college.model.js";
import { Department } from "../models/department.model.js";
import { Event } from "../models/event.model.js";
import { User } from "../models/user.model.js";
import { sanitizeText } from "../middleware/securityMiddleware.js";
import { getAdminMetrics } from "../services/adminService.js";

const roles = ["student", "faculty", "admin"] as const;
const roleSchema = z.object({ role: z.enum(roles) }).strict();
const collegeSchema = z.object({
  name: z.string().trim().min(2).max(200).transform(sanitizeText),
  description: z.string().trim().min(1).max(2000).transform(sanitizeText)
}).strict();
const collegePatchSchema = collegeSchema.partial().refine((data) => Object.keys(data).length > 0, "At least one field is required");
const departmentSchema = z.object({
  name: z.string().trim().min(2).max(200).transform(sanitizeText),
  collegeId: z.string().refine(isValidObjectId, "Invalid college id").optional()
}).strict();
const departmentPatchSchema = departmentSchema.omit({ collegeId: true }).partial().refine((data) => Object.keys(data).length > 0, "At least one field is required");

function pageParams(request: AuthenticatedRequest) {
  const page = Math.max(1, Number.parseInt(String(request.query.page ?? "1"), 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(request.query.limit ?? "10"), 10) || 10));
  return { page, limit };
}

function result(response: any, error: unknown, message: string): boolean {
  if (error instanceof ZodError) {
    response.status(400).json({ error: message, details: error.issues });
    return true;
  }
  return false;
}

function safeRegex(value: string) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

function scope(request: AuthenticatedRequest) {
  return request.auth?.collegeId;
}

export async function metrics(request: AuthenticatedRequest, response: any): Promise<void> {
  response.json({ metrics: await getAdminMetrics(scope(request) as string) });
}

export async function listUsers(request: AuthenticatedRequest, response: any): Promise<void> {
  const { page, limit } = pageParams(request);
  const collegeId = scope(request);
  if (request.query.collegeId && request.query.collegeId !== collegeId) {
    response.status(403).json({ error: "Cannot access another college" });
    return;
  }
  const filter: Record<string, unknown> = { collegeId };
  if (typeof request.query.role === "string") {
    const parsed = z.enum(roles).safeParse(request.query.role);
    if (!parsed.success) { response.status(400).json({ error: "Invalid role filter" }); return; }
    filter.role = parsed.data;
  }
  if (typeof request.query.search === "string" && request.query.search.trim()) {
    const search = safeRegex(request.query.search.trim().slice(0, 100));
    filter.$or = [{ name: search }, { email: search }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).select("name email role collegeId departmentId createdAt").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter)
  ]);
  response.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function updateUserRole(request: AuthenticatedRequest, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id)) { response.status(400).json({ error: "Invalid user id" }); return; }
  try {
    const { role } = roleSchema.parse(request.body);
    const user = await User.findOne({ _id: request.params.id, collegeId: scope(request) });
    if (!user) { response.status(404).json({ error: "User not found" }); return; }
    user.role = role;
    await user.save();
    response.json({ user: { id: String(user._id), name: user.name, email: user.email, role: user.role, collegeId: String(user.collegeId), departmentId: user.departmentId ?? null } });
  } catch (error) {
    if (result(response, error, "Invalid role data")) return;
    response.status(500).json({ error: "Unable to update user role" });
  }
}

async function listContent(request: AuthenticatedRequest, response: any, model: any, key: string) {
  const { page, limit } = pageParams(request);
  const filter = { collegeId: scope(request) };
  const [items, total] = await Promise.all([
    model.find(filter).select(key === "announcements" ? "title description posterUrl collegeId departmentId createdBy createdAt" : "title description eventDate location posterUrl collegeId departmentId createdBy createdAt").sort(key === "events" ? { eventDate: 1 } : { createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    model.countDocuments(filter)
  ]);
  response.json({ [key]: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export const listAnnouncements = (request: AuthenticatedRequest, response: any) => listContent(request, response, Announcement, "announcements");
export const listEvents = (request: AuthenticatedRequest, response: any) => listContent(request, response, Event, "events");

async function deleteContent(request: AuthenticatedRequest, response: any, model: any, label: string): Promise<void> {
  if (!isValidObjectId(request.params.id)) { response.status(400).json({ error: `Invalid ${label} id` }); return; }
  const item = await model.findOne({ _id: request.params.id, collegeId: scope(request) });
  if (!item) { response.status(404).json({ error: `${label[0].toUpperCase()}${label.slice(1)} not found` }); return; }
  await item.deleteOne();
  response.status(204).send();
}

export const deleteAnnouncement = (request: AuthenticatedRequest, response: any) => deleteContent(request, response, Announcement, "announcement");
export const deleteEvent = (request: AuthenticatedRequest, response: any) => deleteContent(request, response, Event, "event");

export async function listColleges(request: AuthenticatedRequest, response: any): Promise<void> {
  const college = await College.findOne({ _id: scope(request) }).select("name description createdAt").lean();
  response.json({ colleges: college ? [college] : [] });
}

export async function createCollege(request: AuthenticatedRequest, response: any): Promise<void> {
  try { const college = await College.create(collegeSchema.parse(request.body)); response.status(201).json({ college }); }
  catch (error) { if (result(response, error, "Invalid college data")) return; response.status(500).json({ error: "Unable to create college" }); }
}

export async function updateCollege(request: AuthenticatedRequest, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id) || request.params.id !== scope(request)) { response.status(403).json({ error: "Cannot update another college" }); return; }
  try {
    const college = await College.findOne({ _id: scope(request) });
    if (!college) { response.status(404).json({ error: "College not found" }); return; }
    Object.assign(college, collegePatchSchema.parse(request.body)); await college.save(); response.json({ college });
  } catch (error) { if (result(response, error, "Invalid college data")) return; response.status(500).json({ error: "Unable to update college" }); }
}

export async function listDepartments(request: AuthenticatedRequest, response: any): Promise<void> { response.json({ departments: await Department.find({ collegeId: scope(request) }).sort({ name: 1 }).lean() }); }

export async function createDepartment(request: AuthenticatedRequest, response: any): Promise<void> {
  try { const data = departmentSchema.parse(request.body); if (data.collegeId && data.collegeId !== scope(request)) { response.status(403).json({ error: "Cannot create a department for another college" }); return; } const department = await Department.create({ name: data.name, collegeId: scope(request) }); response.status(201).json({ department }); }
  catch (error) { if (result(response, error, "Invalid department data")) return; response.status(500).json({ error: "Unable to create department" }); }
}

export async function updateDepartment(request: AuthenticatedRequest, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id)) { response.status(400).json({ error: "Invalid department id" }); return; }
  try { const department = await Department.findOne({ _id: request.params.id, collegeId: scope(request) }); if (!department) { response.status(404).json({ error: "Department not found" }); return; } Object.assign(department, departmentPatchSchema.parse(request.body)); await department.save(); response.json({ department }); }
  catch (error) { if (result(response, error, "Invalid department data")) return; response.status(500).json({ error: "Unable to update department" }); }
}