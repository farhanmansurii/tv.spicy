# Season and Episode Experience Design

## Goal

Redesign TV season and episode selection as one calm, touch-first surface that matches the shared mobile detail system. The common path—choose an episode and begin watching—must be immediate, while long-running shows remain easy to navigate.

## Responsive Model

- Phones retain both grid and list views so people can choose visual browsing or rapid scanning. The phone grid uses two compact columns; the phone list uses dense thumbnail rows designed for 20+ episode seasons.
- Tablets and desktops retain the same grid/list choice with roomier breakpoints.
- Shows with two to four seasons expose a horizontal segmented season rail.
- Shows with five or more seasons expose a compact current-season button that opens an anchored bottom sheet containing every season, its episode count, and the current-selection checkmark.
- A single-season show does not render a season picker.

## Season Picker

The picker remains stationary while episode content changes. Its label uses direct language: `Season 2` plus the episode count when known. The compact trigger has a minimum 48px target and communicates its expanded state.

The long-show sheet enters from and exits toward the bottom, includes a clear title and close control, respects the safe area, and supports backdrop dismissal and Escape. Choosing a season closes the sheet, updates the URL through the existing callback, and cross-fades the episode content without moving the surrounding page.

## Mobile Episode Card

Each phone list row is a compact full-width button with:

- a compact 16:9 thumbnail;
- episode number and title;
- runtime and air date when available;
- a single-line synopsis when space permits;
- playback progress when known;
- explicit `Now Playing`, completed, or upcoming treatment.

The active episode uses a restrained blue edge and `Now Playing` status. Completed episodes use a checkmark. Unreleased episodes remain disabled and show their release date instead of appearing broken. The entire card is the target; playback does not depend on a hover-only icon.

## Interaction and Motion

- Press feedback begins immediately with a subtle scale response.
- Episode and season commits use one light selection haptic.
- Selecting an episode preserves existing recent-watch and URL behavior, then smoothly scrolls to the player unless reduced motion is requested.
- Season changes keep previous content readable while fetching, then cross-fade to the new list.
- Springs are critically damped with no decorative overshoot.
- Reduced motion replaces movement with short opacity changes.
- Reduced transparency makes the sheet and floating controls near-solid and removes backdrop blur.

## Data and Architecture

Existing TMDB queries, URL parameters, episode hydration, recent-watch state, sticky-player state, and playback providers remain unchanged.

Focused components own presentation only:

- `SeasonSelector` chooses between the short rail and long-show sheet.
- `EpisodeStrip` chooses the phone list or existing tablet/desktop view.
- `EpisodeListRow` becomes the rich phone card while retaining a compact desktop-list variant.
- `SeasonTabs` coordinates state, loading, URL updates, and player scrolling.

No new API endpoints or persisted preferences are introduced.

## States and Accessibility

- Loading uses stable skeleton geometry and retains previous season content during background fetches.
- Errors stay inline with a retry path when the query can be retried.
- Empty seasons explain that no episodes are available and suggest another season.
- Interactive targets are at least 44px, with 48px preferred on phones.
- Picker and cards expose selected/current/expanded semantics, visible keyboard focus, meaningful image alternatives, and disabled semantics for unreleased episodes.
- Sheet focus remains usable by keyboard, Escape closes it, and background scrolling is prevented while open.

## Verification

- TypeScript and ESLint pass.
- Verify short, long, and single-season shows.
- Verify loading, empty, error, active, completed, and upcoming episode states.
- Verify phone portrait/landscape, tablet, desktop, keyboard navigation, reduced motion, and reduced transparency.
- Confirm season and episode URL parameters, sticky player behavior, recent-watch updates, and next-episode behavior remain intact.
