import { Router } from "express";
import { ZodError } from "zod";
import { login, register } from "./auth.service.js";

export const authRouter = Router();
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", maxAge: 24 * 60 * 60 * 1000 };

function validationError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

authRouter.post("/register", async (request, response) => {
  try {
    const user = await register(request.body);
    response.status(201).json({ user });
  } catch (error) {
    if (validationError(error)) {
      const validation = error;
      response.status(400).json({ error: "Invalid registration data", details: validation.issues });
      return;
    }
    if (error instanceof Error && error.message === "EMAIL_ALREADY_REGISTERED") {
      response.status(409).json({ error: "Email is already registered" });
      return;
    }
    response.status(500).json({ error: "Unable to register user" });
  }
});

authRouter.post("/login", async (request, response) => {
  try {
    const result = await login(request.body);
    response.cookie("campushub_token", result.token, cookieOptions);
    response.json({ user: result.user });
  } catch (error) {
    if (validationError(error)) {
      const validation = error;
      response.status(400).json({ error: "Invalid login data", details: validation.issues });
      return;
    }
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      response.status(401).json({ error: "Invalid email or password" });
      return;
    }
    response.status(500).json({ error: "Unable to login" });
  }
});

authRouter.post("/logout", (_request, response) => {
  response.clearCookie("campushub_token", cookieOptions);
  response.status(204).send();
});
