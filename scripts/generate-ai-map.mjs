import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(root, "docs", "ai-map");
const checkOnly = process.argv.includes("--check");
const sourceExtensions = new Set([
  ".css",
  ".js",
  ".json",
  ".mjs",
  ".mts",
  ".sql",
  ".ts",
  ".tsx",
]);
const topLevelSources = [
  ".env.example",
  "AGENTS.md",
  "drizzle.config.ts",
  "eslint.config.mjs",
  "next.config.ts",
  "package.json",
  "postcss.config.mjs",
  "tsconfig.json",
];

function portablePath(value) {
  return value.replaceAll("\\", "/");
}

function walk(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(absolutePath));
    } else if (sourceExtensions.has(extname(entry.name))) {
      files.push(absolutePath);
    }
  }
  return files;
}

function unique(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function markdownCell(value) {
  return String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\r", "")
    .replaceAll("\n", "<br>");
}

function markdownTable(headers, rows) {
  const header = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map(
    (row) => `| ${row.map(markdownCell).join(" | ")} |`,
  );
  return [header, separator, ...body].join("\n");
}

function extractImports(content) {
  const imports = [];
  const expression =
    /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
  for (const match of content.matchAll(expression)) imports.push(match[1]);
  const dynamicExpression = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
  for (const match of content.matchAll(dynamicExpression)) imports.push(match[1]);
  return unique(imports);
}

function extractExports(content) {
  const names = [];
  const declaration =
    /\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g;
  for (const match of content.matchAll(declaration)) names.push(match[1]);

  const exportList = /\bexport\s*\{([^}]+)\}/g;
  for (const match of content.matchAll(exportList)) {
    for (const item of match[1].split(",")) {
      const name = item.trim().split(/\s+as\s+/)[1] ?? item.trim().split(/\s+as\s+/)[0];
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.push(name);
    }
  }
  return unique(names);
}

function extractValueExports(content) {
  const names = [];
  const declaration =
    /\bexport\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/g;
  for (const match of content.matchAll(declaration)) names.push(match[1]);
  return unique(names);
}

function resolveLocalImport(fromFile, specifier, knownPaths) {
  let basePath;
  if (specifier.startsWith("@/")) {
    basePath = `src/${specifier.slice(2)}`;
  } else if (specifier.startsWith(".")) {
    basePath = portablePath(
      relative(root, resolve(dirname(join(root, fromFile)), specifier)),
    );
  } else {
    return null;
  }

  const candidates = [
    basePath,
    ...[...sourceExtensions].map((extension) => `${basePath}${extension}`),
    ...[...sourceExtensions].map(
      (extension) => `${basePath}/index${extension}`,
    ),
  ];
  return candidates.find((candidate) => knownPaths.has(candidate)) ?? null;
}

function classifyFile(pathname) {
  if (pathname.startsWith("src/app/api/")) return "route-handler";
  if (/^src\/app\/.*\/page\.tsx?$/.test(pathname) || pathname === "src/app/page.tsx") {
    return "page";
  }
  if (/^src\/app\/.*\/layout\.tsx?$/.test(pathname) || pathname === "src/app/layout.tsx") {
    return "layout";
  }
  if (pathname.startsWith("src/components/")) return "component";
  if (pathname.startsWith("src/actions/")) return "server-action";
  if (pathname.startsWith("src/server/services/")) return "service";
  if (pathname.startsWith("src/server/repositories/")) return "repository";
  if (pathname.startsWith("src/server/mappers/")) return "mapper";
  if (pathname.startsWith("src/server/database/schema/")) return "database-schema";
  if (pathname.startsWith("src/server/database/migrations/")) return "migration";
  if (pathname.startsWith("src/server/")) return "server-infrastructure";
  if (pathname.startsWith("src/services/")) return "public-service-facade";
  if (pathname.startsWith("src/types/")) return "type";
  if (pathname.startsWith("src/config/")) return "configuration";
  if (pathname.startsWith("src/data/")) return "mock-fixture";
  if (pathname.startsWith("src/lib/") || pathname.startsWith("src/utils/")) return "shared-helper";
  if (pathname.startsWith("scripts/test-")) return "test-script";
  if (pathname.startsWith("scripts/")) return "operation-script";
  return "project-config";
}

function routePath(pathname) {
  if (pathname === "src/app/sitemap.ts") return "/sitemap.xml";
  if (pathname === "src/app/robots.ts") return "/robots.txt";
  const directory = portablePath(dirname(pathname)).replace(/^src\/app\/?/, "");
  const segments = directory
    .split("/")
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .filter((segment) => !segment.startsWith("@"));
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

const absoluteFiles = unique([
  ...walk(join(root, "src")),
  ...walk(join(root, "scripts")),
  ...topLevelSources
    .map((pathname) => join(root, pathname))
    .filter((pathname) => existsSync(pathname) && statSync(pathname).isFile()),
]);

const files = absoluteFiles.map((absolutePath) => {
  const pathname = portablePath(relative(root, absolutePath));
  const content = readFileSync(absolutePath, "utf8");
  return {
    absolutePath,
    path: pathname,
    content,
    imports: extractImports(content),
    exports: extractExports(content),
    valueExports: extractValueExports(content),
    kind: classifyFile(pathname),
    lines: content.split(/\r?\n/).length,
    hash: sha256(content).slice(0, 12),
    client: /^\s*["']use client["'];?/m.test(content),
  };
});

const knownPaths = new Set(files.map((file) => file.path));
for (const file of files) {
  file.localImports = unique(
    file.imports
      .map((specifier) => resolveLocalImport(file.path, specifier, knownPaths))
      .filter(Boolean),
  );
}

const importedBy = new Map(files.map((file) => [file.path, []]));
for (const file of files) {
  for (const importedPath of file.localImports) {
    importedBy.get(importedPath)?.push(file.path);
  }
}
for (const paths of importedBy.values()) paths.sort();

const fingerprint = sha256(
  files.map((file) => `${file.path}\0${sha256(file.content)}`).join("\0"),
);
const sourceLineCount = files.reduce((total, file) => total + file.lines, 0);

const routes = files
  .filter((file) =>
    /(?:^|\/)(page|route)\.(?:ts|tsx)$/.test(file.path)
    || file.path === "src/app/sitemap.ts"
    || file.path === "src/app/robots.ts",
  )
  .map((file) => {
    const isHandler = /\/route\.ts$/.test(file.path);
    const isMetadataRoute =
      file.path === "src/app/sitemap.ts" || file.path === "src/app/robots.ts";
    const methods = isHandler
      ? unique(
          [...file.content.matchAll(/\bexport\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g)]
            .map((match) => match[1]),
        )
      : isMetadataRoute ? ["GET"] : ["PAGE"];
    return {
      path: routePath(file.path),
      kind: isHandler
        ? "Route Handler"
        : isMetadataRoute
          ? "Metadata route"
          : file.path.includes("/admin/")
            ? "Admin page"
            : "Public page",
      methods,
      file,
      dependencies: file.localImports,
    };
  })
  .sort((left, right) =>
    left.path.localeCompare(right.path) || left.kind.localeCompare(right.kind),
  );

const components = files
  .filter((file) => file.kind === "component")
  .map((file) => ({
    ...file,
    componentExports: file.valueExports.filter((name) => /^[A-Z]/.test(name)),
    usedBy: importedBy.get(file.path) ?? [],
  }))
  .sort((left, right) => left.path.localeCompare(right.path));

const moduleGroups = [
  ["Server Actions", "server-action"],
  ["Public service facades", "public-service-facade"],
  ["Application services", "service"],
  ["Repositories", "repository"],
  ["Mappers", "mapper"],
  ["Server infrastructure", "server-infrastructure"],
];

const databaseTables = [];
const databaseEnums = [];
for (const file of files.filter((item) => item.kind === "database-schema")) {
  const tableExpression =
    /export\s+const\s+(\w+)\s*=\s*pgTable\(\s*["']([^"']+)["']/g;
  for (const match of file.content.matchAll(tableExpression)) {
    databaseTables.push({
      symbol: match[1],
      table: match[2],
      file: file.path,
    });
  }

  const enumExpression =
    /export\s+const\s+(\w+)\s*=\s*pgEnum\(\s*["']([^"']+)["']\s*,\s*\[([\s\S]*?)\]\s*\)/g;
  for (const match of file.content.matchAll(enumExpression)) {
    databaseEnums.push({
      symbol: match[1],
      name: match[2],
      values: [...match[3].matchAll(/["']([^"']+)["']/g)].map(
        (value) => value[1],
      ),
      file: file.path,
    });
  }
}
databaseTables.sort((left, right) => left.table.localeCompare(right.table));
databaseEnums.sort((left, right) => left.name.localeCompare(right.name));

const environmentVariables = new Map();
function registerEnvironmentVariable(name, file, declared) {
  const current = environmentVariables.get(name) ?? {
    name,
    declared: false,
    references: [],
  };
  current.declared ||= declared;
  if (file && !current.references.includes(file)) current.references.push(file);
  environmentVariables.set(name, current);
}

for (const file of files) {
  for (const match of file.content.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) {
    registerEnvironmentVariable(match[1], file.path, false);
  }
}
const envExample = files.find((file) => file.path === ".env.example");
if (envExample) {
  for (const line of envExample.content.split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=/);
    if (match) registerEnvironmentVariable(match[1], null, true);
  }
}
const environmentRows = [...environmentVariables.values()]
  .map((item) => ({
    ...item,
    references: item.references.sort(),
    exposure: item.name.startsWith("NEXT_PUBLIC_") ? "Client + server" : "Server only",
  }))
  .sort((left, right) => left.name.localeCompare(right.name));

const packageJson = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
);
const dependencies = Object.entries(packageJson.dependencies ?? {}).sort(
  ([left], [right]) => left.localeCompare(right),
);
const devDependencies = Object.entries(packageJson.devDependencies ?? {}).sort(
  ([left], [right]) => left.localeCompare(right),
);

const featureOwnership = [
  ["Site shell & homepage", "/", "src/app/page.tsx, src/app/layout.tsx, src/components/home, src/components/layout"],
  ["Blog & taxonomy", "/blog, /blog/[slug]", "src/components/blog, src/server/services/posts.service.ts, taxonomies.service.ts"],
  ["Video", "/videos", "src/components/videos, src/server/services/videos.service.ts, src/server/video"],
  ["Gallery & media", "/gallery, /admin/gallery", "src/components/gallery, src/server/services/gallery.service.ts, media.service.ts"],
  ["Events", "/events, /events/[slug]", "src/components/events, src/server/services/events.service.ts"],
  ["Campaigns", "/campaigns, /campaigns/[slug]", "src/components/campaigns, src/server/services/campaigns.service.ts"],
  ["Contact, newsletter & submissions", "/contact, /newsletter/unsubscribe, /admin/submissions", "src/components/contact, src/server/services/submissions.service.ts"],
  ["Authentication & RBAC", "/admin/login, /auth/callback", "src/server/auth, src/server/supabase, src/proxy.ts"],
  ["Admin CMS & settings", "/admin/**", "src/components/admin, src/actions, src/server/services/settings.service.ts"],
  ["Analytics", "/api/analytics/events, /admin", "src/components/analytics, src/lib/analytics.ts, src/server/services/analytics.service.ts"],
  ["SEO, legal & platform security", "/privacy, /terms, /sitemap.xml, /robots.txt", "src/lib/metadata.ts, next.config.ts, src/config/security.config.ts"],
];

const generatedFiles = new Map();

generatedFiles.set(
  "README.md",
  `# AI system map

Thư mục này được tạo tự động bởi \`npm run ai:setup\`. Không sửa tay các file trong đây vì lần quét tiếp theo sẽ ghi đè.

## Trình tự đọc bắt buộc cho AI và thành viên mới

1. Đọc [PROJECT_SPEC.md](../../PROJECT_SPEC.md) để hiểu hợp đồng sản phẩm và kiến trúc.
2. Đọc [SYSTEM_MAP.md](./SYSTEM_MAP.md) để nắm luồng tổng thể và fingerprint hiện tại.
3. Mở tài liệu nghiệp vụ phù hợp trong [docs/features](../features/README.md).
4. Tra [ROUTES.md](./ROUTES.md), [COMPONENTS.md](./COMPONENTS.md), [BACKEND.md](./BACKEND.md) và [DATA_MODEL.md](./DATA_MODEL.md) trước khi tạo code mới.
5. Dùng [SOURCE_INDEX.md](./SOURCE_INDEX.md) và cột “Imported by” để đánh giá phạm vi ảnh hưởng.

## Lệnh

- \`npm run ai:start\`: lệnh mở đầu phiên; sinh lại map và in checklist bắt buộc.
- \`npm run ai:setup\`: quét lại source và cập nhật toàn bộ system map.
- \`npm run ai:check\`: không ghi file; trả mã lỗi nếu map đã cũ so với source.

Prompt mẫu cho AI không tự đọc \`AGENTS.md\`: [AI_START_HERE.md](../../AI_START_HERE.md).

Source fingerprint hiện tại: \`${fingerprint}\`.
`,
);

generatedFiles.set(
  "SYSTEM_MAP.md",
  `# System map

> Generated artifact — source fingerprint: \`${fingerprint}\`

## Snapshot

- ${files.length} file source/config đã quét, ${sourceLineCount.toLocaleString("en-US")} dòng.
- ${routes.filter((route) => route.kind === "Public page" || route.kind === "Admin page").length} page route.
- ${routes.filter((route) => route.kind === "Route Handler").length} Route Handler.
- ${routes.filter((route) => route.kind === "Metadata route").length} metadata route.
- ${components.length} module component, ${components.filter((component) => component.client).length} Client Component.
- ${databaseTables.length} bảng PostgreSQL, ${databaseEnums.length} enum.
- ${environmentRows.length} biến môi trường được khai báo hoặc tham chiếu.

## Bản đồ kiến trúc

\`\`\`mermaid
flowchart TD
  Browser[Browser / người dùng]
  App[Next.js App Router pages & layouts]
  UI[Feature components]
  Facade[Public service facades]
  Actions[Server Actions]
  Routes[Route Handlers]
  Services[Application services]
  Auth[Supabase Auth + RBAC]
  Repo[Repositories + mappers]
  DB[(PostgreSQL / Drizzle / RLS)]
  R2[Cloudflare R2]
  Mux[Mux Video]
  Resend[Resend]
  Guard[Turnstile + Upstash]

  Browser --> App
  App --> UI
  App --> Facade
  UI --> Actions
  UI --> Routes
  Facade --> Services
  Actions --> Services
  Routes --> Services
  Services --> Auth
  Services --> Repo
  Repo --> DB
  Services --> R2
  Services --> Mux
  Services --> Resend
  Services --> Guard
\`\`\`

## Feature ownership

${markdownTable(
  ["Feature", "Route", "Source chính"],
  featureOwnership,
)}

## Boundary phải giữ

- Page/layout ưu tiên là Server Component; chỉ thêm \`"use client"\` ở interaction boundary.
- UI không gọi repository hoặc database trực tiếp.
- Mutation từ UI đi qua \`src/actions\`; HTTP/webhook boundary đi qua \`src/app/**/route.ts\`.
- Service chứa nghiệp vụ, authorization và validation; repository chỉ truy cập Drizzle.
- Mapper chuyển database row thành DTO ổn định cho FE.
- Public content đi qua \`src/services/*\` facade để giữ khả năng chuyển \`USE_DATABASE_CONTENT\` giữa mock và database.
- Server-only secret không được đưa vào biến \`NEXT_PUBLIC_*\`.

## Quy tắc tránh code trùng

1. Tra component có sẵn trong [COMPONENTS.md](./COMPONENTS.md), đặc biệt \`common\`, \`admin\`, picker/table/modal.
2. Tra export service/action trong [BACKEND.md](./BACKEND.md); không tạo đường truy cập DB thứ hai cho cùng nghiệp vụ.
3. Tra type trong \`src/types\`, validation trong \`src/server/validation\`, config trong \`src/config\`.
4. Kiểm tra “Imported by” trong [SOURCE_INDEX.md](./SOURCE_INDEX.md) trước khi đổi contract.
5. Đọc feature doc trước khi sửa và cập nhật file đó ngay trong cùng thay đổi.
6. Feature mới phải có file riêng trong \`docs/features\`, được thêm vào mục lục và feature ownership.
7. Sau lần sửa source/config cuối cùng, chạy \`npm run ai:setup\`; chỉ hoàn tất khi \`npm run ai:check\` pass.
`,
);

generatedFiles.set(
  "ROUTES.md",
  `# Route map

> Generated artifact — source fingerprint: \`${fingerprint}\`

Route group như \`(protected)\` không tạo URL segment. Route Handler của Next.js 16 dùng Web Request/Response API và không cache mặc định.

${markdownTable(
  ["URL", "Loại", "Method", "File", "Phụ thuộc nội bộ trực tiếp"],
  routes.map((route) => [
    `\`${route.path}\``,
    route.kind,
    route.methods.join(", "),
    `\`${route.file.path}\``,
    route.dependencies.map((value) => `\`${value}\``).join("<br>"),
  ]),
)}
`,
);

generatedFiles.set(
  "COMPONENTS.md",
  `# Component catalog

> Generated artifact — source fingerprint: \`${fingerprint}\`

Tra bảng này trước khi tạo component mới. “Client” chỉ ra module có directive \`"use client"\`; Server Component không có directive.

${markdownTable(
  ["Module", "Exports UI", "Runtime", "Imported by"],
  components.map((component) => [
    `\`${component.path}\``,
    component.componentExports.length
      ? component.componentExports.map((value) => `\`${value}\``).join(", ")
      : "—",
    component.client ? "Client" : "Server-compatible",
    component.usedBy.length
      ? component.usedBy.map((value) => `\`${value}\``).join("<br>")
      : "Chưa có import nội bộ",
  ]),
)}
`,
);

const backendSections = moduleGroups
  .map(([title, kind]) => {
    const groupFiles = files.filter((file) => file.kind === kind);
    return `## ${title}

${markdownTable(
  ["File", "Exports", "Imports nội bộ", "Imported by"],
  groupFiles.map((file) => [
    `\`${file.path}\``,
    file.exports.length
      ? file.exports.map((value) => `\`${value}\``).join(", ")
      : "—",
    file.localImports.length
      ? file.localImports.map((value) => `\`${value}\``).join("<br>")
      : "—",
    (importedBy.get(file.path) ?? []).length
      ? (importedBy.get(file.path) ?? [])
          .map((value) => `\`${value}\``)
          .join("<br>")
      : "—",
  ]),
)}`;
  })
  .join("\n\n");

generatedFiles.set(
  "BACKEND.md",
  `# Backend module map

> Generated artifact — source fingerprint: \`${fingerprint}\`

Luồng chuẩn: \`page/client component → Server Action hoặc Route Handler → service → repository → Drizzle/PostgreSQL\`. Public read có thêm facade \`src/services\`; DTO được chuẩn hóa ở mapper.

${backendSections}
`,
);

generatedFiles.set(
  "DATA_MODEL.md",
  `# Data model map

> Generated artifact — source fingerprint: \`${fingerprint}\`

## PostgreSQL tables

${markdownTable(
  ["Table", "Drizzle symbol", "Schema file"],
  databaseTables.map((item) => [
    `\`${item.table}\``,
    `\`${item.symbol}\``,
    `\`${item.file}\``,
  ]),
)}

## PostgreSQL enums

${markdownTable(
  ["Enum", "Giá trị", "Schema file"],
  databaseEnums.map((item) => [
    `\`${item.name}\``,
    item.values.map((value) => `\`${value}\``).join(", "),
    `\`${item.file}\``,
  ]),
)}

## Migration

${files
  .filter((file) => file.kind === "migration")
  .map((file) => `- \`${file.path}\``)
  .join("\n")}
`,
);

generatedFiles.set(
  "ENVIRONMENT.md",
  `# Environment map

> Generated artifact — source fingerprint: \`${fingerprint}\`

Không ghi giá trị secret vào tài liệu hoặc log. “Có trong .env.example” chỉ nói biến đã được tài liệu hóa, không có nghĩa là biến luôn bắt buộc trong mọi chế độ.

${markdownTable(
  ["Biến", "Exposure", "Trong .env.example", "Được tham chiếu bởi"],
  environmentRows.map((item) => [
    `\`${item.name}\``,
    item.exposure,
    item.declared ? "Có" : "Không",
    item.references.length
      ? item.references.map((value) => `\`${value}\``).join("<br>")
      : "—",
  ]),
)}
`,
);

generatedFiles.set(
  "DEPENDENCIES.md",
  `# Package dependency map

> Generated artifact — source fingerprint: \`${fingerprint}\`

## Runtime dependencies

${markdownTable(
  ["Package", "Version"],
  dependencies.map(([name, version]) => [`\`${name}\``, `\`${version}\``]),
)}

## Development dependencies

${markdownTable(
  ["Package", "Version"],
  devDependencies.map(([name, version]) => [`\`${name}\``, `\`${version}\``]),
)}
`,
);

generatedFiles.set(
  "SOURCE_INDEX.md",
  `# Full source index

> Generated artifact — source fingerprint: \`${fingerprint}\`

Index này bao phủ \`src/\`, \`scripts/\` và các file cấu hình gốc ảnh hưởng đến build/runtime. Hash ngắn giúp nhận ra file đổi; “Imported by” là reverse dependency nội bộ trực tiếp.

${markdownTable(
  ["File", "Loại", "Dòng", "Hash", "Exports", "Imported by"],
  files.map((file) => [
    `\`${file.path}\``,
    file.kind,
    file.lines,
    `\`${file.hash}\``,
    file.exports.length
      ? file.exports.map((value) => `\`${value}\``).join(", ")
      : "—",
    (importedBy.get(file.path) ?? []).length
      ? (importedBy.get(file.path) ?? [])
          .map((value) => `\`${value}\``)
          .join("<br>")
      : "—",
  ]),
)}
`,
);

let stale = false;
for (const [filename, rawContent] of generatedFiles) {
  const content = `${rawContent.trim()}\n`;
  const outputPath = join(outputDirectory, filename);
  const existing = existsSync(outputPath)
    ? readFileSync(outputPath, "utf8")
    : null;

  if (existing === content) continue;
  stale = true;
  if (checkOnly) {
    console.error(`AI map is stale: docs/ai-map/${filename}`);
    continue;
  }
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(outputPath, content, "utf8");
  console.log(`Updated docs/ai-map/${filename}`);
}

if (checkOnly && stale) {
  console.error("Run `npm run ai:setup` and commit the generated map.");
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`AI map is current (${fingerprint.slice(0, 12)}).`);
} else {
  console.log(
    `AI source map ready: ${files.length} files, fingerprint ${fingerprint.slice(0, 12)}.`,
  );
}
