import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const sourceRoot = join(process.cwd(), "src");
const failures = [];

function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(absolutePath);
      continue;
    }
    if (extname(entry.name) !== ".tsx") continue;

    const source = readFileSync(absolutePath, "utf8");
    const tableCount = source.match(/<Table(?:<[^>]+>)?\s/g)?.length ?? 0;
    if (tableCount === 0) continue;

    const paginationCount = source.match(/\bpagination\s*=/g)?.length ?? 0;
    const displayPath = relative(process.cwd(), absolutePath);

    if (paginationCount < tableCount) {
      failures.push(
        `${displayPath}: ${tableCount} Table nhưng chỉ có ${paginationCount} cấu hình pagination.`,
      );
    }
    if (!source.includes("adminTablePaginationDefaults")) {
      failures.push(
        `${displayPath}: Table chưa dùng adminTablePaginationDefaults.`,
      );
    }
    if (/pagination\s*=\s*\{\s*false\s*\}/.test(source)) {
      failures.push(`${displayPath}: không được tắt pagination của Table.`);
    }
    if (/showSizeChanger\s*:\s*false/.test(source)) {
      failures.push(`${displayPath}: không được ẩn bộ chọn số dòng.`);
    }
  }
}

visit(sourceRoot);

if (failures.length > 0) {
  console.error("Admin table pagination audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Admin table pagination audit passed.");
}
