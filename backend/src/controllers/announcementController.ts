import { isValidObjectId } from "mongoose";
import { z, ZodError } from "zod";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { Announcement } from "../models/announcement.model.js";
import { College } from "../models/college.model.js";
import { Department } from "../models/department.model.js";
import { User } from "../models/user.model.js";

const announcementInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10000),
  collegeId: z.string().refine(isValidObjectId, "Invalid college id"),
  departmentId: z.string().refine(isValidObjectId, "Invalid department id").nullable().optional()
});

function pagination(request: AuthenticatedRequest): { page: number; limit: number } {
  const page = Math.max(1, Number.parseInt(String(request.query.page ?? "1"), 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(request.query.limit ?? "10"), 10) || 10));
  return { page, limit };
}

export async function createAnnouncement(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    const data = announcementInputSchema.parse(request.body);
    if (!request.auth || data.collegeId !== request.auth.collegeId) {
      response.status(403).json({ error: "Cannot create an announcement for another college" });
      return;
    }

    const [college, creator] = await Promise.all([
      College.exists({ _id: data.collegeId }),
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

    if (data.departmentId) {
      const department = await Department.exists({ _id: data.departmentId, collegeId: data.collegeId });
      if (!department) {
        response.status(400).json({ error: "Department is invalid for this college" });
        return;
      }
    }

    const announcement = await Announcement.create({ ...data, createdBy: request.auth.userId, departmentId: data.departmentId ?? null });
    response.status(201).json({ announcement });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ error: "Invalid announcement data", details: error.issues });
      return;
    }
    response.status(500).json({ error: "Unable to create announcement" });
  }
}

export async function listAnnouncements(request: AuthenticatedRequest, response: any): Promise<void> {
  const { page, limit } = pagination(request);
  const collegeId = request.auth?.collegeId;
  const departmentId = request.auth?.departmentId;
  const visibility = departmentId ? [{ departmentId: null }, { departmentId }] : [{ departmentId: null }];
  const filter = { collegeId, $or: visibility };
  const [announcements, total] = await Promise.all([
    Announcement.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Announcement.countDocuments(filter)
  ]);
  response.json({ announcements, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

export async function getAnnouncement(request: AuthenticatedRequest, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: "Invalid announcement id" });
    return;
  }
  const departmentId = request.auth?.departmentId;
  const visibility = departmentId ? [{ departmentId: null }, { departmentId }] : [{ departmentId: null }];
  const announcement = await Announcement.findOne({ _id: request.params.id, collegeId: request.auth?.collegeId, $or: visibility }).lean();
  if (!announcement) {
    response.status(404).json({ error: "Announcement not found" });
    return;
  }
  response.json({ announcement });
}

export async function deleteAnnouncement(request: AuthenticatedRequest, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: "Invalid announcement id" });
    return;
  }
  const announcement = await Announcement.findOne({ _id: request.params.id, collegeId: request.auth?.collegeId });
  if (!announcement) {
    response.status(404).json({ error: "Announcement not found" });
    return;
  }
  const isAdmin = request.auth?.role === "admin";
  const isCreator = request.auth?.role === "faculty" && String(announcement.createdBy) === request.auth.userId;
  if (!isAdmin && !isCreator) {
    response.status(403).json({ error: "Cannot delete this announcement" });
    return;
  }
  await announcement.deleteOne();
  response.status(204).send();
}