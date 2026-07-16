import type { EventStatus, EventType } from "@/types";

export const eventStatusLabels: Record<EventStatus, string> = {
  upcoming: "Sắp diễn ra",
  live: "Đang trực tiếp",
  ended: "Đã kết thúc",
  cancelled: "Đã hủy",
};

export const eventTypeLabels: Record<EventType, string> = {
  livestream: "Livestream",
  premiere: "Công chiếu",
  "fan-meeting": "Fan meeting",
  giveaway: "Giveaway",
  workshop: "Workshop",
  offline: "Sự kiện offline",
  launch: "Ra mắt",
};
