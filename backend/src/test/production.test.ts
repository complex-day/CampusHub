import mongoose from "mongoose";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { app } from "../app.js";
import { bootstrap, createShutdownHandler, startServer } from "../server.js";
import { config } from "../config.js";
import { connectDatabase, disconnectDatabase } from "../db.js";

describe("production readiness", () => {
  afterEach(() => vi.restoreAllMocks());

  it("keeps health unauthenticated and reports service status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("reports not ready while MongoDB is disconnected", async () => {
    const response = await request(app).get("/ready");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: "not ready" });
  });

  it("reports ready when MongoDB is connected", async () => {
    const readyState = vi.spyOn(mongoose.connection, "readyState", "get").mockReturnValue(1);

    const response = await request(app).get("/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ready" });
    readyState.mockRestore();
  });

  it("closes HTTP and disconnects MongoDB before exiting", async () => {
    const events: string[] = [];
    const server = {
      close(callback: (error?: Error) => void) {
        events.push("close");
        callback();
      }
    } as ReturnType<typeof app.listen>;
    const disconnect = vi.fn(async () => {
      events.push("disconnect");
    });
    const exit = vi.fn((code: number) => events.push(`exit:${code}`));

    await createShutdownHandler(server, disconnect, exit)();

    expect(events).toEqual(["close", "disconnect", "exit:0"]);
  });

  it("does not disconnect when the HTTP server cannot close", async () => {
    const disconnect = vi.fn(async () => undefined);
    const server = {
      close(callback: (error?: Error) => void) {
        callback(new Error("close failed"));
      }
    } as ReturnType<typeof app.listen>;

    await expect(createShutdownHandler(server, disconnect, vi.fn())()).rejects.toThrow("close failed");
    expect(disconnect).not.toHaveBeenCalled();
  });

  it("propagates a database disconnect failure after HTTP close", async () => {
    const server = {
      close(callback: (error?: Error) => void) {
        callback();
      }
    } as ReturnType<typeof app.listen>;
    const disconnect = vi.fn(async () => {
      throw new Error("disconnect failed");
    });

    await expect(createShutdownHandler(server, disconnect, vi.fn())()).rejects.toThrow("disconnect failed");
  });

  it("connects before listening and registers signal handlers", async () => {
    const connect = vi.spyOn(mongoose, "connect").mockResolvedValue(mongoose);
    const server = { close: vi.fn() } as unknown as ReturnType<typeof app.listen>;
    const listen = vi.spyOn(app, "listen").mockImplementation((_port, callback) => {
      if (typeof callback === "function") callback();
      return server;
    });
    const sigint = vi.spyOn(process, "once");

    await startServer();

    expect(connect).toHaveBeenCalledWith(config.mongoUri);
    expect(listen).toHaveBeenCalledWith(config.port, expect.any(Function));
    expect(sigint).toHaveBeenCalledWith("SIGINT", expect.any(Function));
    expect(sigint).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
  });

  it("logs when the server starts listening", async () => {
    vi.spyOn(mongoose, "connect").mockResolvedValue(mongoose);
    const server = { close: vi.fn() } as unknown as ReturnType<typeof app.listen>;
    vi.spyOn(app, "listen").mockImplementation((_port, callback) => {
      if (typeof callback === "function") callback();
      return server;
    });
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    await startServer();

    expect(log).toHaveBeenCalledWith(`CampusHub API listening on port ${config.port}`);
  });

  it("reports startup failure without throwing", async () => {
    const onFailure = vi.fn();

    await bootstrap(async () => {
      throw new Error("database unavailable");
    }, onFailure);

    expect(onFailure).toHaveBeenCalledOnce();
  });

  it("connects and disconnects through the shared database helpers", async () => {
    const connect = vi.spyOn(mongoose, "connect").mockResolvedValue(mongoose);
    const disconnect = vi.spyOn(mongoose, "disconnect").mockResolvedValue(undefined);

    await connectDatabase();
    await disconnectDatabase();

    expect(connect).toHaveBeenCalledWith(config.mongoUri);
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
