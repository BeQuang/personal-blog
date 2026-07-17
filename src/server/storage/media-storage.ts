import "server-only";

import { R2Storage } from "./r2-storage";
import type { MediaStorage } from "./storage.types";

let mediaStorage: MediaStorage | undefined;

export function getMediaStorage(): MediaStorage {
  mediaStorage ??= new R2Storage();
  return mediaStorage;
}

export type { MediaStorage } from "./storage.types";
