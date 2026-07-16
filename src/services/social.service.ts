import { socialLinks } from "@/data/social-links";
import type { SocialLink } from "@/types";
import { filterEnabledSocialLinks } from "@/utils/data";

export function getSocialLinks(): SocialLink[] {
  return [...socialLinks].sort((left, right) => left.order - right.order);
}

export function getEnabledSocialLinks(): SocialLink[] {
  return filterEnabledSocialLinks(socialLinks);
}
