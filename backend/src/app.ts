import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { config } from "./config.js";
import { requireAuth } from "./auth/auth.middleware.js";
import { authRouter } from "./auth/auth.routes.js";
import { collegeRouter } from "./routes/collegeRoutes.js";
import { departmentRouter } from "./routes/departmentRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { announcementRouter } from "./routes/announcementRoutes.js";
import { uploadRouter } from "./routes/uploadRoutes.js";
import { eventRouter } from "./routes/eventRoutes.js";
import { searchRouter } from "./routes/searchRoutes.js";

export const app = express();

app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/colleges", collegeRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/users", userRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/events", eventRouter);
app.use("/api/search", searchRouter);
app.get("/api/me", requireAuth, (request, response) => {
  response.json({ auth: (request as typeof request & { auth?: unknown }).auth });
});
