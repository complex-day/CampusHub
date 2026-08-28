import { z, ZodError } from "zod";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { searchCampus } from "../services/searchService.js";

const searchQuerySchema = z.string().trim().min(1, "Search query cannot be empty").max(100, "Search query cannot exceed 100 characters");

export async function search(request: AuthenticatedRequest, response: any): Promise<void> {
  try {
    const rawQuery = request.query.q;
    if (typeof rawQuery !== "string") {
      response.status(400).json({ error: "A single search query is required" });
      return;
    }
    const query = searchQuerySchema.parse(rawQuery);
    if (!request.auth?.collegeId) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }
    const results = await searchCampus(query, {
      collegeId: request.auth.collegeId,
      departmentId: request.auth.departmentId
    });
    response.json({ ...results, query });
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ error: "Invalid search query", details: error.issues });
      return;
    }
    console.error("search_failed");
    response.status(500).json({ error: "Unable to search campus content" });
  }
}