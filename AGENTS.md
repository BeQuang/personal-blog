<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Personal Blog — AI startup protocol

The following lifecycle is mandatory for every AI agent.

## Session start — before any source edit

1. Run `npm run ai:start`. This refreshes the map from the current worktree and prints the required reading sequence.
2. Read `PROJECT_SPEC.md`, `docs/ai-map/SYSTEM_MAP.md`, and the relevant document in `docs/features/`.
3. Search `docs/ai-map/COMPONENTS.md`, `BACKEND.md`, `ROUTES.md`, `DATA_MODEL.md`, and `SOURCE_INDEX.md` for existing components, services, types, validators, routes, schema, and reverse dependencies.
4. Check `git status` and preserve unrelated user changes.
5. Before adding an abstraction, prove that the current catalog does not already provide it.
6. Read the relevant local Next.js 16.2.10 guide in `node_modules/next/dist/docs/` before changing a framework API.

## Source–documentation synchronization contract

Documentation is part of the feature, not a later cleanup task.

1. Before changing an existing feature, compare the request with its `docs/features/*.md` contract and identify which behavior, route, component, action, service, schema, permission, environment variable, or test is affected.
2. Update that feature document immediately in the same worktree change whenever implementation behavior or usage changes.
3. For a new feature, create a dedicated `docs/features/NN-feature-name.md`, add it to `docs/features/README.md`, and document public/admin usage, source ownership, data flow, business rules, permissions, environment variables, reuse points, and tests.
4. Update `PROJECT_SPEC.md` in the same change when the feature affects product scope, routes, architecture, data model, integrations, security, environment, commands, limitations, or Definition of Done.
5. If a new feature domain is added, update the `featureOwnership` catalog in `scripts/generate-ai-map.mjs` so it appears in the generated system map.
6. Never manually edit `docs/ai-map/*`; these are generated artifacts.
7. After the final source or configuration edit, run `npm run ai:setup` so every generated route/component/backend/schema/dependency map and fingerprint reflects the newest worktree.

## Implementation boundaries

1. Keep `page/component -> Server Action or Route Handler -> service -> repository -> Drizzle`.
2. Do not access repositories or the database directly from UI code.
3. Keep authorization, validation, audit, revalidation, DTO, and provider boundaries described by the feature document and `PROJECT_SPEC.md`.

## Admin table pagination standard

1. Every Ant Design `Table` in Admin must use `adminTablePaginationDefaults` from `src/components/admin/admin-table.config.ts` or an explicit extension of that shared config.
2. The default page-size choices are 10, 20, and 50 rows. Keep the size changer visible even on a single page, show the total count, and reset to page 1 when filters materially change the result set.
3. A server-driven paginated table backed by a Route Handler, Server Component query, or another remote read boundary must carry both `page` and `pageSize` through validation, service, and repository layers. The repository must apply database `LIMIT` and `OFFSET`; do not fetch an unbounded collection and slice it after a paginated API/remote read.
4. A table whose complete bounded DTO collection is intentionally already loaded may paginate locally, but it must still expose the same page-size selector.
5. If a screen needs custom page-size choices, normalize a caller-provided array through the shared helper, keep values within the server maximum, and document the override.
6. Sequential row numbers must use the active page and active page size, not a hard-coded constant.
7. `npm run ai:check` includes the Admin table pagination audit; do not bypass or weaken it when adding a table.

## List API pagination and ordering standard

1. Every API or remote read that returns a collection must accept validated `page`, `pageSize`, `sortBy`, and `sortOrder`. Admin list Route Handlers use `handleAdminListRequest`; default `pageSize` is 10 and the hard maximum is 100.
2. `sortBy` must be an allowlist owned by the feature service. Never interpolate a client-provided column or SQL fragment. Add a deterministic tie-breaker such as the entity ID after the requested sort.
3. The response contract is `{ items, total, page, pageSize, sortBy, sortOrder }`. Filters belong in the same validated query object and must be applied before `COUNT`, `LIMIT`, and `OFFSET`.
4. Repositories must execute bounded database reads with `COUNT + LIMIT + OFFSET + ORDER BY`. Never fetch an unbounded collection and paginate or sort it in UI/service memory.
5. Server Components call the paginated service directly for the initial render. Client-side page, page-size, filter, and sort changes call the matching Route Handler; do not make a Server Component call its own Route Handler.
6. An intentionally bounded lookup list, aggregate query, single-resource GET, webhook, or export may be exempt only when its bound/reason is documented in the feature contract. Do not silently turn a list API into an exception.
7. When adding a sortable field used at scale, review the database indexes and add a migration when needed.
8. `npm run ai:check` includes the list API contract audit. New GET collection routes must not bypass or weaken it.

## Completion gate

An AI agent must not report a feature change as complete until:

1. The matching feature document and, when applicable, `PROJECT_SPEC.md` are updated.
2. `npm run ai:setup` has been run after the last source/configuration edit.
3. `npm run ai:check` passes with no stale generated map.
4. `npm run lint`, `npm run type-check`, and focused tests pass.
5. The final diff is reviewed for missing docs, generated-map changes, secrets, unrelated edits, and duplicated abstractions.

For documentation-only edits, still run `npm run ai:setup` and `npm run ai:check`; the fingerprint may remain unchanged if no scanned source/config file changed.
