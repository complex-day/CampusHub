import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(config.mongoUri);
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
