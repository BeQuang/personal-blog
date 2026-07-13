import {
  AtSign,
  Camera,
  Globe2,
  Hash,
  Mail,
  MessageCircle,
  Music2,
  Send,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

import type { SocialPlatform } from "@/types";
import { cn } from "@/utils/cn";

const iconByPlatform: Record<SocialPlatform, LucideIcon> = {
  facebook: MessageCircle,
  youtube: Video,
  tiktok: Music2,
  instagram: Camera,
  x: AtSign,
  threads: Hash,
  zalo: MessageCircle,
  telegram: Send,
  discord: Users,
  website: Globe2,
  email: Mail,
};

interface SocialIconProps {
  platform: SocialPlatform;
  size?: number;
  className?: string;
}

export function SocialIcon({
  platform,
  size = 20,
  className,
}: SocialIconProps) {
  const Icon = iconByPlatform[platform];
  return <Icon aria-hidden="true" size={size} className={cn("shrink-0", className)} />;
}
