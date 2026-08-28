import { afterEach, describe, expect, it, vi } from "vitest";

describe("production configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("rejects imports with missing production credentials", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    for (const name of ["JWT_SECRET", "MONGODB_URI", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]) {
      vi.stubEnv(name, undefined);
    }

    await expect(import("../config.js")).rejects.toThrow("Missing production configuration");
  });
});