import "server-only";

export type ContentSource = "database" | "mock";

export function getContentSource(): ContentSource {
  const value = process.env.USE_DATABASE_CONTENT?.trim().toLowerCase();

  if (value === undefined || value === "" || value === "false") {
    return "mock";
  }

  if (value === "true") {
    return "database";
  }

  throw new Error("USE_DATABASE_CONTENT must be either 'true' or 'false'");
}
