import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from "../controllers/eventController.js";
import { cancelRsvp, createOrUpdateRsvp, getRsvpStatus, getEventAttendees } from "../controllers/rsvpController.js";
import { contentCreationRateLimit } from "../middleware/securityMiddleware.js";

export const eventRouter = Router();
eventRouter.use(requireAuth);
eventRouter.post("/", contentCreationRateLimit, requireRole("faculty", "admin"), createEvent);
eventRouter.get("/", listEvents);
eventRouter.get("/:id", getEvent);
eventRouter.patch("/:id", requireRole("faculty", "admin"), updateEvent);
eventRouter.delete("/:id", requireRole("faculty", "admin"), deleteEvent);

// Bucket K: RSVP Routes
eventRouter.post("/:id/rsvp", createOrUpdateRsvp);
eventRouter.delete("/:id/rsvp", cancelRsvp);
eventRouter.get("/:id/rsvp", getRsvpStatus);
eventRouter.get("/:id/attendees", getEventAttendees);