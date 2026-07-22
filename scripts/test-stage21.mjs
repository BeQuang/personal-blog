import { spawnSync } from "node:child_process";

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("npm_execpath is unavailable");
const scripts = [
  "test:security",
  "test:database",
  "content:test",
  "content:test:authorization",
  "storage:test:security",
  "video:test",
  "submissions:test:security",
  "analytics:test",
];

for (const script of scripts) {
  const result = spawnSync(process.execPath, [npmCli, "run", script], {
    stdio: "inherit",
    shell: false,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("Stage 21 test suite: Passed");
