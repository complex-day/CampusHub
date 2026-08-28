import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { createAnnouncement, deleteAnnouncement, getAnnouncement, listAnnouncements } from "../controllers/announcementController.js";
import { contentCreationRateLimit } from "../middleware/securityMiddleware.js";

export const announcementRouter = Router();

announcementRouter.use(requireAuth);
announcementRouter.post("/", contentCreationRateLimit, requireRole("faculty", "admin"), createAnnouncement);
announcementRouter.get("/", listAnnouncements);
announcementRouter.get("/:id", getAnnouncement);
announcementRouter.delete("/:id", deleteAnnouncement);