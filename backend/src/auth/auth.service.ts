import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { config } from "../config.js";
import { College } from "../models/college.model.js";
import { User } from "../models/user.model.js";
import { sanitizeText } from "../middleware/securityMiddleware.js";

const safeText = (min: number, max: number) => z.string().trim().min(min).max(max).transform(sanitizeText);
export const registerSchema = z.object({
  name: safeText(2, 100),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128).regex(/[a-z]/, "Password must contain a lowercase letter").regex(/[A-Z]/, "Password must contain an uppercase letter").regex(/[0-9]/, "Password must contain a number"),
  collegeId: z.string().trim().min(1).max(100),
  departmentId: z.string().trim().min(1).max(100).optional(),
  role: z.enum(["student", "faculty", "admin"]).optional().default("student")
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(128)
}).strict();

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  collegeId: string;
  departmentId?: string;
};

export type AuthTokenPayload = {
  userId: string;
  name: string;
  email: string;
  collegeId: string;
  role: "student" | "faculty" | "admin";
  departmentId?: string;
};

const tokenSchema = z.object({
  userId: z.string().min(1),
  name: z.string().optional().default("Student"),
  email: z.string().optional().default(""),
  collegeId: z.string().min(1),
  role: z.enum(["student", "faculty", "admin"]),
  departmentId: z.string().min(1).optional()
});

function toPublicUser(user: any): AuthUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    collegeId: String(user.collegeId),
    ...(user.departmentId ? { departmentId: String(user.departmentId) } : {})
  };
}

export async function register(input: unknown): Promise<AuthUser> {
  const data = registerSchema.parse(input);
  const email = data.email.toLowerCase();
  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }

  let finalCollegeId = data.collegeId;
  if (!isValidObjectId(finalCollegeId)) {
    // Attempt resolving college by name
    const collegeByName = await College.findOne({
      name: { $regex: new RegExp(`^${data.collegeId.trim()}$`, "i") }
    }).lean();

    if (collegeByName) {
      finalCollegeId = String(collegeByName._id);
    } else {
      // Find the first college or create a default one
      const firstCollege = await College.findOne().lean();
      if (firstCollege) {
        finalCollegeId = String(firstCollege._id);
      } else {
        const newCollege = await College.create({
          name: data.collegeId.trim() || "Apex Institute of Technology",
          description: "Primary Campus Workspace"
        });
        finalCollegeId = String(newCollege._id);
      }
    }
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({ ...data, email, passwordHash, collegeId: finalCollegeId });
  return toPublicUser(user);
}

export async function login(input: unknown): Promise<{ user: AuthUser; token: string }> {
  const data = loginSchema.parse(input);
  const user = await User.findOne({ email: data.email.toLowerCase() }).select("+passwordHash");

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    {
      userId: String(user._id),
      name: user.name,
      email: user.email,
      collegeId: String(user.collegeId),
      role: user.role,
      ...(user.departmentId ? { departmentId: String(user.departmentId) } : {})
    } satisfies AuthTokenPayload,
    config.jwtSecret,
    { expiresIn: "1d" }
  );

  return { user: toPublicUser(user), token };
}

export function verifyToken(token: string): AuthTokenPayload {
  const payload = jwt.verify(token, config.jwtSecret);
  return tokenSchema.parse(payload);
}
