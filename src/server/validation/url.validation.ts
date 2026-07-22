import "server-only";

import { z } from "zod";

const maximumUrlLength = 2_048;

export const httpUrlSchema = z
  .string()
  .trim()
  .max(maximumUrlLength)
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        (url.protocol === "http:" || url.protocol === "https:") &&
        !url.username &&
        !url.password
      );
    } catch {
      return false;
    }
  }, "URL must use HTTP or HTTPS and must not contain credentials");

export const internalPathSchema = z
  .string()
  .trim()
  .max(maximumUrlLength)
  .refine(
    (value) =>
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\"),
    "Internal path must start with one slash",
  );

export const internalOrHttpUrlSchema = z.union([
  internalPathSchema,
  httpUrlSchema,
]);
