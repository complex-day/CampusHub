import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { config } from "../config.js";

vi.mock("../config/cloudinary.js", () => ({
  cloudinary: {
    uploader: {
      upload_stream: vi.fn((_options, callback) => {
        const stream = { end: vi.fn(() => queueMicrotask(() => callback(null, { secure_url: "https://res.cloudinary.com/demo/image/upload/poster.png" }))) };
        return stream;
      })
    }
  }
}));

const userId = "507f1f77bcf86cd799439013";
const collegeId = "507f1f77bcf86cd799439011";

function auth(role: "student" | "faculty" | "admin") {
  return jwt.sign({ userId, collegeId, role }, config.jwtSecret);
}

function pngBuffer(size = 40) {
  const buffer = Buffer.alloc(size);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(buffer);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(1, 16);
  buffer.writeUInt32BE(1, 20);
  buffer.write("IEND", buffer.length - 8, "ascii");
  return buffer;
}

describe("poster uploads", () => {
  beforeEach(() => vi.clearAllMocks());

  it("UPLOAD-001 accepts a valid PNG and returns a Cloudinary URL", async () => {
    const response = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("faculty")}`).attach("poster", pngBuffer(), "poster.png");
    expect(response.status).toBe(201);
    expect(response.body.posterUrl).toContain("cloudinary.com");
  });

  it("UPLOAD-002 accepts a valid JPG", async () => {
    const response = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("faculty")}`).attach("poster", Buffer.from([0xff, 0xd8, 0xff, 0xd9]), "poster.jpg");
    expect(response.status).toBe(201);
  });

  it("UPLOAD-003 rejects unsafe and mismatched file types", async () => {
    const unsafe = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("faculty")}`).attach("poster", Buffer.from("MZ executable"), "poster.exe");
    const mismatched = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("faculty")}`).attach("poster", pngBuffer(), "poster.jpg");
    expect(unsafe.status).toBe(400);
    expect(mismatched.status).toBe(400);
  });

  it("UPLOAD-004 rejects files larger than 5MB", async () => {
    const response = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("faculty")}`).attach("poster", Buffer.alloc(5 * 1024 * 1024 + 1), "poster.png");
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("5MB");
  });

  it("UPLOAD-005 rejects corrupted image content", async () => {
    const response = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("faculty")}`).attach("poster", Buffer.from("not an image"), "poster.png");
    expect(response.status).toBe(400);
  });

  it("requires faculty or admin authorization", async () => {
    const unauthenticated = await request(app).post("/api/uploads/poster").attach("poster", pngBuffer(), "poster.png");
    const student = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("student")}`).attach("poster", pngBuffer(), "poster.png");
    expect(unauthenticated.status).toBe(401);
    expect(student.status).toBe(403);
  });
});