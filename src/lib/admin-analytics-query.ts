export type AdminAnalyticsSearchParams = Record<
  string,
  string | string[] | undefined
>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isValidDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime())
    && parsed.toISOString().startsWith(value);
}

export function analyticsDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function resolveAdminAnalyticsRange(
  params: AdminAnalyticsSearchParams,
  now = new Date(),
) {
  const today = new Date(now);
  const defaultFrom = new Date(today);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 29);
  const fallback = {
    from: analyticsDateInput(defaultFrom),
    to: analyticsDateInput(today),
  };
  const from = first(params.from);
  const to = first(params.to);

  if (
    !from
    || !to
    || !isValidDateInput(from)
    || !isValidDateInput(to)
  ) {
    return fallback;
  }

  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T00:00:00.000Z`);
  const days =
    Math.floor((toDate.getTime() - fromDate.getTime()) / 86_400_000) + 1;

  if (!Number.isFinite(days) || days < 1 || days > 366) {
    return fallback;
  }

  return { from, to };
}
