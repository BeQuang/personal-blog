import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const systemMap = readFileSync(
  join(root, "docs", "ai-map", "SYSTEM_MAP.md"),
  "utf8",
);
const fingerprint =
  systemMap.match(/source fingerprint: `([a-f0-9]+)`/)?.[1]?.slice(0, 12)
  ?? "unknown";

console.log(`
AI session baseline is ready (${fingerprint}).

Before editing:
1. Read AGENTS.md and PROJECT_SPEC.md.
2. Read docs/ai-map/SYSTEM_MAP.md.
3. Read the relevant docs/features/*.md file.
4. Search COMPONENTS.md, BACKEND.md, ROUTES.md and SOURCE_INDEX.md for reuse and impact.
5. Check git status and preserve unrelated user changes.

Before finishing any feature change:
1. Update the matching feature document in the same change.
2. Update PROJECT_SPEC.md when routes, architecture, data, environment, security or product contracts change.
3. Run npm run ai:setup after the final source/config edit.
4. Require npm run ai:check to pass, then run quality checks and focused tests.

Reusable startup prompt: AI_START_HERE.md
`);
