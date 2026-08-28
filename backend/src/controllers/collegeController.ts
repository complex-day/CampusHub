import { isValidObjectId } from "mongoose";
import { z, ZodError } from "zod";
import { College } from "../models/college.model.js";
import { sanitizeText } from "../middleware/securityMiddleware.js";

const collegeInputSchema = z.object({
  name: z.string().trim().min(2).max(200).transform(sanitizeText),
  description: z.string().trim().min(1).max(2000).transform(sanitizeText)
}).strict();

function isDuplicateKey(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === 11000);
}

export async function createCollege(request: any, response: any): Promise<void> {
  try {
    const data = collegeInputSchema.parse(request.body);
    const college = await College.create(data);
    response.status(201).json({ college });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ error: "Invalid college data", details: error.issues });
      return;
    }
    if (isDuplicateKey(error)) {
      response.status(409).json({ error: "College name is already registered" });
      return;
    }
    response.status(500).json({ error: "Unable to create college" });
  }
}

export async function listColleges(_request: any, response: any): Promise<void> {
  const colleges = await College.find().sort({ name: 1 }).lean();
  response.json({ colleges });
}

export async function getCollege(request: any, response: any): Promise<void> {
  if (!isValidObjectId(request.params.id)) {
    response.status(400).json({ error: "Invalid college id" });
    return;
  }
  const college = await College.findById(request.params.id).lean();
  if (!college) {
    response.status(404).json({ error: "College not found" });
    return;
  }
  response.json({ college });
}