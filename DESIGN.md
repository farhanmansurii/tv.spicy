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

`app/layout.tsx` is the root shell. It installs the Geist font variable, global metadata, TMDB preconnect hints, dark theme defaults, auth provider, TanStack Query provider, sidebar provider, accessibility provider, and toaster.

`app/template.tsx` wraps route transitions. `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, and `app/global-error.tsx` handle global loading/error surfaces.

The visible shell is implemented below the provider layer:

- `components/layout/header/header.tsx`: sticky desktop/mobile header with nav, search command trigger, auth control.
- `components/layout/sidebar/app-sidebar.tsx`: mobile off-canvas navigation and account area.
- `components/layout/footer/footer.tsx`: brand, legal, nav, and social links.

## Static Pages

### `/`

Defined in `app/page.tsx`.

The home page fetches `trending/tv/week`, `trending/movie/week`, and `tv/popular` on the server. It enhances the hero candidates with `fetchHeroItemsWithDetails`, renders `HeroCarousel`, then renders prefetched and lazy rows through `DataRow`.

Primary components:

- `components/features/media/carousel/hero-carousel.tsx`
- `components/features/media/hero-banner.tsx`
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

- `params.slug` must exist in local `categoryMap`.
- Unknown slugs call `notFound()`.
- Each category maps to `{ endpoint, title, type, description, label }`.

Current supported slugs:

- `binge-worthy-series` -> `trending/tv/week`
- `crowd-favorites-tv` -> `tv/popular`
- `critically-acclaimed-tv` -> `tv/top_rated`
- `blockbuster-hits` -> `trending/movie/week`
- `fresh-in-theaters` -> `movie/now_playing`
- `cinema-hall-of-fame` -> `movie/top_rated`

Rendering flow:

1. `generateMetadata` reads `slug` and returns collection metadata.
2. Page reads `slug`, validates `categoryMap`.
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

The dominant UI language is cinematic OLED:

- Canvas: black/dark zinc surfaces.
- Text: white primary, zinc/white alpha secondary.
- Accent: mostly white and Apple-like blue for focus/progress states.
- Radius: larger editorial radii for heroes/cards, smaller UI radii for controls.
- Typography: Geist root font with occasional Apple system font styling in feature components.
- Layout: max-width containers, horizontal carousels, poster/backdrop cards, large cinematic heroes.
- Motion: GSAP for hero/card/details reveals, Framer Motion for episode UI, Embla for carousels.

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
4. Move `categoryMap` from `app/browse/[slug]/page.tsx` into a shared typed module such as `lib/routes/browse-categories.ts`.
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

### Canvas / Surface Colors

All colors reference CSS custom properties defined in `app/globals.css`. The app runs in dark mode only; the `:root` light theme is inherited from the shadcn base and MUST NOT be used for product surfaces.

| Token | CSS Variable | Dark Value | Usage |
|-------|--------------|------------|-------|
| Background | `--background` | `#000000` | Page canvas, hero backdrop, empty states |
| Foreground | `--foreground` | `#ffffff` | Primary text, icons on dark |
| Card | `--card` | `#0a0a0a` | Card shells, popovers, elevated surfaces |
| Card Foreground | `--card-foreground` | `#ffffff` | Text on card surfaces |
| Muted | `--muted` | `#1c1c1e` | Secondary surfaces, input backgrounds, skeletons |
| Muted Foreground | `--muted-foreground` | `#8e8e93` | Secondary text, placeholders, disabled states |
| Border | `--border` | `rgba(255,255,255,0.1)` | Dividers, card rings, subtle outlines |
| Input | `--input` | `rgba(255,255,255,0.15)` | Form field backgrounds |
| Ring | `--ring` | `#0a84ff` | Focus rings, active states, progress bars |
| Destructive | `--destructive` | `#ff453a` | Errors, remove actions |

**Sources:** `app/globals.css` lines 113–158; `@theme inline` block lines 160–235.

### Text Hierarchy

The typography scale is defined in `app/globals.css` as CSS variables and mapped through `tailwind.config.ts` under `theme.extend.fontSize`. NEVER use ad-hoc font sizes.

| Level | Tailwind Class | CSS Variable | Value | Weight | Tracking | Usage |
|-------|----------------|--------------|-------|--------|----------|-------|
| Display | `text-5xl` to `text-7xl` | `--text-5xl`–`--text-7xl` | `3rem`–`4.5rem` | `font-bold` | `tracking-tight` | Hero titles (clamp override allowed) |
| Headline | `text-3xl` to `text-4xl` | `--text-3xl`–`--text-4xl` | `1.875rem`–`2.25rem` | `font-bold` | `tracking-tight` | Section titles, browse headers |
| Title | `text-xl` to `text-2xl` | `--text-xl`–`--text-2xl` | `1.25rem`–`1.5rem` | `font-semibold` | `tracking-normal` | Card titles, modal headers |
| Body | `text-sm` to `text-base` | `--text-sm`–`--text-base` | `0.75rem`–`0.875rem` | `font-medium` | `tracking-normal` | Descriptions, metadata, overviews |
| Label | `text-xs` | `--text-xs` | `0.625rem` | `font-semibold` | `tracking-wide` to `tracking-widest` | Badges, type labels, ratings |

**Font stack:** `var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` — declared in `app/globals.css` line 187 and consumed through Tailwind's `--font-sans` token.

### Focus Ring

The focus ring MUST be exactly:

```
focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black
```

**Source:** `components/features/media/card/media-card.tsx` line 101. The underlying token is `--ring: #0a84ff` (`app/globals.css` line 143). This is the ONLY permitted focus treatment for interactive cards, links, and buttons. Do not substitute arbitrary blue values.

### Radius Limits

Radius is stratified by surface type. Use the Tailwind custom radius tokens from `tailwind.config.ts` or the CSS variables from `app/globals.css`. NEVER invent radius values.

| Surface Type | Mobile Radius | Desktop Radius | CSS Variable | Example Usage |
|--------------|---------------|----------------|--------------|---------------|
| Cards | `rounded-xl` (`1rem`) | `rounded-2xl` (`1.25rem`) | `--radius-card` / `--radius-card-md` | `MediaCard`, row items |
| Heroes | `rounded-none` | `rounded-none` | N/A | Hero banners are full-bleed; no radius |
| Episode cards | `rounded-2xl` (`1.5rem`) | `rounded-3xl` (`1.875rem`) | `--radius-episode` / `--radius-episode-md` | Season episode thumbnails |
| Episode images | `rounded-lg` (`0.75rem`) | `rounded-xl` (`1rem`) | `--radius-episode-image` / `--radius-episode-image-md` | Inner episode images |
| UI controls | `rounded-md` (`0.5rem`) | `rounded-lg` (`0.625rem`) | `--radius-ui` / `--radius-ui-md` | Buttons, inputs, badges |
| Dialogs | `rounded-2xl` (`1rem`) | `rounded-3xl` (`1.25rem`) | `--radius-dialog` / `--radius-dialog-md` | Modals, sheets, command palette |
| Pills / tags | `rounded-full` | `rounded-full` | N/A | Genre tags, runtime badges |

**Enforcement:** `components/features/media/card/media-card.tsx` lines 111 and 135 use `rounded-xl md:rounded-2xl`. `components/features/media/details/detail-hero.tsx` uses full-bleed images with no radius.

### Section Spacing

Vertical rhythm between content rows MUST use one of these two patterns:

1. **Row stack gap:** `flex flex-col space-y-4 md:space-y-8` — observed in `app/page.tsx` line 57 and `app/movie/page.tsx` [verify]. This is the standard gap between `DataRow` sections on home, movie, and TV pages.
2. **Section wrapper padding:** `.section-spacing` class in `app/globals.css` lines 509–525 provides:
   - Mobile: `padding-top: 3rem; padding-bottom: 3rem`
   - Tablet (`md`): `padding-top: 4rem; padding-bottom: 4rem`
   - Desktop (`lg`): `padding-top: 5rem; padding-bottom: 5rem`

NEVER mix arbitrary margin values (e.g., `mt-10`, `mb-14`) outside these two systems.

### Motion Durations

All motion MUST use one of these canonical durations. Do not invent timing.

| Duration | Tailwind / Code | Usage |
|----------|-----------------|-------|
| `0.22s` | `BlurFade duration={0.22}` | Card image fade-in on viewport entry |
| `0.3s` | `duration-300`, `transition-duration: 300ms` | UI hover states, button scales, ring transitions |
| `0.5s`–`0.55s` | GSAP `duration: 0.55` | Card hover scale, overlay fade |
| `0.7s` | `duration-700` | Content opacity transitions |
| `1.0s` | `duration-1000` | Hero content slide-up reveals |
| `12.0s` | `duration-[12000ms]` | Ken Burns slow zoom on hero images |
| `16.0s` | GSAP `duration: 16` | Detail hero Ken Burns zoom |

**Easing curves:**
- `cubic-bezier(0.22, 1, 0.36, 1)` — cinematic fade (hero reveals, Ken Burns)
- `cubic-bezier(0.34, 1.56, 0.64, 1)` — spring bounce (button hovers)
- `power2.out` / `power3.out` / `power4.out` — GSAP hierarchy for staggered entrances
- `back.out(1.8)` — play-button pop-in on card hover

**Reduced motion:** `@media (prefers-reduced-motion: reduce)` in `app/globals.css` lines 345–366 forces `animation-duration: 0.01ms` and disables grain overlay and liquid-glass blur. All animations MUST respect this.

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

- `categoryMap` currently lives in `app/browse/[slug]/page.tsx` lines 15–61. This is a **violation** of this rule.
- The **target** location is `lib/routes/browse-categories.ts` (or equivalent), exported as a typed `Record<string, CategoryConfig>`.
- Any page that links to `/browse/[slug]` (e.g., `app/page.tsx`, `app/movie/page.tsx`, `app/tv/page.tsx`) MUST import slugs from that shared module, never hardcode them inline.
- Unknown slugs MUST call `notFound()` at the route boundary before any data fetch.

**Current supported slugs:**

| Slug | Endpoint | Type | Title |
|------|----------|------|-------|
| `binge-worthy-series` | `trending/tv/week` | `tv` | Binge-Worthy Series |
| `crowd-favorites-tv` | `tv/popular` | `tv` | Crowd Favorites |
| `critically-acclaimed-tv` | `tv/top_rated` | `tv` | Critically Acclaimed |
| `blockbuster-hits` | `trending/movie/week` | `movie` | Blockbuster Hits |
| `fresh-in-theaters` | `movie/now_playing` | `movie` | Fresh in Theaters |
| `cinema-hall-of-fame` | `movie/top_rated` | `movie` | Hall of Fame |

**Missing slugs (linked from home but not in `categoryMap`):**

| Slug | Endpoint | Type | Title | Location Linked |
|------|----------|------|-------|-----------------|
| `airing-this-week` | `tv/on_the_air` | `tv` | Airing This Week | `app/page.tsx` line 82 |
| `cult-classics-fan-favorites` | `movie/popular` | `movie` | Cult Classics & Fan Favorites | `app/page.tsx` line 118 |

**Action:** Add these two missing slugs to the shared module and ensure `categoryMap` is deleted from `app/browse/[slug]/page.tsx`.

**Source:** `app/browse/[slug]/page.tsx` lines 15–61; `app/page.tsx` lines 82, 118.

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

