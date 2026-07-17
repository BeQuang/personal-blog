import { ValidationError } from "@/server/errors";

export function requirePublicMediaUrl(
  media: { publicUrl: string | null } | null | undefined,
  entity: string,
) {
  if (!media?.publicUrl) {
    throw new ValidationError(`${entity} is missing a public media URL`);
  }

  return media.publicUrl;
}

export function toIsoString(value: Date | null | undefined) {
  return value?.toISOString();
}
