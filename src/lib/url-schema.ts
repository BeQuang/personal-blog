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
  }, "URL phải sử dụng HTTP hoặc HTTPS và không được chứa thông tin đăng nhập");

export const internalPathSchema = z
  .string()
  .trim()
  .max(maximumUrlLength)
  .refine(
    (value) =>
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\"),
    "Đường dẫn nội bộ phải bắt đầu bằng đúng một dấu /",
  );

export const internalOrHttpUrlSchema = z
  .string()
  .trim()
  .max(maximumUrlLength)
  .refine(
    (value) =>
      internalPathSchema.safeParse(value).success ||
      httpUrlSchema.safeParse(value).success,
    "Hãy nhập URL HTTP(S) hoặc đường dẫn nội bộ bắt đầu bằng /",
  );
