import "dotenv/config";

const requiredSecret = process.env.JWT_SECRET;

if (!requiredSecret && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be configured in production");
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/campushub",
  jwtSecret: requiredSecret ?? "development-only-secret-change-me",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development"
} as const;
