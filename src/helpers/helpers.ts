import path from "path";
import fs from "fs/promises";
import { ZodError } from "zod";

export function formatZodError<T>(error: ZodError) {
  return error.issues.map((error) => `${error.path}: ${error.message}`);
}

export async function readJsonFile(pathFromRoot: string) {
  const fullPath = path.resolve(process.cwd(), pathFromRoot);
  const text = await fs.readFile(fullPath, "utf-8");
  return JSON.parse(text);
}

// Mapping user-friendly operators → MongoDB operators
const operatorMap: Record<string, string> = {
  gt: "$gt", // greater than
  gte: "$gte", // greater than or equal
  lt: "$lt", // less than
  lte: "$lte", // less than or equal
  ne: "$ne", // not equal
  eq: "$eq", // equal
};

export function buildFilters(query: Record<string, any>, allowedFilters: string[]): Record<string, any> {
  const filters: Record<string, any> = {};

  for (const key in query) {
    if (!allowedFilters.includes(key)) {
      // Option 1: Ignore silently
      continue;

      // Option 2: Throw error instead
      // throw new Error(`Filter "${key}" is not allowed`);
    }

    const value = query[key];

    if (typeof value === "object") {
      // Advanced filtering: e.g. duration[gt]=10
      filters[key] = {};
      for (const op in value) {
        if (operatorMap[op]) {
          filters[key][operatorMap[op]] = isNaN(Number(value[op])) ? value[op] : Number(value[op]);
        }
      }
    } else {
      // Simple filtering: e.g. difficulty=easy
      filters[key] = isNaN(Number(value)) ? value : Number(value);
    }
  }

  return filters;
}
