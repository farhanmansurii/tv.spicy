# REPORT - wt/ops-tests

Branch: `wt/ops-tests`. All changes are left uncommitted for review. No dependencies were added, nothing was installed, no files were deleted, and `package.json`, `app/layout.tsx`, `lib/auth.ts`, `app/api/**`, `components/**`, `store/**` were not touched.

## What changed and why

### F1 - CI workflow (`.github/workflows/ci.yml`, new)

A workflow named `CI` runs on every `push` and `pull_request` with four steps: `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm test`. It uses only `actions/checkout@v4` and `actions/setup-node@v4` (with `cache: npm`), so there are no third-party actions to pin. There is no build step.

The Node version problem: `package.json` has **no `engines` field**, so "match the engines field" could not be followed literally. I pinned `node-version: 24`, which is the major the checks were verified on (`node -v` here is `v24.20.0`), it is an active LTS line, and Next 16 only requires `>=20.9.0`. When someone adds an `engines` field, replace the pin with `node-version-file: package.json`, which `setup-node` reads from `engines.node`.

`npm ci` was **not executed** in this worktree: `node_modules` here is a symlink into the main checkout, and `npm ci` deletes `node_modules` first, which would have destroyed the main checkout's install. As a substitute I verified two things: the lockfile root entry matches every `package.json` dependency range (no lockfile drift), and `npx prisma generate` (the `postinstall` script) succeeds with an empty `DATABASE_URL`, which is the state CI will be in with no secrets configured.

### F2 - Production console stripping (`next.config.js`)

`removeConsole` was `true` in production, which strips every `console.*` call, including `console.error` in `app/error.tsx` and the auth warnings in `lib/auth.ts`. It is now:

```js
removeConsole:
	process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
```

`console.log`, `console.debug`, `console.info` and `console.trace` are still stripped in production; `error` and `warn` survive. I verified the semantics empirically instead of trusting the docs: I ran Next's own SWC pipeline (`next/dist/build/swc` with `loadBindings`) over `console.log/debug/warn/error` probes. `removeConsole: true` emptied all four calls, and `removeConsole: { exclude: ['error', 'warn'] }` kept exactly `console.warn` and `console.error`. `lib/auth.ts` was not modified; its `console.error`/`console.warn` calls now reach production logs again through this config change.

### F3 - Error boundary (`app/error.tsx`)

The old file had an empty production `useEffect` with a `TODO: Send to Sentry` comment, a generic message and a reload-style dead end.

- **Logging:** the `useEffect` now calls `console.error('[app/error] unhandled error', { digest, message, stack, route })` unconditionally, so the browser console keeps the record in production after the F2 change. Next's own server render path also logs caught errors to stdout (`console.error` sites in `node_modules/next/dist/server/app-render/app-render.js`), and those lines live in Next's compiled runtime, so the `removeConsole` transform never applied to them. Server-side failures therefore reach Vercel runtime logs today; this was confirmed by source inspection, not by a production run, because builds are excluded from this brief.
- **Recovery:** "Try again" still calls `reset`, which re-renders the failed segment without a full page reload. "Home" is unchanged.
- **Reporting:** a new "Copy error report" button copies a plain-text block with timestamp, route, digest, message and stack. If `navigator.clipboard` is unavailable, the same block is rendered in a `<pre>` so the user can copy it manually. The digest is always displayed as `Reference: <digest>` so a user can quote it and it can be matched against server logs. In development the message block is still shown inline.

No service was added. See "What a proper error-reporting integration requires" below.

### F4 - `.env.example` (new)

Created with every variable the source actually reads (grep of `process.env` across the repo, excluding `NODE_ENV`): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TMDB_BEARER_TOKEN`, `NEXT_PUBLIC_TMDB_API_KEY`, `TMDB_BEARER_TOKEN`, `TMDB_API_KEY`, `DATABASE_URL`, `PRISMA_DATABASE_URL`, `BETTER_AUTH_SECRET`, `NEXTAUTH_SECRET`, `BETTER_AUTH_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, plus commented notes for the platform-injected `VERCEL_URL` and `NODE_ENV`. Each entry says what it is for and whether it is required in production.

Safety: every value is an empty placeholder. Nothing was copied from `.env` or `.env.local`, and no real value appears anywhere in the file.

`README.md` was left unchanged. Its line 42 (`cp .env.example .env.local`) now resolves, because the file exists, and the rest of the setup section still describes the current flow.

### F5 - Manifest (`public/manifest.json`)

Field by field:

| Field | Was | Now | Why |
| --- | --- | --- | --- |
| `scope` | `"000026"` | `"/"` | The old value was not a path. |
| `dir` | `"rtl"` | `"ltr"` | The app is English left-to-right (`<html lang="en">`). |
| `start_url` | missing | `"/"` | Required for install; without it the PWA opens unpredictably. |
| `id` | missing | `"/"` | Stable identity so updates do not fork the install. |
| `name` / `short_name` | `"Spicy TV"` | unchanged | Matches the layout metadata. |
| `description` | mentioned anime | rewritten | The app is TMDB movies and TV, no anime catalogue. |
| `icons` | two 512px files | 192, 512 `any` plus 512 `maskable` | The store wants a 192px icon and a maskable variant; all three files exist in `public/`. |
| `background_color` / `theme_color` | `#383849` | `#000000` | The dark theme background in `app/globals.css` is `#000000`. |
| `display` | `"fullscreen"` | `"standalone"` | This is a browsable catalogue with nav and auth, not a kiosk; fullscreen hides browser chrome users need. |
| `lang` | `"en-GB"` | `"en"` | Matches `<html lang="en">`. |
| `orientation` | `"portrait"` | removed | The UI works both ways and video plays landscape; locking to portrait was wrong. |
| `shortcuts` | missing | `/movie`, `/tv`, `/search` | Real routes that exist under `app/`. |
| `categories` | missing | `entertainment`, `video` | Standard manifest categories for this app type. |

The file was still unreferenced, and `app/layout.tsx` is owned by another worker, so the link line is specified under "app/layout.tsx edits" below instead of being applied here. The `@imbios/next-pwa` package was not wired up: configuring it is a build-level change that belongs with the dependency decision, and a plain metadata link is enough to make the existing manifest reachable.

### F6 - Robots, sitemap and indexing

Decision: **the app should be indexable**, and robots, sitemap and the layout metadata now tell one story once you apply the layout edit below.

- `app/robots.ts` allows `/`, disallows `/api/`, `/auth/`, `/library`, `/profile` and `/search`, and points at `${SITE_URL}/sitemap.xml`.
- `app/sitemap.ts` drops `/search` and `/library`, which robots disallows, and keeps `/`, `/movie`, `/tv` and `/genres`.

Private or low-value surfaces stay out of the index, and the public catalogue is crawlable. This is consistent with `docs/superpowers/specs/2026-07-27-hobby-usage-guardrails-design.md`, which says verified search-engine crawlers are governed by `robots.txt`.

Flag for your decision: commit `df35898` ("Disable search engine indexing") deliberately set `index: false` and `Disallow: /` five commits ago. I followed the brief and chose the indexable intent, but that commit may have been protecting Vercel Hobby bandwidth. If the intent was to stay out of search, the correct one-story fix is the opposite (keep `disallow: '/'`, keep `index: false`, and remove the sitemap route from `app/sitemap.ts`). The layout edit below is the indexable direction.

### F7 - Regression tests (three new files)

Most of the suggested targets do not exist on this branch or on `main`: `lib/validation/api-schemas.ts`, `lib/api/route-responses.ts`, `lib/rate-limit.ts`, `lib/sync/user-storage.ts`, `lib/sync/membership.ts`, and any `safeCallbackUrl` helper under `app/api/auth` or `app/auth`. `grep` and `git ls-tree -r main` find none of them, and the source has no `zod` usage at all despite `zod` being in `dependencies`. So I targeted the behaviour that does exist and matches the intent:

- `lib/continue-watching.test.ts` - the merge, normalize, sanitize and clamp helpers that `lib/db/recently-watched.ts` delegates all of its merge behaviour to.
- `lib/db/recently-watched.test.ts` - the Prisma-backed paths with a stubbed client: invalid payload rejection without any database call, update versus create, progress clamping to 0-100, `mergeRecentlyWatchedBatch` writing the newer progress and deleting the stale row, and `updateWatchProgress` returning `null` for unknown rows.
- `app/api/tmdb/search/route.test.ts` - route-level validation (short query, page out of range, non-integer page all return 400 without an upstream call), the 200 path forwarding the query with `api_key`, the person filter, the cache headers, and the graceful empty result when TMDB fails.

## Files touched

Modified: `next.config.js`, `app/error.tsx`, `public/manifest.json`, `app/robots.ts`, `app/sitemap.ts`.
Created: `.github/workflows/ci.yml`, `.env.example`, `lib/continue-watching.test.ts`, `lib/db/recently-watched.test.ts`, `app/api/tmdb/search/route.test.ts`, `REPORT.md`.
Not modified although owned: `README.md` (see F4).

## Check results

Command run at the end: `npx tsc --noEmit && npm run lint && npm test`

- `npx tsc --noEmit`: passed, exit 0.
- `npm run lint`: passed, exit 0.
- `npm test`: passed, 28 tests, 0 failures, exit 0.

The three new test files, run directly:

- `npx node --test --import tsx lib/continue-watching.test.ts lib/db/recently-watched.test.ts app/api/tmdb/search/route.test.ts`: 14 tests, 14 passed, 0 failed.
- `npx tsx --test <same three files>`: 14 tests, 14 passed, 0 failed.
- `npx node --test <same three files>`: **fails**, for a reason that is not specific to my files. Node's native TypeScript loader does not resolve extensionless relative imports (`./route`, `./continue-watching`) and the existing tests fail the same way: `npx node --test lib/api/tmdb-client.test.ts` returns `ERR_MODULE_NOT_FOUND` for `./tmdb-client`. The working form in this repo is `node --test --import tsx <file>`, which is the loader `npm test` already uses via `tsx --test`.

About the warning that `npm test` can flake on live TMDB 5xx: I observed no live network calls in the current suite. The TMDB-facing test stubs `globalThis.fetch`, the provider and session tests are pure, and the bootstrap and write-coordinator tests use injected dependencies. All 28 passed on both the baseline run before my changes and the final run. If a 5xx does appear in CI, it will come from outside the assertions in these files.

## app/layout.tsx edits you must apply yourself

### F5 - link the manifest

Inside `export const generateMetadata = (): Metadata => ({`, add one line (the metadata key is `manifest?: null | string | URL`, verified in `next/dist/lib/metadata/types/metadata-interface.d.ts`):

```ts
	manifest: '/manifest.json',
```

Suggested placement, right after `applicationName: 'Spicy TV',`:

```ts
	applicationName: 'Spicy TV',
	manifest: '/manifest.json',
```

### F6 - flip the robots metadata

Replace lines 52-61 of `app/layout.tsx` (the current `robots: { index: false, ... }` block) with:

```ts
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
```

Without this edit the page meta tags still say `noindex`, which contradicts `app/robots.ts` and `app/sitemap.ts`.

## New test files needing a package.json script entry (F7)

`package.json` is owned by the dead-code worker, so these three files are not in the `test` script yet. The script is a fixed file list, so add:

- `lib/continue-watching.test.ts`
- `lib/db/recently-watched.test.ts`
- `app/api/tmdb/search/route.test.ts`

The resulting line for whoever owns the file:

```json
"test": "tsx --test components/features/media/episode/providers/providers.test.ts lib/api/tmdb-client.test.ts lib/auth-session-options.test.ts lib/sync/bootstrap-user-data.test.ts lib/sync/write-coordinator.test.ts lib/continue-watching.test.ts lib/db/recently-watched.test.ts app/api/tmdb/search/route.test.ts"
```

## What a proper error-reporting integration requires (F3)

Recording this here so it can be approved separately. Nothing below was added.

1. **A dependency decision.** `@sentry/nextjs` is the usual choice; a lighter option is a self-hosted GlitchTip or a small ingest endpoint. Adding any of them means a new dependency, which this brief forbids.
2. **Configuration and secrets.** A DSN or ingest URL as an environment variable, wiring in `next.config.js` (Sentry exposes a config wrapper or a build plugin), and client plus server initialization through `instrumentation.ts`.
3. **Server-side capture, not just the browser.** `app/error.tsx` is a client component, so its logging only runs in the browser. Durable server capture needs `onRequestError` from `instrumentation.ts` (Next reads it in `next/dist/server/base-server.js`), plus global `unhandledRejection` and `uncaughtException` handlers for non-request code.
4. **Source maps.** Symbolicated stacks require uploading sourcemaps during the production build, which means an auth token in CI or on Vercel and a build step that does not exist today.
5. **Privacy and abuse control.** Scrubbing rules for emails, tokens and URLs, a sampling rate, and either a public ingest endpoint protected by rate limiting or no user-triggered reporting at all.
6. **Retention and alerting beyond one hour.** `docs/operations/vercel-hobby-usage.md` states Hobby runtime logs keep only the most recent hour, so today a production error is invisible unless someone opens the browser console or the log window within the hour. A collector with retention, plus an alert channel, is the actual fix for "nothing tells the developer an error occurred".
7. **Cost approval.** A hosted vendor is a paid plan past its free tier; a self-hosted collector is extra infrastructure. Either way this is an owner decision.

## What I could not do, and why

- **Match the `engines` field in CI**: `package.json` has no `engines` field. Pinned Node 24 instead, see F1.
- **Run `npm ci` locally**: `node_modules` is a symlink to the main checkout and `npm ci` would delete it. Verified lockfile consistency and `prisma generate` without a database URL instead.
- **Edit `app/layout.tsx`**: owned by another worker. Both edits are specified exactly above.
- **Cover the F7 file list as written**: five of the seven named modules do not exist in this repository on any branch. Covered the behaviour that exists instead; listed above.
- **Add tests to `npm test`**: `package.json` is owned by another worker. The three files pass when run directly and are listed above for the script update.
- **Run a production build or any UI verification**: excluded by the brief. The manifest link and the robots metadata change are specified as exact edits rather than verified end-to-end.
- **Add an error-reporting service**: forbidden dependency; requirements recorded above.

## Learnings

- `package.json` has no `engines` field; CI must pin Node until someone adds one, then switch to `node-version-file: package.json`.
- `compiler.removeConsole` accepts `{ exclude: ['error', 'warn'] }`, and Next's own SWC binding confirms `exclude` keeps exactly those methods while `true` strips everything.
- Plain `npx node --test` cannot run tests in this repo because imports are extensionless; use `npx node --test --import tsx <file>` or `npx tsx --test <file>`.
- `app/error.tsx` is a client component, so anything it logs goes to the browser console; durable server capture requires `onRequestError` in `instrumentation.ts`.
- The F7 audit target list (`lib/validation/api-schemas.ts`, `lib/api/route-responses.ts`, `lib/rate-limit.ts`, `lib/sync/user-storage.ts`, `lib/sync/membership.ts`, `safeCallbackUrl`) does not exist in this repository, and there is no `zod` usage in the source despite the dependency.
- Prisma model delegates and `$transaction` are own properties on the client instance, so tests can stub and restore them without a database; importing `lib/db/prisma` does not open a connection.
- Commit `df35898` deliberately disabled indexing, so making the site indexable reverses a recent intentional decision and needs owner confirmation.
