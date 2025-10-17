import jwt from "jsonwebtoken";

export function generateJWT(id: unknown) {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "90d",
  });
}
