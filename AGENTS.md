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

## Completion gate

An AI agent must not report a feature change as complete until:

1. The matching feature document and, when applicable, `PROJECT_SPEC.md` are updated.
2. `npm run ai:setup` has been run after the last source/configuration edit.
3. `npm run ai:check` passes with no stale generated map.
4. `npm run lint`, `npm run type-check`, and focused tests pass.
5. The final diff is reviewed for missing docs, generated-map changes, secrets, unrelated edits, and duplicated abstractions.

For documentation-only edits, still run `npm run ai:setup` and `npm run ai:check`; the fingerprint may remain unchanged if no scanned source/config file changed.
