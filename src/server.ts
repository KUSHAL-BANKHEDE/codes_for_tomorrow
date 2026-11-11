import { app } from "./app";
import { env } from "./config/env";
import "./config/firebase";
import { prisma } from "./db/prisma";

const server = app.listen(env.PORT, () => {
  console.log(`Chat API listening on http://localhost:${env.PORT}`);
});

function shutdown() {
  server.close(() => {
    void prisma.$disconnect().finally(() => {
      process.exit(0);
    });
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
