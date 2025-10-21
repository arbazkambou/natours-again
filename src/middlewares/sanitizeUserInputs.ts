import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";

export function sanitizeUserInputs(req: Request, res: Response, next: NextFunction) {
  const sanitize = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = sanitizeHtml(obj[key], { allowedTags: [], allowedAttributes: {} });
      }
    }
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
}
