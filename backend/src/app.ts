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
import { globalErrorHandler } from "./middleware/errorMiddleware.js";
import { securityHeaders } from "./middleware/securityMiddleware.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { isDatabaseReady } from "./db.js";
import { getMyPasses } from "./controllers/rsvpController.js";

export const app = express();

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(cors({ origin: config.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.get("/ready", (_request, response) => {
  if (!isDatabaseReady()) {
    response.status(503).json({ status: "not ready" });
    return;
  }
  response.status(200).json({ status: "ready" });
});

app.use("/api/auth", authRouter);
app.use("/api/colleges", collegeRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/users", userRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/events", eventRouter);
app.use("/api/search", searchRouter);
app.use("/api/admin", adminRouter);
app.get("/api/me", requireAuth, (request, response) => {
  response.json({ auth: (request as typeof request & { auth?: unknown }).auth });
});
app.get("/api/me/passes", requireAuth, getMyPasses);

app.use(globalErrorHandler);
