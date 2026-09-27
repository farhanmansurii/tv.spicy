# Spicy TV Design & Route Architecture

This document describes how the repository is shaped, how pages are defined in the Next.js App Router, and where the current design system is strong or fragile.

## Product Shape

Spicy TV is a dark, cinematic streaming interface built on Next.js App Router. The product surface is organized around four primary user journeys:

- **Discovery:** home, movies, TV, genres, browse collections, search.
- **Detail and playback:** movie detail pages, TV detail pages, season tabs, embedded player.
- **Personal library:** watchlist, favorites, recently watched, continue watching.
- **Account sync:** Better Auth session state plus API routes that sync local library data into the database.

The app is mostly server-rendered at route boundaries, then hands interaction-heavy sections to client components using React Query, Zustand, GSAP, Embla carousel, and dynamic imports.

## Repository Layout

- `app/` defines all route segments, metadata, loading states, error states, API handlers, sitemap, and robots.
- `components/features/` contains domain UI for media rows, cards, detail pages, episodes, profile, search, and watchlist.
- `components/layout/` contains shell UI: header, sidebar, footer, providers.
- `components/shared/` contains reusable animated titles, containers, loaders, and small cross-feature primitives.
- `components/ui/` is the shadcn/Radix-style component layer.
- `lib/api/` wraps TMDB, streaming, Consumet, and detail caching.
- `lib/db/` wraps Prisma-backed user data operations.
- `store/` contains Zustand local state for auth, search, media query, playback, watchlist, favorites, and recents.
- `hooks/` contains user/session/sync helpers and UI hooks.
- `public/` contains icons, logo, font files, manifest, and genre data.

## App Shell

`app/layout.tsx` is the root shell. It installs font variables (`Inter_Tight`, `JetBrains_Mono`, `Anton`), global metadata, TMDB preconnect hints, dark theme defaults, auth provider, TanStack Query provider, sidebar provider, accessibility provider, and toaster.

`app/template.tsx` wraps route transitions. `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, and `app/global-error.tsx` handle global loading/error surfaces.

The visible shell is implemented below the provider layer:

- `components/layout/header/header.tsx`: sticky desktop/mobile header with nav, search command trigger, auth control.
- `components/layout/sidebar/app-sidebar.tsx`: mobile off-canvas navigation and account area.
- `components/layout/footer/footer.tsx`: brand, legal, nav, and social links.

## Static Pages

### `/`

Defined in `app/page.tsx`.

The home page fetches `trending/tv/week`, `trending/movie/week`, and `tv/popular` on the server. It enhances the hero candidates with `fetchHeroItemsWithDetails`, renders the editorial hero (`EditorialHero`), then renders prefetched and lazy rows through `DataRow` with `variant="editorial"` and a `rowNumber`. The editorial direction (Home A) is home-only: `/movie` and `/tv` keep `HeroCarousel` and the default row and card variants.

Primary components:

- `components/features/home/editorial-hero.tsx` and `editorial-hero-rail.tsx`
- `components/features/media/row/data-row.tsx`
- `components/features/media/row/media-row.tsx`
- `components/features/home/home-personalized-rows.tsx`

### `/movie`

Defined in `app/movie/page.tsx`.

The page fetches movie genres, top-rated movies, and detailed hero data. It renders a movie hero carousel, watchlist row, top/trending rows, a row per genre, and a genre grid.

### `/tv`

Defined in `app/tv/page.tsx`.

The page mirrors `/movie`, but uses TV endpoints. It also includes recently watched before watchlist.

### `/genres`

Defined in `app/genres/page.tsx`.

The page fetches movie and TV genres in parallel and renders genre cards that link into `/discover/[slug]` with query parameters: `type` and `title`.

### `/search`

Defined in `app/search/page.tsx` and wrapped by `app/search/layout.tsx`.

This is a client page. It reads `q` from URL search params, debounces local input, pushes search state into the URL, and uses React Query for two modes:

- `searchTMDB(query, page)` when query length is at least 2.
- `discoverMedia({ type, sortBy, page })` when query is empty or too short.

### `/library`

Defined in `app/library/page.tsx`.

This is a client page. It merges local Zustand data with DB-backed query data when signed in. It renders summary stats, continue watching, watchlist, favorites, and a sign-in CTA when the user is anonymous.

### `/profile`

Defined in `app/profile/page.tsx`.

This is a server page. It calls `getServerSession`; anonymous users redirect to `/auth/signin?callbackUrl=/profile`, while signed-in users render `ProfilePageClient`.

### `/auth/signin` and `/auth/error`

Sign-in and auth error pages are standard route pages under `app/auth/`.

## Dynamic Pages

### `/browse/[slug]`

Defined in `app/browse/[slug]/page.tsx`.

Purpose: named editorial collections linked from home rows.

Route contract:

- `params.slug` must exist in `BROWSE_CATEGORIES` in `lib/browse-categories.ts`.
- Unknown slugs call `notFound()`.
- Each category maps to `{ slug, endpoint, title, type, description }`.

Current supported slugs:

- `popular-tonight` -> `tv/popular`
- `binge-worthy-series` -> `trending/tv/week`
- `crowd-favorites-tv` -> `tv/popular`
- `airing-this-week` -> `tv/on_the_air`
- `critically-acclaimed-tv` -> `tv/top_rated`
- `blockbuster-hits` -> `trending/movie/week`
- `fresh-in-theaters` -> `movie/now_playing`
- `cult-classics-fan-favorites` -> `movie/popular`
- `cinema-hall-of-fame` -> `movie/top_rated`

Rendering flow:

1. `generateMetadata` reads `slug` and returns collection metadata.
2. Page reads `slug`, resolves it with `getBrowseCategory(slug)`, and calls `notFound()` when unresolved.
3. Server fetches `fetchRowData(category.endpoint)`.
4. Fetch errors render a full-page sync error.
5. Empty results render a full-page empty state.
6. Successful results render an editorial header and `MediaRow` in vertical grid mode.

Design note: this route is deterministic and controlled by local code, not a CMS or TMDB genre list.

### `/discover/[slug]`

Defined in `app/discover/[slug]/page.tsx`.

Purpose: genre discovery pages from `/genres`.

Route contract:

- `params.slug` is treated as `genreId`.
- `searchParams.type` must be present and becomes `movie` or `tv`.
- `searchParams.title` must be present for metadata and page copy.
- Missing `title`, missing `type`, or missing `genreId` calls `notFound()`.

Rendering flow:

1. `generateMetadata` combines `title` and `type`.
2. Page normalizes type to `movie` or `tv`.
3. Page builds a compatibility object for `LoadMore`.
4. `LoadMore` runs on the client.
5. First page and infinite pagination call `fetchGenreById(type, id, page)`.
6. Results render through `MediaRow` in vertical grid mode.

Design note: this route is query-param dependent. A raw `/discover/28` URL without `?type=movie&title=Action` intentionally 404s.

### `/movie/[movie]`

Defined in `app/movie/[movie]/page.tsx`.

Purpose: movie detail and playback.

Route contract:

- `params.movie` is the TMDB movie id.
- Missing or unfetchable details call `notFound()`.

Rendering flow:

1. `generateMetadata` fetches detail data through `getDetailShow(movie, 'movie')`.
2. Page fetches the same show through the detail cache.
3. `DetailHero` renders the cinematic hero.
4. `ShowContainer` renders a movie player through the dynamically imported `Episode` component.
5. `InfoPanelSection` streams inside Suspense and fetches credits.
6. `RelatedSection` streams inside Suspense and fetches similar/recommendations.

Cache path:

- `getDetailShow` -> `getShowCached` -> `fetchDetailsTMDB`
- `getDetailCredits` -> `getCreditsCached` -> `fetchCredits`
- `getDetailRelated` -> cached similar and recommendation row fetches

### `/tv/[tv]`

Defined in `app/tv/[tv]/page.tsx`.

Purpose: TV detail, season navigation, episode detail, and episode playback.

Route contract:

- `params.tv` is the TMDB TV id.
- Missing or unfetchable details call `notFound()`.

Rendering flow:

1. `generateMetadata` fetches detail data through `getDetailShow(tv, 'tv')`.
2. Page fetches the same show through the detail cache.
3. `DetailHero` renders the cinematic hero.
4. `ShowContainer` receives seasons and dynamically imports `SeasonTabs`.
5. `SeasonTabs` owns season/episode UI and episode detail presentation.
6. `InfoPanelSection` streams inside Suspense and fetches credits.
7. `RelatedSection` streams inside Suspense and fetches similar/recommendations.

Design note: movie and TV detail pages are nearly identical. Their duplication is understandable but currently creates maintenance drift risk.

## API Routes

### `/api/auth/[...all]`

Delegates Better Auth GET/POST handling through `toNextJsHandler(auth)`.

### `/api/watchlist`

Authenticated CRUD for watchlist rows. Supports optional `type` filtering, normalized payloads, single-item delete, and clear-by-type.

### `/api/favorites`

Authenticated CRUD for favorite media ids. Supports optional `type` filtering and single-item or bulk clearing.

### `/api/recently-watched`

Authenticated read/write/update/delete for watch progress. Supports limit, progress updates, and optional media filters.

### `/api/recent-searches`

Authenticated read/add/clear for recent search text.

### `/api/sync`

Authenticated one-shot local-to-DB sync for watchlist, recently watched, favorites, and recent searches.

## Data Flow

TMDB access is centralized in `lib/api/tmdb-client.ts`.

Main fetchers:

- `fetchRowData(endpoint)`: lists such as trending, popular, top rated, similar, recommendations.
- `fetchDetailsTMDB(id, type)`: full detail with images, videos, providers, keywords, external ids.
- `fetchGenres(type)`: movie or TV genre list.
- `fetchGenreById(type, genreId, page)`: discover endpoint by genre.
- `searchTMDB(query, page)`: multi-search filtered to movie/TV.
- `discoverMedia(options)`: generic discover endpoint.
- `fetchSeasonEpisodes(showId, seasonNumber)`: season details.
- `fetchEpisodeDetails(showId, seasonNumber, episodeNumber)`: episode detail with credits/images.
- `fetchHeroItemsWithDetails(shows, type, maxItems)`: enriches hero candidates in parallel.

Detail pages add a second caching layer in `lib/api/detail-cache.ts` using React `cache` and Next `unstable_cache`.

Client-side row loading is split:

- Server pages can provide `initialData` to `DataRow`.
- `DataRow` lazy-loads rows with `useInView` and React Query.
- `LoadMore` handles infinite genre pagination for `/discover/[slug]`.

## Visual System

The UI language strictly follows the Home A reference system (`reference-system.md`):

### Reference Token Source of Truth (Dark Theme)

| Token | Reference Value | Role |
|---|---|---|
| `--canvas` / `--background` | `#0c0b0a` | Deep warm paper-black canvas (also painted on `html`) |
| `--band` | `#141210` | Alternate section background, raised bars, muted surfaces |
| `--surface` / `--card` / `--popover` | `#1c1916` | Card background, floating surfaces |
| `--raised` | `#2a221d` | Card placeholder gradient top, hover surface |
| `--line` / `--border` | `rgba(244,239,232,0.12)` | Subtle structural lines, card inset outline, dividers |
| `--line-strong` / `--border-strong` / `--input` | `rgba(244,239,232,0.24)` | High-emphasis borders, ghost button borders, inputs |
| `--text` / `--foreground` / `--primary` | `#f4efe8` | Warm text, headlines, titles, primary display copy |
| `--primary-foreground` | `#1a0703` | Ink text on primary/accent |
| `--soft` | `#ddd6cd` | Long-form reading / lede prose |
| `--dim` / `--muted-foreground` | `#b3aaa1` | Dim labels, captions, metadata |
| `--faint` | `rgba(244,239,232,0.4)` | Disabled elements only |
| `--brand` / `--ring` | `#ff4d2e` | The only accent: primary action, current item, focus ring, numbers in captions, stars, progress |
| `--brand-hover` | `#ff6a4f` | Accent hover state |
| `--brand-foreground` | `#1a0703` | Text on brand accent |
| `--destructive` | `#e5484d` | Errors and destructive actions only (always with icon and label) |
| `--gutter` | `clamp(16px, 4vw, 56px)` | Fluid horizontal page padding (`.px-gutter`) |
| `--radius` | `6px` | Media and card radius (`rounded-sm` = 6px) |
| `--duration-image` | `250ms` | Image hover zoom transition |
| `--duration-fade` | `280ms` | Image fade-in transition |
| `--gradient-band` | `radial-gradient(120% 90% at 70% 30%, #3b1c12 0%, #1a110d 45%, var(--background) 80%)` | Hero and detail background band |
| `--gradient-card-placeholder` | `linear-gradient(160deg, #2a221d 0%, #15120f 100%)` | Card image placeholder background |
| `::selection` | `bg: var(--brand), color: var(--brand-foreground)` | App-wide selection style |
| `:focus-visible` | `outline: 2px solid var(--brand); outline-offset: 3px;` | Keyboard focus ring |
| `grain` | `body::after` fractal noise svg, opacity 0.05, fixed, z-90 | Global textured grain overlay |

- Canvas: warm paper-black (`#0c0b0a`).
- Text: warm off-white (`#f4efe8`), dim (`#b3aaa1`), soft (`#ddd6cd`).
- Accent: vibrant red-orange (`#ff4d2e`, `--brand`). Rating yellow is retired; stars use `--brand`.
- Destructive: crimson (`#e5484d`), distinct from brand accent.
- Typography: Anton display font (uppercase), Inter Tight body font, JetBrains Mono captions.
- Motion: fast instant touch (150ms), reveal cascade (450ms, ease-entrance), 250ms image zoom, 280ms image fade.

Important local primitives:

- `Container` standardizes horizontal rhythm.
- `CommonTitle` and `SectionWrapper` create editorial section language.
- `MediaCard`, `MediaRow`, and `DataRow` are the content-listing backbone.
- `HeroCarousel` and `HeroBanner` own home/movie/TV hero presentation.
- `DetailHero`, `MediaInfoPanel`, `ShowContainer`, `MoreDetailsContainer` own detail pages.

Image policy:

- This repo now uses native `<img>` for app imagery instead of `next/image`.
- TMDB images are emitted as direct `https://image.tmdb.org/...` URLs.
- This avoids Vercel Image Optimization quota exhaustion and makes production behavior simpler.

## Critique

### Strong Choices

- The App Router route tree is easy to understand and maps closely to product concepts.
- Server routes do the right thing for SEO-critical pages: home, movie, TV, genres, and details all have server-rendered shells.
- Detail pages use Suspense well: the primary show blocks first, while info and related content stream independently.
- `lib/api/tmdb-client.ts` centralizes TMDB concerns, which keeps endpoint knowledge out of most components.
- The card/row/hero model creates a consistent streaming-product vocabulary across home, movie, TV, browse, and search.
- The native `<img>` migration is the right production tradeoff for a media-heavy TMDB app on Vercel.

### Main Problems

- **Dynamic route typing is loose.** `app/movie/[movie]/page.tsx`, `app/tv/[tv]/page.tsx`, and several client utilities use `any`. These are high-value route contracts and should be typed.
- **Movie and TV detail pages duplicate almost the same code.** The only meaningful differences are media type, param key, metadata labels, and season props.
- **`/discover/[slug]` hides critical route state in query params.** The slug is only the genre id; `type` and `title` are required but not encoded in the path. Shared links are brittle if query params are dropped.
- **`LoadMore` has an awkward prop contract.** It receives a synthetic `params` object that contains a promise of `searchParams`, instead of receiving parsed `type`, `genreId`, and `title` directly.
- **Visual tokens exist, but many components bypass them.** Components mix CSS variables, Tailwind arbitrary values, raw hex colors, Apple system font stacks, and one-off radii.
- **File sizes and responsibilities are drifting.** Large components like `media-info-panel.tsx`, `search/page.tsx`, and some library/profile surfaces combine layout, data, tabs, modal state, and presentation.
- **API route validation is manual.** Request bodies are normalized with ad hoc checks instead of a shared schema layer.
- **Some routes swallow errors into empty UI.** `fetchRowData` returns `[]` on failure, which can make network/API failures look like empty categories.

### Recommended Refactors

1. Create a shared `MediaDetailPage` server helper that accepts `{ id, type, labels }` and powers both `/movie/[movie]` and `/tv/[tv]`.
2. Replace `LoadMore` props with explicit props: `{ genreId, mediaType, title }`.
3. Change discover URLs to encode type in the path: `/discover/movie/28/action` or `/discover/tv/10759/action-adventure`.
4. Slugs live in the shared typed module `lib/browse-categories.ts` (`BROWSE_CATEGORIES`, `getBrowseCategory`) instead of an inline `categoryMap` in `app/browse/[slug]/page.tsx`.
5. Add Zod schemas for API route bodies and query params: watchlist, favorites, recently watched, recent searches, sync.
6. Split oversized client components by responsibility: shell, tabs, lists, modals, item cards, and data hooks.
7. Consolidate design tokens: define card radius, hero radius, section spacing, text colors, and focus rings once, then remove repeated raw arbitrary classes where possible.
8. Preserve error identity in TMDB fetchers: return typed `Result`-like values or throw at server route boundaries instead of collapsing all failures to empty arrays.

## Page Definition Checklist

When adding a new page:

- Define the route under `app/` with a clear segment name.
- Decide whether it is server-first or client-first.
- Add `loading.tsx` if the route blocks on server data.
- Add `error.tsx` when the route has user-visible recovery.
- Add metadata or `generateMetadata` for SEO surfaces.
- Keep route params typed and parsed at the boundary.
- Push API endpoint knowledge into `lib/api`, not route components.
- Reuse `Container`, `SectionWrapper`, `DataRow`, `MediaRow`, and `MediaCard` unless the page needs a genuinely new content pattern.
- Prefer direct native `<img>` for TMDB/Youtube imagery.

## Dynamic Route Checklist

When adding a dynamic route:

- Name the param after its semantic role, not the page type alone.
- Parse `params` and `searchParams` once at the route boundary.
- Call `notFound()` for invalid, missing, or unsupported route state.
- Generate metadata from the same parsed contract.
- Keep user-facing route state in the path when it is required.
- Avoid passing unresolved `params` promises into client components.
- Keep slug maps in shared typed modules when more than one page links to them.
- Include a loading state scoped to the dynamic route segment.

## Visual QA Contract

This section is enforceable. Every screen MUST comply with these exact values. Deviations require explicit design review.

### Token Source

`app/globals.css` is the only source of design tokens. The project has no JavaScript Tailwind config; Tailwind v4 reads tokens from CSS:

- `:root` and `.dark` hold the raw colour variables that switch per theme.
- `@theme inline` maps those variables to utilities (`bg-background`, `text-muted-foreground`, `bg-brand`), and holds the font stacks and the radius scale, which derive from other variables.
- `@theme` holds static tokens: the type-scale overrides, tracking, shadows, easing, durations and the rail animation.

Add a token by declaring it in one of these blocks; never add raw values to components when a token exists. Tailwind only emits a static `@theme` variable once a class or `var()` uses it.

### Canvas / Surface Colors

The app runs in dark mode; the `:root` light values are the shadcn base and MUST NOT be used for product surfaces.

| Token | Utility | Dark Value | Usage |
|-------|---------|------------|-------|
| `--canvas` / `--background` | `bg-canvas`, `bg-background` | `#0c0b0a` | Deep warm paper-black canvas, empty states; painted on `html` |
| `--band` / `--muted` | `bg-band`, `bg-muted` | `#141210` | Raised bands, alternate section background, secondary surfaces |
| `--surface` / `--card` / `--popover` | `bg-surface`, `bg-card`, `bg-popover` | `#1c1916` | Card shells, menus, floating surfaces |
| `--raised` | `bg-raised` | `#2a221d` | Card placeholder gradient top, hover surface |
| `--line` / `--border` | `border-line`, `border-border` | `rgba(244,239,232,0.12)` | Hairlines, card inset outline, dividers |
| `--line-strong` / `--border-strong` / `--input` | `border-line-strong`, `border-border-strong`, `border-input` | `rgba(244,239,232,0.24)` | High-emphasis borders, ghost button borders, form field borders |
| `--text` / `--foreground` | `text-text`, `text-foreground` | `#f4efe8` | Primary warm text, headlines, titles, icons on dark |
| `--soft` | `text-soft` | `#ddd6cd` | Long-form reading / lede copy (13.7:1 contrast) |
| `--dim` / `--muted-foreground` | `text-dim`, `text-muted-foreground` | `#b3aaa1` | Dim text, metadata, captions, secondary copy (8.6:1 contrast) |
| `--faint` | `text-faint` | `rgba(244,239,232,0.4)` | Disabled elements only |
| `--brand` / `--ring` | `bg-brand`, `text-brand`, `ring-ring` | `#ff4d2e` | The only accent: primary action, current item, focus ring, numbers in captions, stars, progress |
| `--brand-hover` | `bg-brand-hover` | `#ff6a4f` | Brand CTA hover and press |
| `--brand-foreground` | `text-brand-foreground` | `#1a0703` | Ink text on brand fills |
| `--destructive` | `bg-destructive` | `#e5484d` | Errors and destructive actions only; always with icon and label |

The brand colour is the same in both themes, so it lives only in `:root`. Destructive is `#e5484d` (shifted from old `#ff453a` to avoid colliding with brand accent). Separate rating yellow (`#ffd60a`) is retired; stars use `--brand` (`#ff4d2e`).

### Typography

Three families, all loaded in `app/layout.tsx`:

| Family Role | Font | Weights | Use |
|-------------|------|---------|-----|
| Display | Anton (`next/font/google`) | 400 | Headlines, titles, ghost numerals. Always uppercase, `letter-spacing: 0`, `text-wrap: balance`. Never used below 1.25rem (20px). |
| Text | Inter Tight (`next/font/google`) | 400, 600, 700 | UI and body copy. `text-wrap: pretty` on paragraphs. |
| Mono | JetBrains Mono (`next/font/google`) | 500 | Editorial captions: slate, row numbers, counts, card metadata. Always uppercase, `font-variant-numeric: tabular-nums`, tracked .1-.14em. Numbers in accent. |

#### Complete Type Roles

| Role | Utility | Size | Line Height | Tracking | Weight / Family | Use |
|------|---------|------|-------------|----------|-----------------|-----|
| `display-1` | `text-display-1` | `clamp(3.5rem, 10vw, 9rem)` | `0.88` | `0` | Anton | Hero / detail cover page title (<= 14 chars) |
| `display-1-long` | `text-display-1-long` | `clamp(2.75rem, 7vw, 6.5rem)` | `0.88` | `0` | Anton | Titles 15 to 28 characters |
| `display-1-extended` | `text-display-1-extended` | `clamp(2.25rem, 5vw, 4.5rem)` | `0.88` | `0` | Anton | Titles 29 to 48 characters |
| `display-1-maximum` | `text-display-1-maximum` | `clamp(1.75rem, 3.6vw, 3rem)` | `0.88` | `0` | Anton | Titles over 48 characters |
| `display-2` | `text-display-2` | `clamp(2rem, 4.4vw, 3.25rem)` | `0.95` | `0` | Anton | Section headings |
| `display-3` | `text-display-3` | `1.75rem` | `1` | `0` | Anton | Score figure, fact values, episode numbers, subtitle split |
| `display-4` | `text-display-4` | `1.25rem` | `1.05` | `0` | Anton | Overlay titles on wide cards, media fallbacks |
| `lede` | `text-lede` | `1.125rem` | `1.6` | `0` | 400 / Inter Tight | Overview, story, lede prose; max 60ch |
| `body` | `text-body` | `1rem` | `1.5` | `0` | 400 / Inter Tight | Default copy |
| `title` | `text-title` | `0.9375rem` | `1.3` | `0` | 600 / Inter Tight | Card, episode and cast names |
| `ui` | `text-ui` | `0.875rem` | `1` | `0` | 600 / Inter Tight | Buttons, tabs, nav, links |
| `small` | `text-small` | `0.8125rem` | `1.45` | `0` | 400 / Inter Tight | Synopses under titles, secondary copy; max 56ch |
| `caption` | `text-caption` | `0.75rem` | `1` | `0.14em` | 500 / JetBrains Mono | Slate lines, section index, counts, fact labels |
| `micro` | `text-micro` | `0.6875rem` | `1` | `0.1em` | 500 / JetBrains Mono | Card meta, badges, durations |

Tracking uses Tailwind defaults plus `tracking-label` (`0.14em`), `tracking-caps` (`0.2em`), `tracking-meta` (`0.08em`), and `tracking-meta-wide` (`0.12em`).

When a `leading-*` class and a size class meet in `cn()`, put the size first; `tailwind-merge` drops a `leading-*` that precedes a font size because a v4 size also sets line height.

### Focus Ring

There is exactly one focus treatment, defined once in `app/globals.css`:

```css
:focus-visible {
	outline: 2px solid var(--brand);
	outline-offset: 3px;
}
```

`--brand` is `#ff4d2e`, so the ring is the accent. Do not add a second recipe. A component that needs to suppress the global outline must re-declare the same outline explicitly, never substitute `ring-2 ring-ring ring-offset-2` (the older recipe, now removed from `Button`, `Input`, `SelectTrigger`, `Sheet`'s close button and the header controls). Editorial cards show focus with the 2px brand edge instead of an outline.

`outline` (not `box-shadow`) is deliberate: it follows `border-radius` and it is what the reference uses. Note that both forms are clipped by an ancestor with `overflow: hidden`, so a focus ring on a card edge must sit inside the card's own padding.

### Touch Targets

Two `@utility` rules in `app/globals.css` keep a control's visual size and grow its hit area on
`(pointer: coarse)`. Each sets `position: relative` and a `::after` that is `display: none` on fine
pointers, so neither adds layout or visual weight on desktop. Pick by the control's visual size:

| Utility | Inset per side | Use for | Result |
|---|---|---|---|
| `hit-target` | 4px | 40px and larger controls (icon buttons, arrows, close buttons) | 40 to 48 |
| `hit-target-lg` | 8px | 32px controls (the footer social buttons) | 32 to 48 |

`Button` applies `hit-target` automatically for `size="icon"` and `size="icon-lg"`. Icon buttons
stay visually 40px, which is the system size. When adding one to a hand-rolled control, measure it:
inflate the control's rect by the same amount as the `::after` and intersect it with every other
control's rect, clipped to any scroll container, or the test will invent overlaps on off-screen
pixels.

`mt-section` (`clamp(48px, 6vw, 80px)`) is the margin form of `.section-spacing`'s bottom padding.
Use it for the space above a page-closing band such as the footer, so the rhythm holds below 1440
instead of breaking at a fixed 80px.

### Radius

The base token is `--radius: 6px`, and the rule is narrow: **`rounded-sm` (6px) is the only radius for media, cards and surfaces, and `rounded-full` (999px) is the only radius for pills and circular buttons.** Nothing in between is a design decision.

The wider steps still exist in the `@theme inline` scale because older surfaces used them. Treat any use of `rounded-lg` and above as debt to be removed, not as a level:

| Utility | Value | Status |
|---------|-------|--------|
| `rounded-sm` | `6px` | The only surface and media radius. Cards, posters, menus, sheets, inputs, tooltips, toasts, skeletons |
| `rounded-full` | `999px` | The only other radius. Pills, circular icon buttons, avatars, badges |
| `rounded-md` | `8px` | Base class on `Button`; overridden by every size. Avoid elsewhere |
| `rounded-lg` and above | `10px`–`26px` | Legacy. No current surface is approved for these; see ds-ops/final/REQUESTS.md for the two open cases (wide media cards, account menu) |

`--radius` is the exact reference token (`6px`); the `rounded-*` scale derives from it via `calc()`.

The former per-surface variables (`--radius-hero`, `--radius-card`, `--radius-episode*`, `--radius-ui*`, `--radius-dialog*`, `--radius-small/medium/large`) were removed: no component used them except one `rounded-ui`, which is now `rounded-md` (the same 8px).

### Measures

Text measures are utilities, not arbitrary values, so the `shadcn/no-arbitrary-values` rule enforces them: `max-w-prose` is 60ch (prose: overviews, stories, ledes) and `max-w-prose-secondary` is 56ch (synopses and secondary copy). These are the only two measures; do not add a third and do not write `max-w-[60ch]`.

### Section Spacing

One vertical scale, one token. `.section-spacing` in `app/globals.css` is the single source: `padding-top: clamp(28px, 4vw, 48px)` and `padding-bottom: clamp(48px, 6vw, 80px)`. Row stacks add their own `gap-*` on top of it. The older per-page `space-y-*` values that disagreed with each other are gone; do not reintroduce them.

### Error and Not-Found States

`app/not-found.tsx` (404), `app/error.tsx` (route error), `app/global-error.tsx` (root error) and `components/shared/errors/page-fetch-error.tsx` (data fetch failure) are one recipe, not four:

- Mono uppercase caption with an icon, in `text-destructive` for a failure and `text-dim` for a dead address. Destructive is never a large fill and never appears without an icon and a label.
- Anton uppercase title in its normal display role, never a body-font heading and never sentence case.
- Lede copy in `text-soft`, measure `max-w-prose`, sentence case, editorial voice ("The projector jammed.", "Nothing here but dust.").
- Actions are `Button` primitives. Never a hand-rolled `<button>` with a white fill.
- Layout is gutter-aligned and left-aligned like every other page (`px-gutter pt-safe-header`), not centred in a card, and it sets no min-height beyond `min-h-error` so a short state never forces a second scroll.

`global-error.tsx` renders its own `<html>` and `<body>`, so it must carry `bg-background text-foreground` itself: the root layout that normally supplies the canvas is not there to do it.

### Motion

Tokens (`app/globals.css` `@theme`, mirrored for framer-motion in `lib/motion.ts`):

| Token | Value | Usage |
|-------|-------|-------|
| `ease-entrance` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrances, reveals, press feedback |
| `ease-cinematic` | `cubic-bezier(0.22, 1, 0.36, 1)` | Liquid glass, Ken Burns |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Detail-page hover pops |
| `ease-sheet` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheet transitions |
| `--duration-press` | `150ms` | Press feedback (`active:scale-[0.97]`) |
| `--duration-ui` | `200ms` | Colour, border and opacity state changes |
| `--duration-reveal` | `450ms` | Entrance reveals and backdrop crossfades |
| `animate-rail-progress` | `8s linear` | Home hero autoplay progress |
| `pressable` | scale transition at `--duration-press`, scale `.97` | Fine-grained press feedback, reduced-motion-safe |
| `hit-target`, `hit-target-lg` | 48px hit area at `(pointer: coarse)` | Circular icon controls; visual size unchanged |
| `max-w-prose`, `max-w-prose-secondary` | `60ch`, `56ch` | The only two text measures |
| `shadow-glow-*` | white glow values by light/primary/accent | Button glow variants |
| `shadow-glass`, `shadow-overlay`, `shadow-account-menu` | Named surface shadows | Glass, modal and account-menu surfaces |
| `pt-safe-header`, `pb-safe` | Safe-area inset offsets | Notch-aware layout spacing |

Use durations as `duration-(--duration-ui)`. Rules for new motion:

- Interaction transitions stay under 300ms; entrance reveals stay at or under 450ms.
- Never `transition-all`. Name the properties: `transition-[color,background-color,border-color,transform]`, `transition-opacity`, `transition-transform`.
- Animate `transform` and `opacity` (plus named colour or border properties). Never animate width, height, top, left or margin.
- Press feedback is `active:scale-[0.97]` at `--duration-press` with `ease-out`. `Button` applies it by default.
- Hover styles on editorial surfaces use `can-hover:` / `group-can-hover:`, which require `(hover: hover) and (pointer: fine)`. Core `hover:` only checks `(hover: hover)`.
- Staggers: hero title words 55ms apart; row cards `180ms + min(i, 8) × 45ms` (`cardRiseDelay`).

Existing longer durations (`duration-700`, `duration-1000`, `duration-[12000ms]` Ken Burns, GSAP `0.55`/`16`) are legacy detail-page motion; do not copy them into new work.

**Reduced motion:** four layers honour `prefers-reduced-motion: reduce`. Reduced motion keeps opacity and colour changes, and removes movement and infinite loops.

1. **CSS**: the `@media (prefers-reduced-motion: reduce)` block in `app/globals.css` zeroes animation and transition durations on `.liquid-glass-surface`, hides `.liquid-glass-touch`, and stops the `.grain-overlay` loop. Tailwind `motion-reduce:` / `motion-safe:` variants handle component-level cases (the hero rail's progress fill is static and its pause control is hidden, so the carousel never auto-advances).
2. **framer-motion**: `components/providers/motion-provider.tsx` renders `<MotionConfig reducedMotion="user">`, so `riseVariants` reveals keep their fade and drop their `y` movement. Do not add a second motion system.
3. **GSAP**: detail-page sections register timelines with `gsap.matchMedia()` and branch on `(prefers-reduced-motion: reduce)`.
4. **Hero Ken Burns** (`hero-banner.tsx`) is skipped when `prefersReducedMotion` is true.

### Image Policy

- **Native `<img>` ONLY.** `next/image` is banned for all TMDB/app imagery. This avoids Vercel Image Optimization quota exhaustion and keeps production behavior deterministic.
- **Direct TMDB URLs.** Image `src` MUST be a direct `https://image.tmdb.org/t/p/...` URL. No proxy, no rewrite, no intermediate API.
- **Preferred TMDB sizes:**
  - Mobile heroes: `w780`
  - Desktop heroes: `w1280`
  - Cards / logos: `w500`

**Sources:**
- Policy declared in DESIGN.md line 279 and enforced in `components/features/media/hero-banner.tsx` lines 138–157, `components/features/media/card/media-card.tsx` lines 150–156, and `components/features/media/details/detail-hero.tsx` lines 185–207.

## Production Image Policy

This section formalizes the image hardening rules already implemented in the codebase. Every image component MUST follow these rules exactly.

### 1. Native `<img>` Mandate

All app imagery uses native `<img>` with direct `https://image.tmdb.org/...` URLs. `next/image` is NEVER used for TMDB content.

### 2. Every Image MUST Have an `onError` Handler

No image component is allowed to fail silently. The handler MUST fall back to a cinematic dark surface.

#### Card Images (`MediaCard`)

- **Fallback surface:** `bg-gradient-to-br from-zinc-800 to-zinc-950`
- **Content:** The show title (`show.title || show.name`) MUST remain visible in white text, centered, with `text-sm md:text-base font-semibold text-white/90`
- **Below-card metadata:** The title row and rating row below the card MUST persist even when the image fails
- **Implementation:** `const [imageError, setImageError] = useState(false);` → conditional render of the fallback `div` when `imageError` is true
- **Source:** `components/features/media/card/media-card.tsx` lines 37, 136, 192–198

#### Hero Images (`HeroBanner`)

- **Fallback surface:** `bg-gradient-to-br from-zinc-900 to-black` placed as an absolute layer beneath the `<img>`
- **Error behavior:** `onError={handleImageLoad}` — this sets `imageLoaded = true` so the content animation still fires and the hero does not remain blank
- **No visible title in fallback:** The hero already has the title/logo in the content overlay; the fallback is a pure dark gradient
- **Source:** `components/features/media/hero-banner.tsx` lines 127, 156

#### Detail Hero Images (`DetailHero`)

- **Fallback surface:** `bg-gradient-to-br from-zinc-900 to-black` as the bottom z-layer
- **Error behavior:** `onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}`
- **Critical rule:** The failed `<img>` MUST be hidden via `display: none` so the dark fallback beneath the gradient scrims becomes visible. Do not use opacity tricks.
- **Separate mobile/desktop images:** Mobile (`w780`) and desktop (`w1280`) are separate `<img>` tags; each MUST have its own `onError` handler
- **Source:** `components/features/media/details/detail-hero.tsx` lines 181, 191–193, 203–205

### 3. TMDB Size Selection

| Context | Size | Rationale |
|---------|------|-----------|
| Mobile hero backdrop | `w780` | Sufficient for portrait-width screens; reduces payload |
| Desktop hero backdrop | `w1280` | Full-width cinematic quality |
| Card poster/backdrop | `w500` | Optimal for thumbnail grids |
| Detail hero mobile | `w780` | Poster or backdrop on phones |
| Detail hero desktop | `w1280` | Full backdrop on larger screens |
| Logo images | `w500` | High enough for large logo treatment |

**Source:** `lib/tmdb-image.ts` [verify] defines the `tmdbImage(path, size)` helper. Sizes are selected at call sites in `hero-banner.tsx`, `media-card.tsx`, and `detail-hero.tsx`.

## Dynamic Route Guardrails

These invariants are named, non-negotiable rules for every dynamic route in the App Router. They convert the existing `/discover/[slug]` critique into enforceable standards.

### The Path-State Rule

**Required user-facing route state MUST live in path params or a canonical server-resolved lookup, not disposable query params.**

- `/discover/28` without `?type=movie&title=Action` is a **404** because `type` and `title` are required for metadata, page copy, and API calls.
- `/discover/28?type=movie&title=Action` is the **deprecated** accepted shape, preserved for backward compatibility only.
- The **target** shape is `/discover/movie/28/action` or `/discover/tv/10759/action-adventure`, where `type` and a slugified `title` are encoded in the path.
- Any new dynamic route that requires multiple pieces of state MUST encode them in the path segment structure, not in `searchParams`.

**Rationale:** Query params are dropped by link sharing, browser prefetching, and caching. Path params survive.

**Source:** `app/discover/[slug]/page.tsx` lines 141–146; DESIGN.md critique lines 298–299.

### The Slug Map Rule

**Named editorial collections (`/browse/[slug]`) MUST have their slugs defined in a shared typed module. Unknown slugs call `notFound()`.**

- **Satisfied.** The map now lives in `lib/browse-categories.ts` as the typed `BROWSE_CATEGORIES` record with a `getBrowseCategory()` helper; `app/browse/[slug]/page.tsx` no longer defines an inline `categoryMap`.
- The module is `lib/browse-categories.ts`, exported as a typed `Record<string, BrowseCategory>` with a derived `BrowseCategorySlug` union.
- Any page that links to `/browse/[slug]` (e.g., `app/page.tsx`, `app/movie/page.tsx`, `app/tv/page.tsx`) MUST import slugs from that shared module, never hardcode them inline.
- Unknown slugs MUST call `notFound()` at the route boundary before any data fetch.

**Current supported slugs:**

| Slug | Endpoint | Type | Title |
|------|----------|------|-------|
| `popular-tonight` | `tv/popular` | `tv` | Popular Tonight |
| `binge-worthy-series` | `trending/tv/week` | `tv` | Binge-Worthy Series |
| `crowd-favorites-tv` | `tv/popular` | `tv` | Crowd Favorites |
| `airing-this-week` | `tv/on_the_air` | `tv` | Airing This Week |
| `critically-acclaimed-tv` | `tv/top_rated` | `tv` | Critically Acclaimed TV |
| `blockbuster-hits` | `trending/movie/week` | `movie` | Blockbuster Hits |
| `fresh-in-theaters` | `movie/now_playing` | `movie` | Fresh in Theaters |
| `cult-classics-fan-favorites` | `movie/popular` | `movie` | Cult Classics & Fan Favorites |
| `cinema-hall-of-fame` | `movie/top_rated` | `movie` | Cinema Hall of Fame |

**Formerly missing slugs:** `airing-this-week` and `cult-classics-fan-favorites` were linked from `app/page.tsx` but absent from the map. Both now exist in `lib/browse-categories.ts` (lines 31 and 59), so nothing is missing today.

**Source:** `lib/browse-categories.ts` (`BROWSE_CATEGORIES`, `getBrowseCategory`); `app/browse/[slug]/page.tsx` (resolves the slug and calls `notFound()` for unknown values).

### The Param Parse Rule

**`params` and `searchParams` MUST be parsed once at the route boundary. Client components receive parsed primitives, not unresolved promises.**

- Server page components MUST `await params` and `await searchParams` before passing data to client children.
- Client components MUST receive `genreId: number`, `mediaType: 'movie' | 'tv'`, `title: string` — never `params: Promise<{ slug: string }>`.
- `LoadMore` currently receives a synthetic `params` object containing a promise of `searchParams`. This is a **violation** and MUST be refactored to explicit props: `{ genreId, mediaType, title }`.

**Rationale:** Unresolved promises in props create race conditions, hydration mismatches, and type safety holes.

**Source:** `app/discover/[slug]/page.tsx` [verify]; DESIGN.md critique lines 299 and 309.

### The Loading/Error Rule

**Every dynamic route MUST have a scoped `loading.tsx` and `error.tsx`.**

- The file MUST live inside the dynamic segment directory (e.g., `app/browse/[slug]/loading.tsx`), not at a parent level.
- `loading.tsx` MUST render a skeleton that matches the final layout's visual shape (same container width, same section count) to avoid layout shift.
- `error.tsx` MUST be a Client Component (`'use client'`) and MUST offer a retry action (`reset()`) when the error is recoverable.
- `not-found.tsx` MUST be present when the route calls `notFound()`.

**Current compliance audit:**

| Route | `loading.tsx` | `error.tsx` | `not-found.tsx` | Status |
|-------|---------------|-------------|-----------------|--------|
| `/browse/[slug]` | [verify] | [verify] | [verify] | **NON-COMPLIANT** — needs audit |
| `/discover/[slug]` | [verify] | [verify] | [verify] | **NON-COMPLIANT** — needs audit |
| `/movie/[movie]` | [verify] | [verify] | `notFound()` present | [verify] |
| `/tv/[tv]` | [verify] | [verify] | `notFound()` present | [verify] |

**Action:** Add scoped `loading.tsx`, `error.tsx`, and `not-found.tsx` to `/browse/[slug]` and `/discover/[slug]` immediately.

