import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";

export const globalErrorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({ error: "Malformed JSON request" });
    return;
  }
  if (error instanceof multer.MulterError) {
    response.status(400).json({ error: error.code === "LIMIT_FILE_SIZE" ? "Poster must be 5MB or smaller" : "Invalid multipart upload" });
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({ error: "Invalid request data", details: error.issues });
    return;
  }
  console.error("request_failed");
  response.status(500).json({ error: "Internal server error" });
};
