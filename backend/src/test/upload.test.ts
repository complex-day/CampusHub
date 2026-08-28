import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { config } from "../config.js";
import { resetRateLimiters } from "../middleware/securityMiddleware.js";

const uploadStream = vi.hoisted(() => vi.fn());

vi.mock("../config/cloudinary.js", () => ({
  cloudinary: {
    uploader: {
      upload_stream: uploadStream
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
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimiters();
    uploadStream.mockImplementation((_options, callback) => {
      const stream = { end: vi.fn(() => queueMicrotask(() => callback(null, { secure_url: "https://res.cloudinary.com/demo/image/upload/poster.png" }))) };
      return stream;
    });
  });

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

  it("rejects a request without a poster file", async () => {
    const response = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("faculty")}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "A poster file is required" });
  });

  it("returns a gateway error when Cloudinary fails or omits its URL", async () => {
    uploadStream.mockImplementationOnce((_options: unknown, callback: (error: Error, result?: unknown) => void) => ({
      end: vi.fn(() => queueMicrotask(() => callback(new Error("provider unavailable"))))
    }));
    const providerFailure = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("faculty")}`).attach("poster", pngBuffer(), "poster.png");

    uploadStream.mockImplementationOnce((_options: unknown, callback: (error: null, result: object) => void) => ({
      end: vi.fn(() => queueMicrotask(() => callback(null, {})))
    }));
    const missingUrl = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("faculty")}`).attach("poster", pngBuffer(), "poster.png");

    expect(providerFailure.status).toBe(502);
    expect(missingUrl.status).toBe(502);
    expect(providerFailure.body).toEqual({ error: "Unable to store poster" });
    expect(missingUrl.body).toEqual({ error: "Unable to store poster" });
  });

  it("requires faculty or admin authorization", async () => {
    const unauthenticated = await request(app).post("/api/uploads/poster").attach("poster", pngBuffer(), "poster.png");
    const student = await request(app).post("/api/uploads/poster").set("Authorization", `Bearer ${auth("student")}`).attach("poster", pngBuffer(), "poster.png");
    expect(unauthenticated.status).toBe(401);
    expect(student.status).toBe(403);
  });
});