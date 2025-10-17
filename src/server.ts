import { app } from "#app.js";
import { connectDB } from "#config/db.js";

const port = process.env.PORT ?? "9001";
const connectionString = process.env.CONNECTION_STRING as string;

(async function startServer() {
  await connectDB(connectionString);
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
})();

process.on("unhandledRejection", (err: any) => {
  console.error("UNHANDLED REJECTION 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
