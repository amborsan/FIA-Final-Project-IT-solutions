import "dotenv/config";
import app from "./app.ts";
import { prisma } from "./prisma.ts";

const host = process.env.HOST || "localhost";
const port = Number(process.env.PORT || 3000);

// Fail at startup if the database cannot be reached.
await prisma.$connect();
app.locals.prisma = prisma;
const server = app.listen(port, host, () => {
  console.log(`API running at http://${host}:${port}`);
});

function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
