import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const apiRoot = join(process.cwd(), "src", "app", "api");
const allowedUnpagedGetRoutes = new Set([
  "src\\app\\api\\admin\\submissions\\export\\route.ts",
  "src/app/api/admin/submissions/export/route.ts",
]);
const failures = [];

function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(absolutePath);
      continue;
    }
    if (entry.name !== "route.ts" || extname(entry.name) !== ".ts") continue;

    const source = readFileSync(absolutePath, "utf8");
    if (!/export\s+(?:async\s+)?function\s+GET\b/.test(source)) continue;

    const displayPath = relative(process.cwd(), absolutePath);
    if (allowedUnpagedGetRoutes.has(displayPath)) continue;
    if (!source.includes("handleAdminListRequest")) {
      failures.push(
        `${displayPath}: GET list route phải dùng handleAdminListRequest và hợp đồng page/pageSize/sortBy/sortOrder.`,
      );
    }
  }
}

visit(apiRoot);

if (failures.length > 0) {
  console.error("List API contract audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("List API contract audit passed.");
}
