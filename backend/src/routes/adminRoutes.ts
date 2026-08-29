import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { createCollege, createDepartment, deleteAnnouncement, deleteEvent, listAnnouncements, listColleges, listDepartments, listEvents, listUsers, metrics, updateCollege, updateDepartment, updateUserRole } from "../controllers/adminController.js";
import { getEventAttendees } from "../controllers/rsvpController.js";

export const adminRouter = Router();
adminRouter.use(requireAuth);

// Attendee visibility allows Admin or Event Creator Faculty
adminRouter.get("/events/:id/attendees", getEventAttendees);

// Strict Admin-only routes
adminRouter.use(requireRole("admin"));
adminRouter.get("/metrics", metrics);
adminRouter.get("/users", listUsers);
adminRouter.patch("/users/:id/role", updateUserRole);
adminRouter.get("/announcements", listAnnouncements);
adminRouter.delete("/announcements/:id", deleteAnnouncement);
adminRouter.get("/events", listEvents);
adminRouter.delete("/events/:id", deleteEvent);
adminRouter.get("/colleges", listColleges);
adminRouter.post("/colleges", createCollege);
adminRouter.patch("/colleges/:id", updateCollege);
adminRouter.get("/departments", listDepartments);
adminRouter.post("/departments", createDepartment);
adminRouter.patch("/departments/:id", updateDepartment);