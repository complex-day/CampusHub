import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { createCollege, getCollege, listColleges } from "../controllers/collegeController.js";

export const collegeRouter = Router();

collegeRouter.post("/", requireAuth, requireRole("admin"), createCollege);
collegeRouter.get("/", listColleges);
collegeRouter.get("/:id", getCollege);