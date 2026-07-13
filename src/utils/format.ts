const numberFormatter = new Intl.NumberFormat("vi-VN");

export function formatViewCount(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    return "0";
  }

  if (value >= 1_000_000) {
    return `${formatCompact(value / 1_000_000)} Tr`;
  }

  if (value >= 1_000) {
    return `${formatCompact(value / 1_000)} N`;
  }

  return numberFormatter.format(value);
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}
