# a11y-motion worktree - accessibility, contrast and motion report

Scope: findings F-UI-7 through F-UI-17. All changes are uncommitted on top of `69efea0` in the
`a11y-motion` worktree. Nothing was staged, committed or pushed. No dependencies were installed.

Finding line numbers had drifted against this revision (same commit, clean tree). Where a cited
line did not match, the defect was located by content and the discrepancy is recorded below.

---

## Findings and what changed

### F-UI-7 - Skip link and main landmark
`components/providers/sidebar-provider.tsx`
- Skip link inserted as the first focusable element inside `UISidebarProvider`, before `AppSidebar`:
  `fixed left-[-9999px] top-4 z-[100] bg-white px-4 py-2.5 text-sm font-semibold text-black`,
  revealed with `focus:left-4`.
- Target is the existing `<main>`, now `id="main-content" tabIndex={-1}` plus `outline-none`.
- White-on-`#0A84FF` measures 3.65:1, so the pill is white-on-black text rather than blue fill;
  the focus ring uses the exact token
  `focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black`.
- No layout shift: the link is `position: fixed`, so revealing it cannot reflow content
  (`not-sr-only` would have reflowed the header).

### F-UI-8 - Reduced motion
- `app/layout.tsx` wraps the tree in the new `components/providers/motion-provider.tsx`, which
  renders `<MotionConfig reducedMotion="user">` (framer-motion 11.18.2, previously unused).
- `app/globals.css`: the single `@media (prefers-reduced-motion: reduce)` block (line 587) now also
  sets `.grain-overlay::before { animation: none }` so the grain freezes on a static frame instead
  of animating at `steps(10)` forever.
- All four GSAP sections (`video-section`, `storyline-section`, `cast-crew-section`,
  `more-details-container`) were moved from `gsap.context()` to `gsap.matchMedia()` with paired
  `reduce: '(prefers-reduced-motion: reduce)'` / `motion: '(... no-preference)'` branches.
  The reduce branch keeps an opacity-only reveal at `0.2s`, drops every `y`/`scale` offset and
  collapses stagger to `0`; cleanup is `mm.revert()`.
- Non-scroll animations (video modal open/close, newly revealed cards, story expand helper,
  detail tab switch) check `matchMedia('(prefers-reduced-motion: reduce)')` directly and fall back
  to opacity-only or an instant state change.

### F-UI-9 - Season dialog focus management
`components/features/media/seasons/season-selector.tsx`
- The sheet now moves focus to its container on open (`tabIndex={-1}`, `focus:outline-none`),
  traps `Tab`/`Shift+Tab` inside the dialog with a capture-phase keydown listener, and restores
  focus to the trigger button on any close path. The ref is copied into the effect body so the
  cleanup does not read `triggerRef.current` (react-hooks/exhaustive-deps).
- Escape handling and `aria-modal`/`aria-labelledby` already existed and were kept.
- Focus correctness was prioritised over motion: focus lands immediately on mount, before the
  0.38s sheet transition finishes, and the transition does not gate focus.

### F-UI-10 - Library tabs
`app/library/page.tsx`
- Container is now a real `role="tablist"` with `aria-label` and an `onKeyDown` handler for
  `ArrowLeft`/`ArrowRight`/`Home`/`End` (wrapping, with `preventDefault()`), moving both selection
  and focus.
- Each tab gets `type="button"`, `id="library-tab-<value>"`, `aria-controls="library-tabpanel"`,
  roving `tabIndex={active ? 0 : -1}` and keeps `role="tab"` + `aria-selected`.
- The panel is `role="tabpanel" id="library-tabpanel" aria-labelledby="library-tab-<active>"`.
- Icon-only tabs below `sm` keep their name: `<span className="sr-only sm:not-sr-only">` replaces
  `hidden sm:inline`, so the accessible name is "Continue"/"Watchlist"/"Favorites" at every
  breakpoint (the count badge is still announced after the label).

### F-UI-11 - Contrast
See the measured table below. Files swept: `media-info-panel.tsx`, `media-card.tsx`,
`episode-strip.tsx`, `episode-list-row.tsx`, `episode-card.tsx`, plus `season-selector.tsx`
(one remaining line), `app/library/page.tsx` and `app/search/page.tsx` (both owned).
Rules used: text >= 4.5:1, non-text/UI >= 3:1, body and metadata strings land at `white/55`
(6.26:1) or better, icons at `white/50` (5.19:1).

### F-UI-12 - Hero pager hit area
`components/features/media/carousel/hero-carousel.tsx`
- Each dot keeps its exact visible box (`h-1.5 md:h-2`, active `w-5 md:w-6`) and gains a
  pseudo-element target: `after:absolute after:left-1/2 after:top-[-26px] after:bottom-[-12px]
  after:w-6 after:-translate-x-1/2` - a 24px wide by 44px tall hit area centred on the dot.
- The row gap went from `gap-1.5 md:gap-2` to `gap-5` so the pitch is 26px (mobile) / 28px (md),
  i.e. targets touch but never overlap. A 44px target on both axes would need a 44px pitch and an
  ~180px row for five dots, so height is 44px and width is the full pitch.
- The downward overhang is capped at 12px so the target never spills past the hero edge.

### F-UI-13 - Hydration
- `app/library/page.tsx`: counts, `isSignedIn`, the personalised greeting and the auto-switch
  effect are gated behind `useHasMounted()` (server and first client render both see the
  pre-mount values, then post-mount effects paint the persisted data).
- `app/search/page.tsx`: `hasRecents = isMounted && recentlySearched.length > 0` gates the
  recents/trending swap, so SSR and the first client render agree.
- The `isPending` spinner in the library page was left unchanged deliberately: server and client
  both render it from the same initial store state, so there is no mismatch, and gating it would
  flash content -> spinner -> content.
- The three library sub-components already gate themselves with `useHasMounted`, so the panel
  content needed no extra gate.

### F-UI-14 - Header toggle state
`components/layout/header/header.tsx`
- `const sidebarOpen = isMobile ? openMobile : open` from `useSidebar()` now drives `aria-label`
  ("Close menu"/"Open menu"), `aria-expanded` and the hamburger/close icon swap, so state matches
  whichever mechanism actually opened the sidebar (Sheet below 768px, floating panel 769-1023px).

### F-UI-15 - Breakpoint source of truth
`store/mediaQueryStore.ts`
- One shared `const MOBILE_QUERY = '(max-width: 767.98px)'` used by both `matchMedia` calls
  (previously the same query was created twice as `'(max-width: 768px)'`). It is now the exact
  complement of Tailwind `md` (`width >= 768px`), so JS and CSS flip at the same pixel - the old
  query disagreed at exactly 768px.
- A comment records the invariant: change both together.
- Left alone on purpose: the header stays at `lg` (1024px) and the vendor `components/ui/sidebar.tsx`
  is untouched. Moving the store to 1024px would turn the 769-1023px floating panel into a Sheet,
  a behaviour change that cannot be verified without a browser.

### F-UI-16 - Small a11y fixes
- `header.tsx`: logo `<img alt="Spicy TV">` -> `alt=""` (the link already has
  `aria-label="Go to home page"` and visible "Spicy TV" text; the alt was a duplicate string).
- `video-section.tsx`: the shared cached `alt="Backdrop"` on every non-video backdrop -> `alt=""`;
  the visible caption `<p>{item.name}</p>` names each item, so a repeated literal was pure noise.
  (The finding placed this at `media-info-panel:90`; media-info-panel's alts are already per-item.)
- `media-info-panel.tsx`: the shelf `<section>` now carries `aria-label={triggerLabel}` so it is an
  accessible region, and the panel tabs gained roving `tabIndex` alongside their existing
  `aria-selected`/`aria-controls`/`aria-labelledby`.
- `app/search/page.tsx`: icon-only buttons gained labels - search input
  (`aria-label="Search movies and TV shows"`), "Clear search", "Previous page"/"Next page", and the
  recent-search remove button (`Remove <title> from recent searches`).

### F-UI-17 - DESIGN.md drift
- The reduced-motion paragraph (old `:438`, citing `globals.css` lines 345-366, a global
  `animation-duration` rule, and a "disables liquid-glass blur" claim that was never true) now
  describes the three real layers: the `.liquid-glass-surface`-scoped CSS block at line 587 with
  the grain freeze, `<MotionConfig reducedMotion="user">` in `app/layout.tsx`, and the
  `gsap.matchMedia()` reduce branches in the detail sections.
- Slug map rule: `categoryMap` claims corrected in three places (`:110`, `:126`, `:521`) - the
  inline map no longer exists (verified: no `categoryMap` in `app/` or `lib/`), the module is
  `lib/browse-categories.ts` exporting `BROWSE_CATEGORIES` + `getBrowseCategory()`, and
  `app/browse/[slug]/page.tsx` resolves the slug and calls `notFound()`.
- The supported-slugs list (`:114-121`) and table (`:537-546`) now list all nine slugs, including
  `airing-this-week` (line 31) and `cult-classics-fan-favorites` (line 59), which the doc claimed
  were missing from the map. The "Missing slugs" table and its Action were replaced with a note
  that both now exist. The recommended refactor item at `:310` was updated to record the current
  location.
- Also fixed while there: the category shape is `{ slug, endpoint, title, type, description }`
  (the doc said it included `label`).

---

## F-UI-11 - measured contrast (dark theme, background `#000000`)

Reference ratios (white on black unless noted): `/15` ~1.4, `/20` 1.66, `/25` 2.02, `/30` 2.47,
`/35` ~3.0, `/38` 3.38, `/40` 3.66, `/42` 3.95, `/45` 4.42, `/50` 5.19, `/55` 6.26, `/60` 7.37,
`/70` 9.96. Black on white: `/50` 3.98, `/60` 5.74. `text-muted-foreground` (`#8e8e93`) 6.44;
its `/60` 2.83, `/70` ~3.5.

| Location | Before | After |
|---|---|---|
| media-info-panel section labels + kickers (`:134`, `:141`) | `white/25` = 2.02 | `white/55` = 6.26 |
| media-info-panel header subtitle (`:433`) | `white/38` = 3.38 | `white/55` = 6.26 |
| media-info-panel inactive tab label | `white/45` = 4.42 fail | `white/55` = 6.26 |
| media-info-panel count on active (white) tab | `black/45` ~3.4 fail | `black/60` = 5.74 |
| media-info-panel count on inactive tab (`:499`) | `white/25` = 2.02 | `white/55` = 6.26 |
| media-info-panel tagline | `white/40` = 3.66 | `white/55` = 6.26 |
| media-info-panel "No overview available" (`:556`) | `white/30` = 2.47 | `white/55` = 6.26 |
| media-info-panel provider note (`:610`) | `white/35` ~3.0 | `white/55` = 6.26 |
| media-info-panel fact-grid icon (`:574`) | `white/25` = 2.02 | `white/50` = 5.19 |
| media-info-panel cast initials (`:690`) | `white/20` = 1.66 | `white/55` = 6.26 |
| media-info-panel cast role (`:703`) | `white/30` = 2.47 | `white/55` = 6.26 |
| media-info-panel link detail (`:802`) + trailing icon | `white/25` = 2.02 | `white/55` = 6.26 / icon `white/50` = 5.19 |
| media-info-panel provider link icon (`:227`) | `white/30` = 2.47 | `white/50` = 5.19 |
| media-card year (`:93`) | `white/38` = 3.38 | `white/55` = 6.26 |
| episode-strip empty-state icon (`:149`) | `white/25` = 2.02 | `white/50` = 5.19 |
| episode-strip "No episodes available" (`:154`) | `white/40` = 3.66 | `white/70` = 9.96 |
| episode-strip "Try selecting..." (`:155`) | `white/20` = 1.66 | `white/55` = 6.26 |
| episode-list-row episode number (`:98`) | `white/25` = 2.02 | `white/55` = 6.26 |
| episode-list-row lock icon (`:179`) | `white/30` = 2.47 | `white/50` = 5.19 |
| episode-list-row runtime (`:226`) | `white/30` = 2.47 | `white/55` = 6.26 |
| episode-list-row air date (`:240`) | `white/20` = 1.66 | `white/55` = 6.26 |
| episode-list-row "Upcoming" (`:245`) | `white/15` ~1.4 | `white/55` = 6.26 |
| episode-list-row overview (`:252`) | `white/35` ~3.0 | `white/55` = 6.26 |
| episode-card lock icon (`:148`) | `white/25` = 2.02 | `white/50` = 5.19 |
| episode-card episode number (`:178`) | `white/35` ~3.0 | `white/55` = 6.26 |
| episode-card runtime (`:186`) | `white/30` = 2.47 | `white/55` = 6.26 |
| episode-card separators (`:185`, `:193`) | `white/15` ~1.4 | `white/50` = 5.19 + `aria-hidden="true"` |
| season-selector "N episodes" (`:234`) | `black/50` = 3.98 / `white/35` ~3.0 | `black/60` = 5.74 / `white/55` = 6.26 |
| library tab inactive + count badge + eyebrow + sync note | `muted-foreground/60` = 2.83, `/70` ~3.5 | `muted-foreground` = 6.44 |
| search page (tabs, "Clear all", "No image", remove button, magnifiers, helper text, page count, placeholder, kbd, results line, pagination icons) | `white/15`-`white/50` = 1.4-5.19 | `white/70` = 9.96 minimum (`white/90` for the count/query spans) |

Kept as-is: decorative hairline borders/dividers at the DESIGN.md hairline tokens (the 3:1 rule is
for component-identifying UI, not decoration), disabled controls under `disabled:opacity-30`
(exempt), and text that already cleared 4.5:1 (`white/60`, `white/70`, `text-zinc-200`,
`text-white/80`, the `#FFD60A` ratings).

Text over poster art: every overlay in the owned files already sits on a scrim - the "E1/PLAYING/
Watched" chips use `bg-black/70`, the lock overlays use `bg-black/60` (`episode-list-row`) and
`bg-black/55` (`episode-card`), and the artwork carries `bg-gradient-to-t from-black/60`. No
unscrimmed text over images was found, so no scrims were added.

---

## Claims that did not reproduce

| Claim | Evidence |
|---|---|
| `app/library/page.tsx:117` render-time `Math.random()` shimmer key | The file contains no `Math.random`, no `key={...}` with random, and no shimmer. `git log -S 'Math.random'` on this path returns no commits - it never existed. |
| `app/library/page.tsx:93-102` / `:192-208` render-time `localStorage` reads | The file contains no `localStorage`. Store reads go through zustand `persist`, which is the real (and now gated) hydration risk. |
| `media-info-panel.tsx:40` `role="status"` / broken `aria-live` region | `git log -S 'role="status"'` and `-S 'aria-live'` on this file return no commits. The only `role="status"` in the app is `components/ui/spinner.tsx:8`, which I do not own. What was fixed instead: the shelf is now a labelled region, and the panel tabs carry roving `tabIndex`. |
| `media-info-panel.tsx:90` shared cached backdrop alt | Line 90 is inside a variant definition. The shared `alt="Backdrop"` lives in `video-section.tsx` and is fixed there. |
| media-info-panel missing `aria-selected` | Already present at `:484` (plus `aria-controls`, panel `aria-labelledby`). |
| Accurate-but-redundant alt on media-card/img and "black text on light posters" in episode-card/media-card | `alt={title}` is accurate; the worst-case poster text computes at >= 16:1 (white on a `bg-white/90` play button is black-on-white). No change needed. |
| 769-1023px navigation dead zone | Not chased - previously disproved (the floating panel opens from the same hamburger via `open`). |

## Deliberate non-changes

- Non-owned files were not touched: `package.json`, `next.config.js`, `proxy.ts`, `lib/**`,
  `store/**` (except `mediaQueryStore.ts`), `app/api/**`, `app/page.tsx`, the browse/movie/tv
  routes, watchlist/auth components, `components/ui/sidebar.tsx` (F-UI-15 did not need it).
- Pre-existing `transition-all` / long-duration transitions on lines I did not otherwise need to
  change (e.g. the storyline synopsis clamp, share button) were left alone; they are outside the
  seventeen findings.
- The video modal in `video-section.tsx` has no focus move, Tab trap or Escape-to-close. That is a
  real gap but not one of F-UI-7..17, so it is reported rather than changed.
- Scroll-entrance durations documented in DESIGN.md (0.7s/0.8s content reveals) were left at their
  canonical values; only animations I actually touched were retimed. Retiming them all under 300ms
  would contradict the DESIGN.md duration table.
- DESIGN.md still contains other stale line-number citations (it cites line numbers throughout);
  only the two regions named in F-UI-17 were rewritten, and they now cite current paths/lines.

## Design rules applied where

Reduced motion = fewer and gentler with opacity/colour kept and transforms removed (globals.css
`:587`, `MotionConfig reducedMotion="user"`, `gsap.matchMedia()` reduce branches); ease-out entry
(`power3.out`, `--ease-out` easing); UI motion under 300ms with exit faster than enter (video modal
0.28s in / 0.18s out, detail tab switch 0.20s out / 0.24s in, story expand 0.28s); never animate
from `scale(0)` (modal now starts at `scale(0.95)` + `opacity: 0`); no `transition: all`
(introduced `transition-[width,background-color]` on the pager and left existing `transition-all`
lines untouched); pressables keep `active:scale-[0.97]`; keyboard-initiated actions get focus
correctness instead of motion (library tab arrow keys move focus with no animation, the season
dialog focuses before its transition ends); focus ring exactly
`focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black`
(skip link, library tabs, pager); 4.5:1 text and 3:1 non-text (F-UI-11 table); fast spinner with no
content delay (library spinner unchanged); hover: no hover states were added or removed, and the
existing `(hover:hover)`-ungated hover classes were not retrofitted (outside the findings).

## Checks

Run from the worktree, on the final tree, uncommitted:

```
npx tsc --noEmit && npm run lint && npm test
```

- `npx tsc --noEmit` - passed, no output.
- `npm run lint` - passed, 0 errors, 0 warnings. (An earlier run flagged
  `react-hooks/exhaustive-deps` on the season-dialog cleanup; the ref is now captured inside the
  effect and the warning is gone.)
- `npm test` - passed: 28 tests, 0 failures.
- Network note: the test suite makes live TMDB calls. The first run logged a TMDB `503 Internal
  error` (and an expected `404` for `/movie/missing`) inside `lib/api/tmdb-client.test.ts`; the
  tests handle those responses and still passed (28/28). The final chained run was clean. No
  network failure blocked the checks, and no test was retried to force a green result.

Not run (by instruction): full production build, dev-server click-through, screenshots.
