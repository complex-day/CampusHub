import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";
import { User } from "../models/user.model.js";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  collegeId: z.string().trim().min(1).max(100),
  departmentId: z.string().trim().min(1).max(100).optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128)
});

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
  collegeId: string;
  role: "student" | "faculty" | "admin";
  departmentId?: string;
};

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

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({ ...data, email, passwordHash });
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
  if (typeof payload !== "object" || !payload.userId || !payload.collegeId || !payload.role) {
    throw new Error("INVALID_TOKEN");
  }
  return payload as AuthTokenPayload;
}
