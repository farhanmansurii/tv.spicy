# UI Feedback Report - wt/ui-feedback

Fixes for findings F-UI-1 through F-UI-6. All changes are uncommitted for review.

## Checks actually run

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | Pass, no errors |
| `npm run lint` | Pass, no errors |
| `npm test` | 28/28 pass (live TMDB calls logged 404/503 responses; those tests assert on failure behavior and still passed) |

`npm run build` and UI/dev-server testing were not run, per the brief.

## What changed, per finding

### F-UI-1 - Hero reveal depended on an image event that can never fire
- New `components/features/media/hero-height.ts` exports `HERO_HEIGHT_CLASS`.
- `components/features/media/hero-banner.tsx`:
  - Added `hasImage`; `showRevealed = !hasImage || shouldAnimate`, so a hero with no
    image shows its copy on first render instead of staying at `opacity-0` forever.
  - Reveal transition narrowed from `transition-all duration-500 ease-out` to
    `transition-[opacity,transform] duration-[280ms] ease-[cubic-bezier(0.23,1,0.32,1)]`
    (enter ease-out, under the 300ms cap; the brief's mandated curve).
  - Backdrop `alt=""` (decorative).
  - Section height moved to the shared token.

### F-UI-2 - DataRow silently hid failures and empties
- `components/features/media/row/data-row.tsx`:
  - Removed the `showError` prop. No caller passed it, and non-owned call sites in
    `details/` and `genre/` used the component without it, so error/empty now always
    render.
  - New `RowStatePanel`: `role="alert"` + `aria-live="assertive"` for errors,
    `role="status"` + `aria-live="polite"` for empty, header preserved, `min-h-[280px]`
    so the reserved height matches a loaded row, Retry/Refresh wired to `refetch()`.
  - Added `hasRenderableData`: a row whose items are all filtered out by MediaRow
    (missing images) now shows the empty state instead of a blank gap.
  - Action buttons use the mandated focus ring and `active:scale-[0.97]`.

### F-UI-3 - Route skeleton did not reserve the hero's height (CLS)
- `app/loading.tsx` now sizes the skeleton with the same `HERO_HEIGHT_CLASS` the hero
  uses, wrapped in `-mt-16 lg:mt-0` to mirror the home hero's header offset. Comment
  states the real serving scope: `app/loading.tsx` only applies to `/`; `/movie` and
  `/tv` have their own `loading.tsx` that already uses `HeroSkeleton`.

### F-UI-4 - Player gave no loading/failure feedback
- `components/features/media/episode/episode.tsx`:
  - `status: 'loading' | 'ready' | 'failed'`, reset on every `currentUrl` change
    (provider switch, retry, resume), with `PLAYER_LOAD_TIMEOUT_MS = 15_000` driving
    the failure state.
  - Always-mounted overlay inside the player box: opacity in 160ms / out 120ms,
    `motion-reduce:transition-none`, so content swaps are instant and the box height
    never changes. Loading = spinner (`CircleNotchIcon`, `motion-reduce:animate-none`)
    + label; failure = `role="alert"` panel with Retry (remounts the iframe via
    `iframeKey`).
  - sr-only `role="status" aria-live="polite"` region announces loading/ready.
  - iframe `title={`${currentProvider.label} player`}`; no `sandbox` added.
  - `document.title` now set from the episode with save/restore of the previous title.

### F-UI-5 - Server fetch failures rendered as silently degraded 200 pages
- Evidence: `lib/api/tmdb-client.ts` `fetchRowData`/`fetchGenres` return `[]` on
  upstream failure and `fetchHeroItemsWithDetails` returns its input, so the existing
  page `try/catch` blocks were unreachable and empty payloads were rendered as content.
- New `components/shared/errors/page-fetch-error.tsx`: client panel with Retry that
  does a full `window.location.reload()` (re-runs the server render; `router.refresh()`
  could serve the same cached payload). `aria-busy` feedback while retrying. Note:
  `renderId={Date.now()}` was dropped because the repo's React Compiler lint
  (`react-hooks/purity`) rejects impure calls during render; the reload resets state.
- `app/page.tsx`: failure = any of `trendingTV`/`trendingMovies`/`tvPopular` empty.
  Unreachable `HomePageError` (with failing `text-zinc-500` contrast) replaced by
  `PageFetchError`.
- `app/movie/page.tsx`, `app/tv/page.tsx`: failure = empty top-rated row or empty
  genres.
- `app/browse/[slug]/page.tsx`: failure = `fetchThrew || shows.length === 0`, which
  subsumes the old separate empty branch; empty collections never occur for these
  curated endpoints.
- Each failure path calls `unstable_noStore()` from `next/cache` before rendering the
  error, so the degraded/error render is never stored by ISR (`revalidate` 86400 for
  movie/tv, 3600 for home/browse). Verified against Next 16 source: `unstable_noStore`
  marks the scope dynamic, which throws `DynamicServerError` on prerender and skips
  cache storage; `next.config.js` has no `cacheComponents`, so the legacy path applies.

### F-UI-6 - Deep-link params fed raw URL strings to parseInt
- New `components/features/media/player/deep-link-params.ts`: strict
  `^\d+$` + safe-integer + range parsing (`parseSeasonParam`, `parseEpisodeParam`,
  `MAX_SEASON_NUMBER = 500`, `MAX_EPISODE_NUMBER = 999`), with optional membership
  checks against the show's known seasons and the season's episode count.
- `components/features/media/seasons/season-tabs.tsx`: all three raw reads (season
  init, episode init, `handleNextEpisode` fallback) now validate; invalid or
  out-of-list values are ignored and the UI falls back to the first season / URL-less
  behavior instead of being passed on.
- `components/features/media/player/tv-container.tsx`: validates before rendering
  `Episode`; receives optional `seasons` and `episodeCount` from season-tabs so
  bounds are checked against real data. History-write timing is untouched.

## Brief discrepancies noted

- The brief's line refs and pixel values did not match this source (e.g.
  `app/loading.tsx:9` is `h-[76dvh]...`, not a 160px block; `app/browse/[slug]/page.tsx`
  already had try/catch plus an error UI). Semantics of each finding were fixed, not
  the literal line content.
- The brief's F-UI-6 corresponds to the audit's F-0-20 (deep-link params); the audit's
  own F-UI-6 is a GSAP issue, which is out of scope for this brief.
- Two brief claims were disproven and not acted on: the 769-1023px nav dead zone, and
  reduced-motion being globally disabled (`app/globals.css` only has `.liquid-glass`
  reduced-motion rules).

## Design rules applied

- Enter `cubic-bezier(0.23,1,0.32,1)`; all new UI transitions under 300ms (reveal
  280ms, overlay in 160ms / out 120ms, press 150ms); no `scale(0)` starts; no
  `transition: all` (only `transition-[opacity,transform]` / `transition-transform`);
  `transform: scale(0.97)` on `:active` for pressables; no animation on
  keyboard-initiated retry (instant content swap); CSS transitions, not keyframes, for
  retriggerable states; `motion-reduce:*` on every new animated element (existing
  reduced-motion handling in globals.css left untouched).
- Focus rings exactly `focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60
  focus-visible:ring-offset-2 focus-visible:ring-offset-black`.
- No text below `text-white/70` in new UI; loading/error/empty heights reserved;
  `role="status"` + `aria-live="polite"` for progress, assertive for errors;
  decorative backdrop `alt=""`.
- The 12s Ken Burns transform on the hero backdrop was intentionally left alone: it is
  an ambient decorative effect, not UI feedback.

## Limitations

- The player iframe is cross-origin, so its content cannot be inspected. "Failure" is
  timeout-driven (15s) plus the browser's load event; a provider that loads a broken
  page without erroring will still be reported as ready.
- `npm run build` was not run (excluded by the brief's rules), so first-load/prerender
  behavior of the `unstable_noStore` paths is reasoned from Next 16 source, not
  observed in a build.
- Empty-success and upstream-failure are indistinguishable in `fetchRowData`, so a
  curated endpoint that legitimately returned zero items would show the error state
  with Retry. These endpoints are curated and never empty in practice.
- Retry may be served a cached empty payload until the data-integrity work (F-0-4,
  `lib/` + `app/api/` owners) lands; this change only guarantees the render itself is
  never cached.
- Cross-worktree files (`lib/`, `components/ui/`, `components/card/`, etc.) were not
  touched; findings owned by other worktrees are untouched here.

## Files touched

Modified: `app/page.tsx`, `app/movie/page.tsx`, `app/tv/page.tsx`,
`app/browse/[slug]/page.tsx`, `app/loading.tsx`,
`components/features/media/hero-banner.tsx`,
`components/features/media/row/data-row.tsx`,
`components/features/media/episode/episode.tsx`,
`components/features/media/player/tv-container.tsx`,
`components/features/media/seasons/season-tabs.tsx`.

New: `components/features/media/hero-height.ts`,
`components/features/media/player/deep-link-params.ts`,
`components/shared/errors/page-fetch-error.tsx`.

Nothing was committed, staged, or stashed.
