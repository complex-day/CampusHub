import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { isValidImageContent, posterUpload } from "../middleware/uploadMiddleware.js";
import { uploadPoster } from "../services/uploadService.js";

export const uploadRouter = Router();

uploadRouter.post("/poster", requireAuth, requireRole("faculty", "admin"), (request, response) => {
  posterUpload.single("poster")(request, response, async (error) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      response.status(400).json({ error: "Poster must be 5MB or smaller" });
      return;
    }
    if (error) {
      response.status(400).json({ error: error.message });
      return;
    }
    if (!request.file) {
      response.status(400).json({ error: "A poster file is required" });
      return;
    }
    if (!isValidImageContent(request.file.buffer, request.file.mimetype)) {
      response.status(400).json({ error: "Poster content is not a valid image" });
      return;
    }
    try {
      const posterUrl = await uploadPoster(request.file.buffer);
      response.status(201).json({ posterUrl });
    } catch {
      response.status(502).json({ error: "Unable to store poster" });
    }
  });
});