import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(config.mongoUri);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
