import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { search } from "../controllers/searchController.js";
import { searchRateLimit } from "../middleware/securityMiddleware.js";

export const searchRouter = Router();
searchRouter.get("/", searchRateLimit, requireAuth, search);