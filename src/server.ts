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
