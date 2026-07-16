const DEFAULT_LOCALE = "vi-VN";
const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";

function parseDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = parseDate(value);
  if (!date) {
    return "Ngày chưa xác định";
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: DEFAULT_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatDateTime(value: string | Date): string {
  return formatDate(value, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value: string | Date): string {
  const date = parseDate(value);
  if (!date) return "Giờ chưa xác định";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DEFAULT_TIME_ZONE,
  }).format(date);
}

export function formatDay(value: string | Date): string {
  const date = parseDate(value);
  if (!date) return "--";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "2-digit",
    timeZone: DEFAULT_TIME_ZONE,
  }).format(date);
}

export function formatMonthYear(value: string | Date): string {
  const date = parseDate(value);
  if (!date) return "Chưa xác định";

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: "short",
    year: "numeric",
    timeZone: DEFAULT_TIME_ZONE,
  }).format(date);
}

export function toTimestamp(value: string | Date | undefined): number {
  if (!value) {
    return 0;
  }

  return parseDate(value)?.getTime() ?? 0;
}
