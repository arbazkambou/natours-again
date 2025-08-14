import fs from "fs";
import path from "path";
import { promises as asyncFs } from "fs";

export function readJsonFile(pathFromRoot: string) {
  const fullPath = path.resolve(process.cwd(), pathFromRoot);
  const text = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(text);
}

export async function writeToJsonFile<T>(pathFromRoot: string, data: T): Promise<void> {
  const fullPath = path.resolve(process.cwd(), pathFromRoot);
  const jsonData = JSON.stringify(data, null, 2);
  await asyncFs.writeFile(fullPath, jsonData, "utf-8");
}
