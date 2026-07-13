export type EventStatus = "upcoming" | "live" | "ended" | "cancelled";

export type EventType =
  | "livestream"
  | "premiere"
  | "fan-meeting"
  | "giveaway"
  | "workshop"
  | "offline"
  | "launch";

export interface EventScheduleItem {
  time: string;
  title: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  banner: string;
  type: EventType;
  status: EventStatus;
  startAt: string;
  endAt?: string;
  location?: string;
  platform?: string;
  externalUrl?: string;
  schedule?: readonly EventScheduleItem[];
  featured: boolean;
}
