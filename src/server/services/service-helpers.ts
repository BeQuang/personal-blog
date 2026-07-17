import "server-only";

export { assertDateRange, createSlug, parseSlug, slugSchema } from "@/server/domain/content-rules";
import { mapDatabaseError } from "@/server/errors";

export async function executeRepository<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    throw mapDatabaseError(error);
  }
}
