import { ZodError } from "zod";

export function formatZodError(error: ZodError) {
  return error.issues.map((error) => `${error.path}: ${error.message}`);
}
