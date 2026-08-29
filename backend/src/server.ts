import { app } from "./app.js";
import { config } from "./config.js";
import { connectDatabase, disconnectDatabase } from "./db.js";
import { seedInitialDataIfEmpty } from "./seed.js";

type HttpServer = ReturnType<typeof app.listen>;

export function createShutdownHandler(
  server: HttpServer,
  disconnect: () => Promise<void> = disconnectDatabase,
  exit: (code: number) => void = process.exit
): () => Promise<void> {
  return async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await disconnect();
    exit(0);
  };
}

export async function startServer(): Promise<HttpServer> {
  await connectDatabase();
  await seedInitialDataIfEmpty();
  const server = app.listen(config.port, () => {
    console.log(`CampusHub API listening on port ${config.port}`);
  });
  const shutdown = createShutdownHandler(server);
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return server;
}

export async function bootstrap(
  start: () => Promise<HttpServer> = startServer,
  onFailure: (error?: unknown) => void = (error) => {
    console.error("database_startup_failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
): Promise<void> {
  try {
    await start();
  } catch (error) {
    onFailure(error);
  }
}

if (process.env.NODE_ENV !== "test") {
  void bootstrap();
}
