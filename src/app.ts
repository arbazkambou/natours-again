import { readJsonFile, writeToJsonFile } from "#helpers/file-helpers.js";
import { Tour, TourSchema } from "#modules/tours/tours.schemas.js";
import express from "express";
import z from "zod";

const app = express();
const port = process.env.PORT ?? "9001";

app.use(express.json());

const tours = readJsonFile("src/dev-data/data/tours-simple.json") as Tour[];

app.get("/tours", (req, res) => {
  res.status(200).json({ status: true, data: { tours } });
  console.log("Response sent");
});

app.post("/tours", async (req, res) => {
  const parsed = TourSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ status: false, errors: parsed.error.issues.map((error) => `${error.path}: ${error.message}`) });
  }

  const newTour: Tour = { id: tours[tours.length - 1].id, ...parsed.data };
  tours.push(newTour);

  await writeToJsonFile("src/dev-data/data/tours-simple.json", tours);

  res.status(201).json({
    status: true,
    data: {
      tour: newTour,
    },
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
