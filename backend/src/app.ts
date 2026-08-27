import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { config } from "./config.js";
import { requireAuth } from "./auth/auth.middleware.js";
import { authRouter } from "./auth/auth.routes.js";

export const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.get("/api/me", requireAuth, (request, response) => {
  response.json({ auth: (request as typeof request & { auth?: unknown }).auth });
});
