import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from "../controllers/eventController.js";

export const eventRouter = Router();
eventRouter.use(requireAuth);
eventRouter.post("/", requireRole("faculty", "admin"), createEvent);
eventRouter.get("/", listEvents);
eventRouter.get("/:id", getEvent);
eventRouter.patch("/:id", requireRole("faculty", "admin"), updateEvent);
eventRouter.delete("/:id", requireRole("faculty", "admin"), deleteEvent);