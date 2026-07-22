# Shared Mobile Detail System

## Objective

Redesign movie and TV detail pages into one coherent mobile system that feels cinematic while getting users to playback quickly. Desktop behavior and the existing playback/provider architecture remain unchanged.

## Design direction

Use a hybrid watch-first layout. Mobile keeps an immersive artwork-led hero, but shortens it enough to reveal the next actionable section. The title, essential metadata, and one primary action stay in the hero. Long-form synopsis and secondary information move below it.

## Mobile hero

- Height: 60dvh on phones, clamped between 480px and 620px; existing desktop sizing begins at the `md` breakpoint.
- Use poster artwork on narrow screens and backdrop artwork from tablet widths upward.
- Preserve a strong bottom gradient for legibility without stacking multiple translucent materials.
- Show only content type, year, rating, and up to two genres above the title.
- Keep the title or logo optically sized with tight display tracking and leading.
- Move the full overview below the hero; allow only an optional one-line tagline in the hero.
- Use one primary action:
  - Movie: `Play`
  - TV without an active episode: `Choose Episode`
  - TV with progress: `Continue S{season} E{episode}`
- Present Watchlist, Details, and Share as compact 44-point secondary controls.

## Content flow

### Movie

1. Compact cinematic hero
2. Synopsis and key facts
3. Player
4. Cast, videos, and related titles

### TV

1. Compact cinematic hero
2. Player when an episode is active
3. Season selector and episodes
4. Synopsis and key facts
5. Cast, videos, and related titles

The primary TV action scrolls to the episode selector when no episode is active and to the player when an active episode exists. Movie Play scrolls to the player.

## Mobile action dock

After the hero leaves the viewport, show a compact bottom dock containing the primary action and one watchlist action. It uses a single dark translucent material with a bright top edge. It must respect safe-area insets and must not cover player controls.

The dock enters and exits along the same vertical path. It remains interruptible and disappears while the player is sticky or fullscreen.

## Motion and interaction

- Respond on pointer-down with a subtle scale change.
- Use critically damped spring motion for the action dock and section transitions.
- Avoid staggered bounce animations for ordinary page entry.
- Remove the continuous mobile Ken Burns effect; artwork should feel stable while reading.
- Respect `prefers-reduced-motion`: replace movement with short opacity transitions.
- Respect `prefers-reduced-transparency`: use a nearly solid dock and secondary actions.
- Keep touch targets at least 44 by 44 CSS pixels.

## Component boundaries

- `DetailHero`: shared presentation and primary/secondary action callbacks.
- `MobileDetailActions`: bottom action dock and visibility behavior.
- `ShowContainer`: supplies player/episode anchors and media-specific ordering.
- Existing `Episode`, provider registry, progress adapters, and stores remain unchanged.

The hero must not directly know provider URLs or playback internals. It communicates through callbacks and section anchors.

## Accessibility

- Every icon-only action has an accessible label.
- Focus order follows visual order.
- Primary actions use explicit labels rather than generic icons.
- Programmatic scrolling preserves focus and uses instant scrolling when reduced motion is enabled.
- Text remains legible at larger system text sizes without overlapping artwork or actions.

## Error and empty states

- Missing artwork falls back to the existing dark gradient surface.
- Missing logo falls back to the media title.
- TV titles without seasons show Details as the primary action instead of a dead episode action.
- Player/provider failures continue to use the existing source selector and provider fallback flow.

## Verification

- Test movie and TV pages at 320, 375, 390, and 430 CSS-pixel widths.
- Test portrait and landscape orientation.
- Verify Play, Choose Episode, Continue, Watchlist, Details, and Share.
- Verify sticky player and bottom dock never overlap.
- Verify keyboard focus, reduced motion, and increased text size.
- Run TypeScript, ESLint, and the production build.

## Out of scope

- Desktop visual redesign.
- Provider or streaming-source changes.
- New watchlist persistence behavior.
- New episode recommendation logic.
