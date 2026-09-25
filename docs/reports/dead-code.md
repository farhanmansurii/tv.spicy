# Dead code and unused dependency purge - worktree `wt/dead-code`

Base commit: `69efea0`. All changes are left uncommitted for review.

Check command (run last, all steps pass):

```
npx tsc --noEmit && npm run lint && npm test
CHECK EXIT: 0
```

- `npx tsc --noEmit` -> exit 0, no output.
- `npm run lint` -> exit 0, no output.
- `npm test` -> **28 tests, 28 pass, 0 fail, 0 skipped** (`tests 28 / pass 28 / fail 0`).

The test run made live TMDB calls. Two of them came back `TMDB API Error (503)` and one `404`; the assertions still passed because they assert that the client surfaces those errors. A hard network outage (no connectivity at all, or a 5xx that changes an assertion's expectation) would flake this suite. That would be a network failure, not a regression from this change, and I would not have retried until green.

## Task 1: reachability purge

### Roots

1. Every file under `app/**` (Next.js App Router entry points: `page.tsx`, `layout.tsx`, `template.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `route.ts`, `globals.css`).
2. Config files loaded by tooling rather than imported: `next.config.js`, `proxy.ts`, `eslint.config.mjs`, `postcss.config.js`, `prisma.config.ts`, `tsconfig.json`.
3. Every `*.test.ts` matched by the `test` script (test files are roots by definition).
4. Path-like entries found in `package.json` `"scripts"` (none pointed at a repo file besides the test list; `postinstall: prisma generate` pulls in `prisma.config.ts` + `prisma/schema.prisma`).
5. `tailwind.config.ts` / `tailwind.config.js` were seeded as roots first, then demoted after Task 3 proved they are never read.

`prisma/**`, `public/**`, `docs/**`, `DESIGN.md`, `README.md`, `.env*` are non-code and were never deletion candidates.

### Method

A throwaway script (`reachability.mjs`, deleted before finishing) walked the repo and:

- Collected every `.ts/.tsx/.js/.jsx/.mjs/.cjs/.json` under `app`, `components`, `hooks`, `lib`, `store`, `types`, `scripts` plus the root config files.
- Parsed each file for `import ... from 'x'`, bare `import 'x'`, `export ... from 'x'`, `import('x')` and `require('x')`.
- Resolved `@/*` to the repo root and relative specifiers with TypeScript-ish resolution order (exact file, then `.<ext>`, then `./index.<ext>`). Ambiguous hits (both `X.ts` and `X/index.ts` present) were marked and **both** files kept.
- Ran a breadth-first walk from the roots. Anything not reached became a candidate.
- **Fail-closed rules:** unresolved specifiers and non-literal `import()`/`require()` arguments would have been reported for manual review; the final run reported **0 unresolved imports and 0 non-literal dynamic imports**, so nothing had to be kept on that ground.

Independent cross-checks before deleting anything: a raw grep for every candidate's basename/path across all surviving files, and a post-deletion re-run of the graph. After the purge the only unreachable file left in the repo is `scripts/check-providers.ts` (kept deliberately, see below), with 0 unresolved imports.

Known-dead candidates from the brief, checked against my graph:

| Candidate | Result |
| --- | --- |
| 41 of 56 `components/ui/*` including `command-palette.tsx` (1453 lines), `command.tsx`, `dialog.tsx`, `toaster.tsx` | confirmed: exactly 41 of 56 unreachable, all four named files included, 4850 lines |
| `components/features/media/media-player.tsx` (actual path `.../player/media-player.tsx`) and the whole `@oplayer` stack | confirmed: `media-player.tsx` unreachable, sole importer of `@oplayer/*`; deleted together with `types/oplayer-plugins.d.ts` |
| `navigation-sidebar.tsx`, `header-tabs.tsx` | confirmed, deleted |
| five of six `components/shared/loaders/*` | confirmed: `cast-crew-loader`, `more-details-loader`, `show-container-loader`, `show-details-loader`, `video-loader` unreachable; `media-loader.tsx` reachable (16 importers) and kept |
| `my-favorites.tsx`, `library-favorites.tsx` | confirmed; `library-favorites-synced.tsx` is the live one and is kept |
| `hooks/use-sync.ts`, `hooks/use-auth.ts`, `hooks/use-toast.ts` | confirmed, deleted |
| `store/searchStore.ts` | confirmed, deleted (re-exported only by the dead `store/index.ts` barrel) |
| `zod` | **kept** - see Task 2 |

## Task 2: dependency removal

After the file purge I re-scanned every surviving file (source, configs, CSS, `package.json` scripts) for each package name as an import specifier, a `require`, a config key and a CSS `@plugin`. 50 packages had zero references anywhere and were removed.

Removed (47 dependencies):

`@emotion/memoize`, `@hookform/resolvers`, `@imbios/next-pwa`, `@oplayer/core`, `@oplayer/hls`, `@oplayer/plugins`, `@oplayer/react`, `@oplayer/ui`, `@radix-ui/react-accordion`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-aspect-ratio`, `@radix-ui/react-checkbox`, `@radix-ui/react-collapsible`, `@radix-ui/react-context-menu`, `@radix-ui/react-hover-card`, `@radix-ui/react-icons`, `@radix-ui/react-label`, `@radix-ui/react-menubar`, `@radix-ui/react-navigation-menu`, `@radix-ui/react-popover`, `@radix-ui/react-progress`, `@radix-ui/react-radio-group`, `@radix-ui/react-scroll-area`, `@radix-ui/react-slider`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-toast`, `@radix-ui/react-toggle`, `@radix-ui/react-toggle-group`, `@studio-freight/react-lenis`, `@types/bcryptjs`, `@types/lodash`, `@vercel/postgres`, `axios`, `bcryptjs`, `cmdk`, `embla-carousel`, `embla-carousel-autoplay`, `idb`, `input-otp`, `lodash`, `react-day-picker`, `react-hook-form`, `react-intersection-observer-hook`, `react-resizable-panels`, `tailwind-variants`, `vaul`.

Removed (3 devDependencies): `autoprefixer`, `playwright`, `tw-animate-css`.

Notes on individual calls:

- Every item on the prior audit list was re-verified and removed except `zod`, which the brief says to keep.
- `axios` was **not** on the prior audit list. It became removable only after `lib/tmdb-fetch-helper.ts` was proven unreachable; no surviving file imports it.
- The 21 removed `@radix-ui/*` packages became orphaned by the deleted `components/ui/*` files. The 7 kept ones (`avatar`, `dialog`, `dropdown-menu`, `select`, `separator`, `slot`, `tooltip`) are each imported by a surviving file.
- `embla-carousel-react` stays (used by `components/ui/carousel.tsx` -> `hero-carousel.tsx`). It declares `embla-carousel` as a real dependency with its own nested copy in the lockfile, and nothing imports `embla-carousel` or `embla-carousel-autoplay` directly.
- `react-intersection-observer` stays (used); only the `-hook` variant was unused.
- `tailwindcss-animate` stays (`app/globals.css` line 3: `@plugin 'tailwindcss-animate'`). `tw-animate-css` was the duplicate nobody loads, so it went.
- `autoprefixer` is not referenced by `postcss.config.js` (only `@tailwindcss/postcss`) or anything else; Tailwind v4 prefixes through Lightning CSS. A package nothing loads cannot change behavior.
- `tailwind-merge` untouched, per brief.

### Lockfile

Command run (exactly once, removal only):

```
$ npm install --package-lock-only --no-audit --no-fund
Prisma schema loaded from prisma/schema.prisma.

✔ Generated Prisma Client (v7.2.0) to ./../../../../Documents/codebase/tv.spicy/node_modules/@prisma/client in 170ms
...
up to date in 3s
npm warn install-scripts 6 packages have install scripts not yet covered by allowScripts:
  @prisma/engines@7.2.0, @tailwindcss/oxide@4.1.6, esbuild@0.28.1, fsevents@2.3.3, prisma@7.2.0, sharp@0.34.5
```

I used `--package-lock-only` so the shared `node_modules` (a symlink to the main checkout, used by other workers) was not pruned. The root `postinstall` still ran `prisma generate` and rewrote the same Prisma client (v7.2.0) in that shared directory; nothing else in `node_modules` changed. No dependency was added and no version was upgraded.

Lockfile diff vs. the original, verified programmatically by comparing every `node_modules/...` entry in both files:

- `1825 insertions, 6627 deletions`.
- **0 packages changed version.** Every entry present in both locks has an identical `version`.
- 382 lock entries removed (the 50 direct removals plus their exclusive transitive tree).
- 178 entries touched only to flip `dev: true` (they are now reachable only through devDependencies). That is the whole content of those changes.
- The root `""` entry now matches `package.json` exactly (checked with a string comparison).
- The only entries **added**: 6 nested records under `node_modules/@tailwindcss/oxide-wasm32-wasi/node_modules/*` (`@emnapi/core`, `@emnapi/runtime`, `@emnapi/wasi-threads`, `@napi-rs/wasm-runtime`, `@tybys/wasm-util`, `tslib`). This is npm expanding the `bundleDependencies` of a package that was already in the lock - metadata, not a new dependency, and no version bump of anything. Reporting it as the one unrelated lockfile delta, as instructed; it is unavoidable when npm rewrites the tree.

## Task 3: dead config and the test script

### tailwind configs - deleted both, they were never loaded

- `app/globals.css` (the only stylesheet in the repo) starts with `@import 'tailwindcss';` and has **no `@config` directive**. Grep for `@config` across every CSS/JS/TS file: no hits.
- `postcss.config.js` registers only `@tailwindcss/postcss`. `next.config.js` has no `tailwindcss: { config: ... }` key. Nothing references either config file by path except `components.json` (see stale references below).
- Decisive experiment: I compiled `app/globals.css` through `postcss` + `@tailwindcss/postcss` with and without `tailwind.config.ts` present, and with `important: true` added to it. The output was byte-identical in `!important` count both times (32 occurrences, 27 of them written in `globals.css` itself); a loaded `important: true` would have stamped `!important` on every generated utility. So Tailwind does not load the file as configuration.

  The only difference the file's presence makes is 5 extra declarations in the theme layer: `--radius-hero`, `--radius-hero-md`, `--radius-small`, `--radius-medium`, `--radius-large`. Those are not config output - they appear because Tailwind scans the file as a *source* and picks up the literal `var(--radius-...)` strings inside it. Proof: rewriting the config's `hero` value from `var(--radius-hero)` to `9.5rem` removed `--radius-hero` from the compiled output instead of setting it to `9.5rem`. The values are identical to the ones `globals.css` declares itself in `:root` (lines 54-68) and `@theme inline` (lines 197-211), and unlayered `:root` declarations win over `@layer theme` anyway. Full-file diff of the compiled CSS with vs. without the config: those 5 duplicate lines, nothing else - no utility changed.
- `tailwind.config.js` is a 0-byte file, so it cannot contribute anything even if it were read.

Conclusion: both files are dead. Deleted, as instructed.

### Test script

```diff
- "test": "tsx --test components/features/media/episode/providers/providers.test.ts lib/api/tmdb-client.test.ts lib/auth-session-options.test.ts lib/sync/bootstrap-user-data.test.ts lib/sync/write-coordinator.test.ts",
+ "test": "tsx --test \"**/*.test.ts\"",
```

The quotes matter: `sh -c 'echo **/*.test.ts'` expands to only `lib/auth-session-options.test.ts` (no globstar in `sh`), so an unquoted glob would silently drop 4 of the 5 files. Quoted, the pattern reaches Node's test runner, which expands it itself.

Files the glob executes - proven with `tsx --test --test-reporter=junit "**/*.test.ts"` (file attribution comes from the `file=` attribute of each testcase):

| test file | test cases |
| --- | --- |
| `components/features/media/episode/providers/providers.test.ts` | 19 |
| `lib/api/tmdb-client.test.ts` | 2 |
| `lib/auth-session-options.test.ts` | 2 |
| `lib/sync/bootstrap-user-data.test.ts` | 2 |
| `lib/sync/write-coordinator.test.ts` | 3 |
| **total** | **28** |

That is every `*.test.ts` in the repo (`find . -name '*.test.ts' -not -path './node_modules/*'` returns exactly those 5) and `npm test` reports the same 28. The glob does not reach into `node_modules` (the symlink is not traversed). I also proved depth-independence with a temporary `glob-probe.test.ts` at the repo root: the glob picked it up as a 6th file, and I deleted the probe afterwards. Nothing was left behind that the glob misses.

## Files deleted (86)

By directory: `components` 61 files / 6460 lines (of which `components/ui` 41 files / 4850 lines), `hooks` 8 / 375, `lib` 11 / 906, `store` 2 / 29, `types` 2 / 16, plus `tailwind.config.ts` (59) and `tailwind.config.js` (0, empty).

```
components/features/media/genre/genre-page.tsx
components/features/media/list/movie-list.tsx
components/features/media/player/estimate-finish-time.tsx
components/features/media/player/media-player.tsx
components/features/media/player/play-button.tsx
components/features/watchlist/library-favorites.tsx
components/features/watchlist/my-favorites.tsx
components/layout/header/header-tabs.tsx
components/layout/sidebar/navigation-sidebar.tsx
components/shared/animated/fade-in.tsx
components/shared/animated/text-glitch.tsx
components/shared/bento-grid.tsx
components/shared/breadcrumbs.tsx
components/shared/loaders/cast-crew-loader.tsx
components/shared/loaders/more-details-loader.tsx
components/shared/loaders/show-container-loader.tsx
components/shared/loaders/show-details-loader.tsx
components/shared/loaders/video-loader.tsx
components/shared/motion-div.tsx
components/shared/segmented-control.tsx
components/ui/accordion.tsx
components/ui/alert-dialog.tsx
components/ui/alert.tsx
components/ui/aspect-ratio.tsx
components/ui/badge.tsx
components/ui/bento-grid.tsx
components/ui/blur-fade.tsx
components/ui/breadcrumb.tsx
components/ui/button-group.tsx
components/ui/calendar.tsx
components/ui/checkbox.tsx
components/ui/collapsible.tsx
components/ui/command-palette.tsx
components/ui/command.tsx
components/ui/context-menu.tsx
components/ui/dialog.tsx
components/ui/drawer.tsx
components/ui/form.tsx
components/ui/hover-card.tsx
components/ui/input-group.tsx
components/ui/input-otp.tsx
components/ui/item.tsx
components/ui/label.tsx
components/ui/menubar.tsx
components/ui/navigation-menu.tsx
components/ui/pagination.tsx
components/ui/popover.tsx
components/ui/progress.tsx
components/ui/radio-group.tsx
components/ui/resizable.tsx
components/ui/scroll-area.tsx
components/ui/slider.tsx
components/ui/spinner.tsx
components/ui/switch.tsx
components/ui/table.tsx
components/ui/tabs.tsx
components/ui/textarea.tsx
components/ui/toast.tsx
components/ui/toaster.tsx
components/ui/toggle-group.tsx
components/ui/toggle.tsx
hooks/index.ts
hooks/use-auth.ts
hooks/use-media-query.ts
hooks/use-mutation-observer.ts
hooks/use-reduced-motion.ts
hooks/use-session-store.ts
hooks/use-sync.ts
hooks/use-toast.ts
lib/config.json
lib/db/index.ts
lib/email.ts
lib/gsap-accessible.ts
lib/motion.ts
lib/readGenres.ts
lib/searchUtils.ts
lib/tmdb-fetch-helper.ts
lib/use-title.tsx
lib/use-tw-colors.tsx
lib/utils/scroll-context.ts
store/index.ts
store/searchStore.ts
tailwind.config.js
tailwind.config.ts
types/oplayer-plugins.d.ts
types/resend.d.ts
```

## Lines removed

- `git diff --numstat`: **7845 deleted lines across 86 files** (plus `-51` from `package.json`; `package-lock.json` is a separate mechanical change).
- Source tree (`app`, `components`, `hooks`, `lib`, `store`, `types`, `scripts`, `.ts/.tsx`): **27,645 lines / 266 files at HEAD -> 20,021 lines / 183 files**, i.e. 7,624 source lines and 83 source files gone.
- That is ~27.6% of source lines, against the earlier pass's hint of ~31% / 99 files. My own graph is the authority: it is more conservative because it keeps ambiguous resolutions, ambient `.d.ts` consumers-by-convention, and the two config/tooling files it could not classify as entry points.

## Files KEPT despite looking dead

- **`zod`** - zero imports exist anywhere in this worktree (`lib/validation/api-schemas.ts` does not exist here; another worker owns it). The brief says it is now used and must be kept, so it is kept. If that file never lands, `zod` becomes removable.
- **`scripts/check-providers.ts`** - unreachable from the app, and not wired into `package.json` `"scripts"`, so it fails a strict reading of the root rules. Kept because its header documents it as a human-invoked CLI (`node scripts/check-providers.ts [provider-id ...]`), i.e. it is an entry point of the same kind as `proxy.ts` rather than dead code. It imports `providers/registry.ts` and `providers/url-builders.ts`, both of which are reachable anyway, so keeping it forces nothing to be kept. If nobody runs it, wire it into `package.json` or delete it in a follow-up.
- **`prettier`** (devDependency) + `.prettierrc.json` - not referenced by any script or import, but a formatter invoked by hand does not appear in an import graph. Left alone.
- **`babel-plugin-react-compiler`** - not imported anywhere, but `next.config.js` sets `reactCompiler: true`, which makes Next load this plugin at build time. Keeping it is fail-closed: I am not allowed to run `npm run build`, so I cannot prove Next does not need it.
- **`lib/types.ts` and `lib/types/index.ts`** - both exist and 26 files import `@/lib/types`, which is ambiguous between them. Both kept rather than guessing which one TypeScript resolves to.
- **Tooling that never appears in an import graph but is referenced by config:** `@tailwindcss/postcss` (`postcss.config.js`), `tailwindcss` + `tailwindcss-animate` (`globals.css`), `eslint` + `eslint-config-next` (`eslint.config.mjs`), `tsx` (test script), `prisma` + `dotenv` (`prisma.config.ts`, `postinstall`), `typescript`, `@types/node`, `@types/react`, `@types/react-dom`.
- **Obviously live and untouched:** `@prisma/client`, `@prisma/adapter-pg`, `pg`, `better-auth`, `next`, `react`, `react-dom`, `zustand`, `@tanstack/*`, `framer-motion`, `gsap`, `lucide-react`, `@phosphor-icons/react`, `date-fns`, `sonner`, `clsx`, `class-variance-authority`, `tailwind-merge`, `web-haptics`, `geist`, `next-themes`, `embla-carousel-react`, `react-intersection-observer`.

## Things I could not prove dead, or left inconsistent on purpose

- `scripts/check-providers.ts`, `prettier`, `zod`, `babel-plugin-react-compiler` - reasoning above. No path forward without a human decision.
- **`components.json` line 7 still says `"config": "tailwind.config.js"`** for the shadcn CLI. I do not own `components.json`. The shadcn CLI only uses this when adding components; if you run `npx shadcn add`, either the pointer or the file needs revisiting.
- **`tsconfig.json` lines 30-31 still map `"@oplayer/plugins"` to `types/oplayer-plugins.d.ts`**, which I deleted. The mapping is inert now that no file imports `@oplayer/plugins` (`npx tsc --noEmit` passes); `tsconfig.json` is not mine to edit.
- **`DESIGN.md` lines 368 and 392** tell readers the typography scale and radius tokens are "mapped through `tailwind.config.ts`". The file is deleted and was never read anyway; the same values live in `app/globals.css` (`:root` lines 54-68, `@theme inline` lines 197-211). `DESIGN.md` is out of scope for this pass.
- **Docs may still name deleted components.** I checked `docs/**`, `README.md`, `PRODUCT.md` for the deleted paths and found no hits; only `DESIGN.md` (above) matched, on `tailwind.config.ts`.
- I did not run `npm run build` (forbidden), so runtime bundle contents are unverified. What is verified: TypeScript, ESLint, and the whole test suite, plus a graph re-run showing zero unresolved imports after the purge.

## Learnings:

- Resolve import specifiers file-before-directory: `@/lib/utils` resolves to `lib/utils.ts`, not the sibling `lib/utils/` directory, and a resolver that checks `existsSync` first silently marks `lib/utils.ts` (and the `details/index.ts` barrel) unreachable.
- `tsx --test "**/*.test.ts"` must be quoted: unquoted, `sh` without globstar expands it to one file and the run still exits 0 with fewer tests.
- Tailwind v4 never loads `tailwind.config.ts` without `@config`; it only *scans* it as a source, which is why its `var(--radius-...)` strings show up as theme variables while `important: true` in the same file has no effect.
- A package nothing loads cannot affect behavior, so removing `autoprefixer`/`tw-animate-css` is safe even without a build; conversely `babel-plugin-react-compiler` must stay because `next.config.js: reactCompiler: true` loads it invisibly.
- `npm install --package-lock-only` is the safe way to resync a lockfile when `node_modules` is a symlink shared with other checkouts: it never prunes the shared tree.
- Comparing every `node_modules/...` entry between two lockfiles separates real removals from `dev: true` flips; npm also expands a bundled dependency's `bundleDependencies` into nested lock records, which looks like an addition but changes no version.
