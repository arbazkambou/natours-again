import { app } from "#app.js";

const port = process.env.PORT ?? "9001";

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
