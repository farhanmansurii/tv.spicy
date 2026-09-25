# Interface states and accessibility audit

Scope: reachable routes and components were traced from `app/` entry points. Static source audit only; no browser or assistive-technology run was performed. “No” in a state cell means no distinct state was found in the inspected implementation. Offline is not consistently distinguished from generic fetch errors. Loading more means incremental pagination/appending, not initial skeleton loading.

## State matrix

| Surface | Loading | Empty | Error+retry | Success | Verdict |
| --- | --- | --- | --- | --- | --- |
| Home (`app/page.tsx`; `HeroCarousel`, `DataRow`) | Yes: Suspense row skeletons; async page boundary | Row empty panel | Page and row retry | Yes | Partial: no offline state; hero silently disappears when no valid slides (`hero-carousel.tsx:62`); no incremental loading-more state for rows |
| Movie (`app/movie/page.tsx`) | Yes: row/Suspense loaders | Row empty panel | Page/row retry | Yes | Partial: no offline distinction; genre grid loader has no status announcement; no load-more state |
| TV (`app/tv/page.tsx`) | Yes: row/Suspense loaders | Row empty panel | Page/row retry | Yes | Partial: no offline distinction; genre grid loader has no status announcement; no load-more state |
| Browse (`app/browse/[slug]/page.tsx`) | Route loading file | No distinct empty result (zero is treated as error) | Page retry | Yes | Partial: no offline distinction; no load-more state |
| Search (`app/search/page.tsx`) | Initial skeleton | `EmptyResults` | No query error branch or retry | Yes | Missing request error/retry, offline, and live status announcements; pagination replaces pages rather than exposing loading-more |
| Movie detail (`app/movie/[movie]/page.tsx`, `DetailHero`) | Route skeletons | Not distinct for missing sections | Page error route/retry | Yes | Partial: section failures may become sparse/blank; no offline distinction; player buffering/error feedback unverified and no live announcement found |
| TV detail (`app/tv/[tv]/page.tsx`, `DetailHero`) | Route skeletons | Not distinct for missing sections | Page error route/retry | Yes | Partial: section failures may become sparse/blank; no offline distinction; no live announcement for player buffering/error |
| Library (`app/library/page.tsx`, watchlist components) | Auth spinner/component loading | Per-tab empty states in child components | No consistent retry state | Yes | Partial: no explicit offline/sync failure state at page level; async mutations surface some toast messages, not proven announced |
| Player (`components/features/media/player/media-player.tsx`) | Player library internals | No sources state in wrapper | No explicit wrapper retry/error | Yes | Missing explicit loading, buffering announcement, no-source/error retry, and offline state in reachable wrapper |
| Season/episode selection (`season-selector.tsx`, episode components) | Component/episode loaders | No distinct empty season/episode state confirmed | No explicit retry in selector | Yes | Partial: selector dialog keyboard handling is present; no offline/error state in selector |
| Sign-in (`app/auth/signin/page.tsx`) | Not confirmed in source sampling | N/A | Auth error route exists | Yes | Partial: inspect auth provider for pending/error semantics before redesign; offline state not found |
| Watchlist controls (detail hero, library lists) | Mutation-local loading in selected controls | Library empty states | Mutation toast with retry in `detail-hero.tsx` | Yes | Partial: offline and consistent announced success/failure states not established across controls |
| Favorites controls (library and detail surfaces) | Component-specific | Library empty state | No consistent retry state | Yes | Partial: no explicit offline state; mutation announcements inconsistent |
| History/recently watched controls (TV, library) | Suspense/component loaders | No-history view is component-specific | No consistent retry state | Yes | Partial: no explicit offline state or reliable live announcement |

## Interactive-control table

Focus/hover/active/disabled reflect explicit source styles and attributes, not visual browser testing. “N/A” means a disabled state is not applicable to that control as implemented.

| Control | file:line | focus | hover | active | disabled | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Search filter tabs | `app/search/page.tsx:49` | Missing explicit focus-visible style | Yes (inactive only) | Selected visual only | N/A | Native button, but selected tab semantics and keyboard tab pattern absent |
| Search clear button | `app/search/page.tsx:376` | No explicit focus-visible style | Yes | No explicit active | N/A | Keyboard focus indication is missing |
| Recent-search remove | `app/search/page.tsx:123` | No explicit focus-visible style | Yes; hidden until pointer hover | No explicit active | N/A | Hidden by opacity without focus-within reveal; keyboard user may not discover it |
| Search pagination | `app/search/page.tsx:208,225` | No explicit focus-visible style | Yes | No explicit active | Yes, native `disabled` | Focus indication missing |
| Library tabs | `app/library/page.tsx:45` | Yes | Yes (inactive) | Selected visual only | N/A | Tab semantics mostly connected; no `aria-orientation` needed, but Home/End and arrow key handling exists |
| Season tabs | `components/features/media/seasons/season-selector.tsx:125` | Yes | Yes (inactive) | Yes | N/A | `role=tab` has no `aria-controls`/tabpanel relationship or roving tabindex/arrow-key handling |
| Season sheet close | `components/features/media/seasons/season-selector.tsx:198` | Missing explicit focus-visible | No | Yes | N/A | Focus styling absent |
| Season sheet option | `components/features/media/seasons/season-selector.tsx:211` | Yes | Yes (inactive) | Yes | N/A | Selected option uses `aria-current`, not a defined listbox/menu selection pattern |
| Season sheet trigger | `components/features/media/seasons/season-selector.tsx:254` | Yes (continued below) | Yes (continued below) | Yes | N/A | Dialog focus trap/Escape/restore logic is present in source; runtime verification not done |
| Hero carousel pager dot | `components/features/media/carousel/hero-carousel.tsx:131` | Yes | Yes (inactive) | Selected state | N/A | Target is enlarged by pseudo-element; verify actual 44px hit area at narrow viewports in browser |
| Media card link | `components/features/media/card/media-card.tsx:41` | Yes | Yes | Yes | N/A | Good native link semantics; no disabled state needed |
| Data-row error retry | `components/features/media/row/data-row.tsx:76` | Yes | No explicit hover | Yes | N/A | Hover feedback absent |
| Header mobile menu | `components/layout/header/header.tsx:210` | Yes | Yes | Yes | N/A | `aria-expanded` matches `sidebarOpen`; source reports no `aria-controls` target reference |
| Player seek ±10 controls | `components/features/media/player/media-player.tsx:188` | No explicit focus style/label; controls created as raw buttons | No | No | No | Injected buttons are unnamed to screen readers and omit accessible labels/visible states |

## Findings

| Before | After | Why |
| --- | --- | --- |
| `app/search/page.tsx:299` — query destructures only `data` and `isFetching`; `showEmpty` renders after an unsuccessful query with no error branch. | Destructure `isError`/`error` and render an inline error with a retry action, plus a distinct offline message when connectivity is known. | Failed searches currently look like valid zero-result searches and provide no recovery path. |
| `app/search/page.tsx:421` — initial search loader is a visual `MediaLoader` with no `role="status"` or accessible loading text; results and empty-state changes are not live-announced. | Add a polite status region for searching/result count and an alert for request failure. | Screen-reader users receive no announcement when search results change or the search fails. |
| `app/search/page.tsx:49` — filter buttons do not expose tab semantics or `aria-pressed`/`aria-selected`, nor explicit arrow-key navigation. | Use a labeled group of toggle buttons with `aria-pressed`, or implement a complete tablist/tab/tabpanel pattern and keyboard behavior. | A sighted selected filter is not programmatically conveyed, and keyboard tab semantics are incomplete. |
| `app/search/page.tsx:123` — recent-search removal button is `opacity-0` except on `group-hover`, with no `group-focus-within` reveal. | Keep the remove action visible or reveal it when its card receives keyboard focus. | Keyboard users cannot reliably discover a pointer-hidden action. |
| `app/search/page.tsx:208` — pagination buttons have hover styles but no focus-visible ring. | Add a visible `focus-visible` outline/ring matching the other controls. | Keyboard focus can be difficult to locate on pagination controls. |
| `app/library/page.tsx:60` — tab buttons point at shared `id="library-tabpanel"`, but the panel has no per-tab `aria-controls` target and tabs have no matching per-tab panels. | Give each panel a stable id and connect each tab with `aria-controls`; preserve the active tab/panel relationship. | Assistive technology cannot reliably map each tab to its corresponding panel. |
| `app/library/page.tsx:169` — pending-auth return renders only an unlabeled visual spinner. | Expose a named `role="status"`/`aria-live="polite"` loading message. | Screen-reader users receive no indication that library content is still loading. |
| `components/features/media/seasons/season-selector.tsx:117` — inline season `tablist` tabs lack `aria-controls`, roving tabindex, and arrow-key handling. | Implement complete tabs and associated tabpanels, or use native buttons with `aria-pressed` if they switch content without tab-panel semantics. | The declared tab widget does not provide the expected relationships or keyboard interaction. |
| `components/features/media/player/media-player.tsx:188` — dynamically appended forward/backward buttons have no `aria-label`, focus styling, or disabled handling. | Set accessible names, keyboard-visible focus styles, and disabled state when seeking is unavailable. | Screen-reader users encounter unnamed controls and keyboard users cannot identify focused seek buttons. |
| `components/features/media/player/media-player.tsx:188` — player wrapper has no live region for buffering, playback failure, or unavailable sources. | Connect player state events to a concise polite status/error live region and expose a retry control on failure. | A screen-reader user cannot hear important playback state changes. |
| `components/features/media/carousel/hero-carousel.tsx:62` — no valid featured titles returns `null`. | Render an explicit unavailable/empty featured state or omit the hero container without leaving unexplained whitespace. | Failed or absent hero data silently removes a major home/movie/TV surface. |
| `components/features/media/details/detail-hero.tsx:475,488` — title rendering conditionally renders the visually hidden `h1` or visible `h1` in separate branches. | Ensure exactly one `h1` is rendered for each detail page in every artwork/logo branch. | Conditional title branches risk a missing or duplicated page heading; the source audit did not confirm branch exclusivity. |
| `components/features/media/row/data-row.tsx:98` — initial/fetching row state renders a skeleton without an accessible status. | Add a polite loading status associated with the row heading. | Screen-reader users receive no feedback while a row is loading. |
| `components/features/media/details/detail-hero.tsx:524` — watchlist success uses toast without a local persistent status relationship; other store controls vary. | Standardize mutation feedback through an announced polite success/error status and preserve retry on failure. | Save completion and failure are not consistently communicated to assistive technology. |
| `components/providers/sidebar-provider.tsx:17` — skip link targets `#main-content`; target is a focusable `<main id="main-content" tabIndex={-1}>` at line 25. | No source change required; verify target focus/scroll with keyboard in browser. | The source relationship is correct, but source inspection alone cannot prove browser focus movement. |
| `components/features/media/seasons/season-selector.tsx:35` — focus is moved into the sheet, Tab is trapped, Escape closes it, and cleanup restores trigger focus. | No source change required; verify the portal interaction in browser/screen reader. | The repaired focus-management path is structurally present; runtime behavior was not tested. |
| `components/layout/header/header.tsx:210` — mobile menu button has `aria-expanded={sidebarOpen}` and labels change with open state. | Add `aria-controls` referencing the actual sidebar/dialog element if the component exposes a stable id. | Expanded state is correctly exposed, but the controlled region is not identified programmatically. |
| `app/library/page.tsx:86` — `localStorage` is not read directly in this route; it gates store-derived UI on `useHasMounted()`. | No source change required for this route; continue checking imported stores for hydration-safe initialization. | The reported library render-path hydration fix is present at the route level. |
| `app/search/page.tsx:211` — `window` is used by effects after mount; search store values gate display with `useHasMounted()`. | No source change required for this route; continue checking the imported store initializer. | The reported search render-path hydration fix is present at the route level. |

## Priority

1. Name the injected player seek controls and expose buffering/error states; playback is otherwise inaccessible to screen-reader users.
2. Add search failure/retry handling and live announcements; currently a failed request can appear as a valid empty result.
3. Complete tab semantics and keyboard behavior for search filters and library/season tabs.
4. Fix keyboard visibility of search removal and pagination controls, then announce library loading and row loading states.
5. Verify skip-link movement, season-dialog focus trap/restore/Escape behavior, detail `h1` count, and carousel hit targets in a browser with keyboard and screen reader. Source inspection was used; no runtime, lint, test, or build checks were run.
