import { app } from "./app.js";
import { config } from "./config.js";
import { connectDatabase, disconnectDatabase } from "./db.js";

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
  onFailure: () => void = () => {
    console.error("database_startup_failed");
    process.exitCode = 1;
  }
): Promise<void> {
  try {
    await start();
  } catch {
    onFailure();
  }
}

if (process.env.NODE_ENV !== "test") {
  void bootstrap();
}
