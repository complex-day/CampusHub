import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { assignDepartment } from "../controllers/departmentController.js";

export const userRouter = Router();

userRouter.patch("/:id/department", requireAuth, assignDepartment);