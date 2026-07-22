# Information Shelf Redesign

## Goal

Replace the current media-details accordion and episode-detail presentation with one context-aware Information Shelf. Movie and TV pages must share a predictable spacing contract, while the selected episode receives a compact, purpose-built primary view.

## Shared Surface

The shelf owns its vertical rhythm. It uses 16px internal spacing on phones, 24px on larger screens, and does not add unrelated outer margins. Its closed trigger is a 48–56px row labeled `About this movie`, `About this show`, or `Episode details`. Poster thumbnails and summary-chip clutter are removed.

The expanded surface uses one restrained material with a subtle edge and no nested glass layers. Opening and closing originate at the trigger and follow the same path. Height and opacity use a critically damped spring. The trigger remains interactive during motion and regains focus after keyboard-driven closing.

## Primary Content

Movie and show contexts open to `About`:

- tagline and synopsis;
- compact facts grid;
- primary production and creator information.

When a TV episode is active, the shelf opens to episode context:

- season and episode number, title, runtime, air date, and rating;
- synopsis;
- director and writers;
- a compact horizontal guest-cast rail.

The episode still image is removed because artwork already appears in the episode selector and player.

## Navigation

The primary tab is called `About`; there is no redundant `Episode` tab. In TV context, `About` renders selected-episode details when an episode is active and show details otherwise.

Available secondary tabs remain `Watch`, `Cast`, `Trailers`, and `Links`. Tabs use a compact segmented rail with 44px targets, a shared spring selection indicator, horizontal scrolling on narrow screens, and direct labels. Disabled empty tabs are omitted rather than displayed as unavailable controls.

## Responsive Behavior

- Phones use full-width content, compact facts, and horizontally scrolling cast or tab rails.
- Desktop uses the same hierarchy with wider fact grids and richer breathing room.
- The shelf content never introduces page-level top or bottom margins; `ShowContainer` remains responsible for section spacing.
- Long expanded content scrolls naturally with the page. No nested vertical scroll region is introduced.

## Motion and Accessibility

- Press feedback begins immediately with a subtle scale response.
- Expansion uses a critically damped spring with no decorative bounce.
- Tab changes use a short opacity transition and preserve the shelf position.
- Reduced Motion replaces spatial movement with opacity only.
- Reduced Transparency uses a near-solid surface without blur.
- The trigger exposes expanded state and controls the body.
- Tabs expose tab roles and selected state; content exposes a corresponding tab panel.
- Focus indicators remain visible and all controls meet a 44px minimum target.

## Data and Scope

Existing TMDB data, watch-provider URLs, trailer embeds, external links, active-episode store behavior, and page composition remain unchanged. The redesign changes presentation and local interaction only.

`MediaInfoPanel` owns the shelf, navigation, and context selection. `EpisodeDetailPanel` becomes a compact episode-information body without its own outer animation or artwork, so the parent shelf controls spacing and transitions consistently.

## Verification

- TypeScript, ESLint, and diff checks pass.
- Verify movie and TV pages in closed and expanded states.
- Verify TV with and without an active episode.
- Verify every available tab, empty data, long synopsis, long credits, and provider links.
- Verify phone, tablet, and desktop spacing.
- Verify keyboard, focus, reduced motion, reduced transparency, and high contrast.
