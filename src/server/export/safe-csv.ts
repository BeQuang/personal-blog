import "server-only";

const formulaPrefixPattern = /^[\t\r\n ]*[=+\-@]/;

export function escapeCsvCell(value: unknown) {
  const raw = value === null || value === undefined ? "" : String(value);
  const normalized = raw.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  const safe = formulaPrefixPattern.test(normalized) ? `'${normalized}` : normalized;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function createCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]) {
  return [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");
}
