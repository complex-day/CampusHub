import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { search } from "../controllers/searchController.js";

export const searchRouter = Router();
searchRouter.get("/", requireAuth, search);