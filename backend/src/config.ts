import "dotenv/config";

const requiredProductionVariables = [
  "JWT_SECRET",
  "MONGODB_URI",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
] as const;

if (process.env.NODE_ENV === "production") {
  const missing = requiredProductionVariables.filter((name) => !process.env[name]);
  if (missing.length > 0) throw new Error(`Missing production configuration: ${missing.join(", ")}`);
}

const requiredSecret = process.env.JWT_SECRET;

export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/campushub",
  jwtSecret: requiredSecret ?? "development-only-secret-change-me",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? ""
  }
} as const;
