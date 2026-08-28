import { isValidObjectId } from "mongoose";
import { z, ZodError } from "zod";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { College } from "../models/college.model.js";
import { Department } from "../models/department.model.js";
import { User } from "../models/user.model.js";

const departmentInputSchema = z.object({
  name: z.string().trim().min(2).max(200),
  collegeId: z.string().refine(isValidObjectId, "Invalid college id")
});

const membershipSchema = z.object({
  departmentId: z.string().refine(isValidObjectId, "Invalid department id")
});

function isDuplicateKey(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
}

export async function createDepartment(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    const data = departmentInputSchema.parse(request.body);
    if (request.auth?.collegeId !== data.collegeId) {
      response.status(403).json({ error: "Cannot create a department for another college" });
      return;
    }
    const college = await College.exists({ _id: data.collegeId });
    if (!college) {
      response.status(404).json({ error: "College not found" });
      return;
    }
    const department = await Department.create(data);
    response.status(201).json({ department });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ error: "Invalid department data", details: error.issues });
      return;
    }
    if (isDuplicateKey(error)) {
      response.status(409).json({ error: "Department already exists in this college" });
      return;
    }
    response.status(500).json({ error: "Unable to create department" });
  }
}

export async function listDepartments(request: AuthenticatedRequest, response: any): Promise<void> {
  const departments = await Department.find({ collegeId: request.auth?.collegeId }).sort({ name: 1 }).lean();
  response.json({ departments });
}

export async function getDepartment(request: AuthenticatedRequest, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: "Invalid department id" });
    return;
  }
  const department = await Department.findOne({ _id: request.params.id, collegeId: request.auth?.collegeId }).lean();
  if (!department) {
    response.status(404).json({ error: "Department not found" });
    return;
  }
  response.json({ department });
}

export async function assignDepartment(request: AuthenticatedRequest, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: "Invalid user id" });
    return;
  }
  if (request.auth?.userId !== request.params.id && request.auth?.role !== "admin") {
    response.status(403).json({ error: "Cannot update another user" });
    return;
  }

  try {
    const { departmentId } = membershipSchema.parse(request.body);
    const [user, department] = await Promise.all([
      User.findById(request.params.id),
      Department.findById(departmentId).lean()
    ]);
    if (!user) {
      response.status(404).json({ error: "User not found" });
      return;
    }
    if (!department) {
      response.status(404).json({ error: "Department not found" });
      return;
    }
    if (String(user.collegeId) !== String(department.collegeId)) {
      response.status(403).json({ error: "Department belongs to another college" });
      return;
    }
    if (request.auth?.role === "admin" && String(request.auth.collegeId) !== String(user.collegeId)) {
      response.status(403).json({ error: "Cannot update a user from another college" });
      return;
    }

    user.departmentId = department._id;
    await user.save();
    response.json({ user: { id: String(user._id), collegeId: String(user.collegeId), departmentId: String(user.departmentId) } });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ error: "Invalid membership data", details: error.issues });
      return;
    }
    response.status(500).json({ error: "Unable to assign department" });
  }
}