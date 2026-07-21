import "server-only";

import { MuxVideoProvider } from "./mux-provider";
import type { VideoProvider } from "./video-provider";

let videoProvider: VideoProvider | undefined;

export function getVideoProvider(): VideoProvider {
  videoProvider ??= new MuxVideoProvider();
  return videoProvider;
}

export type { VideoProvider } from "./video-provider";
export type * from "./video.types";
