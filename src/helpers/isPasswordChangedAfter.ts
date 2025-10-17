import { UserType } from "#modules/users/user.schema.js";
import { isAfter } from "date-fns";

export function isPasswordChangedAfter(user: UserType, jwtTimeStamp: number) {
  if (user.passwordChangedAt) {
    const passwordChangedAt = new Date(user.passwordChangedAt);
    const jwtIssuedAt = new Date(jwtTimeStamp * 1000);
    return isAfter(passwordChangedAt, jwtIssuedAt);
  }

  return false;
}
