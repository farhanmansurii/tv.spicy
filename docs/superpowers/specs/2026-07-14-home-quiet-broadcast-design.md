# Home Page: Quiet Broadcast Design

## Goal

Make the home page faster to scan and easier to act on while preserving Spicy TV's dark, cinematic identity. The page should help returning users resume quickly and help everyone else choose a title without scrolling through repetitive shelves.

## Approved Direction

Use a hybrid of Quiet Broadcast and Program Guide:

- A shorter, calmer cinematic hero.
- A real five-title selector instead of anonymous progress dots.
- Continue Watching immediately after the hero when available.
- Poster-first discovery shelves with stronger comparison on mobile.
- Minimal glass, restrained motion, and clear controls.

The media artwork supplies the visual drama. Navigation, labels, and controls remain quiet and functional.

## Information Hierarchy

The home page order is:

1. Compact header over the hero.
2. Hero with one active title and primary action.
3. Five-title hero selector.
4. Continue Watching, only when data exists.
5. A primary discovery rail: `Popular Tonight`.
6. Watchlist and favorites when signed in and non-empty.
7. Ranked and editorial movie/TV rails.

Empty personalized sections do not reserve skeleton space indefinitely. Anonymous or new users move directly from the hero to discovery.

## Hero

### Layout

- Height: approximately `62dvh` on mobile and `72dvh` on desktop.
- Keep backdrop-led presentation on desktop and poster-aware cropping on mobile.
- Content is anchored near the lower-left safe area with a readable gradient behind text.
- Limit content to title/logo, two useful metadata facts, a short synopsis, and actions.

### Actions

- Primary: `Watch now` when a playable path is known; otherwise `View details`.
- Secondary: watchlist toggle.
- Both actions use familiar button shapes, visible focus states, and at least 44px touch targets.

### Selector

- Replace progress dots with five compact selectable title items.
- Each item shows a thumbnail, title, and year where space permits.
- Desktop uses a horizontal strip beneath the hero content.
- Mobile uses a horizontally scrollable strip with a visible next-item peek.
- The active title is indicated by structure and text, not color alone.

### Autoplay and Motion

- Autoplay remains optional and pauses on interaction or hover.
- Add a visible pause/resume control.
- `prefers-reduced-motion` disables autoplay, Ken Burns scaling, and decorative transitions.
- Selecting a title updates the hero with a short opacity transition; content is never hidden pending animation.

## Content Shelves

- Default discovery shelves use portrait posters.
- Landscape cards are reserved for Continue Watching and editorial rows where backdrop imagery carries meaning.
- Mobile poster cards occupy roughly 46% of the content width, allowing two-title comparison and a partial next-card peek.
- Section titles use sentence case at a readable size.
- A visible `See all` action replaces hover-only affordances where a collection route exists.
- Carousel arrows remain keyboard-visible on desktop and do not depend solely on hover.

Distinct shelf treatments:

- Continue Watching: landscape card, progress bar, episode/title context.
- Popular Tonight: calm poster rail.
- Blockbuster Hits: ranked poster rail.
- Watchlist/Favorites: standard poster rail with saved-state affordance.

## Header

- Preserve the Spicy TV wordmark on mobile.
- Show search and menu as clear 44px controls.
- Reduce the floating glass-cluster appearance.
- Over the hero, the header may be transparent with a controlled backdrop gradient.
- After scrolling, it becomes a solid near-black surface for legibility.
- Search remains the most prominent utility action.

## Responsive Behavior

- Mobile prioritizes hero actions, title selector, Continue Watching, and two-poster comparison.
- Tablet keeps the selector visible while reducing metadata density.
- Desktop constrains hero copy width and gives the selector enough space to show all five titles.
- No content or controls depend on hover.

## Accessibility

- Hero carousel has a meaningful region label and announces the selected title.
- Selector buttons expose title names rather than slide numbers.
- Keyboard order follows hero actions, playback control, selector, then content shelves.
- Text and controls meet WCAG AA contrast against variable imagery.
- Saved, active, progress, loading, and error states use text or icons in addition to color.
- Reduced-motion behavior is mandatory.

## Performance Constraints

- Continue using native `<img>` and direct TMDB CDN URLs; do not use `next/image`.
- Use responsive TMDB `srcset`, `sizes`, lazy loading, and async decoding.
- Only the active hero image receives eager loading/high fetch priority.
- Adjacent hero imagery may preload lazily; inactive distant slides do not mount full hero effects.
- Do not add a new animation library.
- Prefer CSS transitions; retain Embla only for carousel state and interaction.
- Avoid adding client boundaries around the whole home page.

## Components and Ownership

- `HeroCarousel`: active title state, autoplay, pause control, selector semantics.
- `HeroBanner`: compact visual treatment, actions, responsive image behavior.
- `MediaRow`: poster-first sizing, headings, See All, visible controls.
- `MediaCard`: existing lightweight CSS interactions and native responsive imagery.
- `HomePersonalizedRows`: conditionally place Continue Watching and saved content without empty layout gaps.
- `app/page.tsx`: final information hierarchy and editorial row ordering.
- Header components: mobile wordmark and scroll-state treatment.

Shared components keep their current contracts unless a small explicit prop is required. Movie, TV, detail, library, and search routes must not be visually changed unintentionally.

## Error and Empty States

- Hero failure falls back to the first available discovery rail rather than a blank cinematic area.
- A failed personalized request does not block public discovery content.
- Empty Continue Watching, favorites, or watchlist sections collapse completely.
- Carousel controls disappear when fewer than two valid hero titles exist.

## Verification

- Test mobile widths at 375px and 430px.
- Test tablet at 768px and desktop at 1280px and 1440px.
- Verify keyboard navigation and focus visibility.
- Verify reduced-motion behavior.
- Verify anonymous, new signed-in, and returning-user home states.
- Confirm only the active hero image is eager.
- Run ESLint and TypeScript checks.
- Perform browser visual QA before committing implementation.

## Out of Scope

- Rebranding Spicy TV or changing the established OLED palette.
- Reworking movie, TV, detail, search, or library page layouts.
- Adding recommendation algorithms or new personalization data.
- Introducing Vercel Image Optimization or another image service.
- Adding a new motion or carousel dependency.
