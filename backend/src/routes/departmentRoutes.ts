import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { createDepartment, getDepartment, listDepartments } from "../controllers/departmentController.js";

export const departmentRouter = Router();

departmentRouter.use(requireAuth);
departmentRouter.post("/", requireRole("admin"), createDepartment);
departmentRouter.get("/", listDepartments);
departmentRouter.get("/:id", getDepartment);