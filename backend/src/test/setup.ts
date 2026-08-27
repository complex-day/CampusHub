import { afterAll } from "vitest";
import { disconnectDatabase } from "../db.js";

afterAll(async () => {
  await disconnectDatabase();
});
