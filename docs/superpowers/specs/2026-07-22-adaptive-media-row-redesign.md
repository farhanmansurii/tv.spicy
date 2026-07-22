# Adaptive Media Row Redesign

## Goal

Rebuild media rows as one responsive system with standard poster, landscape, and ranked presentations. Ranked numerals must remain visible, horizontal browsing must be obvious on touch devices, and all variants must share one card hierarchy.

Also move the Information Shelf into the active TV context: below the player and above season and episode selection. Without an active episode, `About this show` appears above the selector.

## Row Variants

- `poster`: compact discovery cards with 2.3–2.6 items visible on phones.
- `landscape`: wider artwork for editorial or progress-oriented collections.
- `ranked`: poster cards with a dedicated numeral column. The number is structural content, not positioned inside an overflowing image container. Rank 10 receives sufficient width and remains legible.

Existing `isVertical`, `ranked`, and `gridLayout` inputs remain compatible. Ranked rows always use poster artwork when available because the poster-plus-number composition is the stable ranked pattern.

## Card Anatomy

Every card contains artwork, title, and concise metadata. Year and score remain visible beneath artwork. Essential navigation never depends on hover. Pointer hover may add restrained image scale and tonal depth; press begins immediately with a subtle scale response.

Artwork uses one quiet vignette and a fine inner edge. Decorative play buttons and stacked glass overlays are removed from standard cards. Missing artwork renders a stable title fallback without changing card geometry.

## Ranked Composition

The rank numeral sits in a reserved left column behind and beside the poster. It uses outlined display typography with enough contrast against the page background. The poster overlaps the numeral slightly but never clips it. The accessible card name includes its rank while the decorative numeral remains hidden from assistive technology.

## Row Header and Navigation

The header uses a stronger title and an optional action group. `See all` becomes a compact 44px capsule. On phones, partial next-card visibility communicates horizontal navigation. Desktop arrow controls appear at row edges on hover or keyboard focus; touch layouts rely on direct dragging and do not cover artwork with permanent arrows.

Edge fades are subtle, pointer-transparent, and do not obscure the first or final item. Carousel dragging remains momentum-based and interruptible through the existing Embla integration.

## Responsive Sizing

- Poster: approximately 42% phone basis, then 1/3, 1/4, 1/5, and 1/6 across breakpoints.
- Landscape: approximately 78% phone basis, then 1/2, 1/3, and 1/4.
- Ranked: approximately 58% phone basis to preserve the numeral, then 1/3, 1/4, 1/5, and 1/6.
- Grid mode uses the same card component and metadata with responsive columns.

## Motion and Accessibility

- Default state changes use critically damped springs without decorative bounce.
- Image hover uses compositor-only transforms.
- Reduced Motion disables image scale, card movement, and animated navigation transitions.
- Reduced Transparency makes floating arrow controls near-solid and removes blur.
- Cards and row actions retain visible focus, descriptive labels, and minimum 44px targets.
- Ranked card labels expose rank and title.

## Information Shelf Ordering

For an active episode:

1. player;
2. Episode details shelf;
3. season selector and episode list.

Without an active episode:

1. About this show shelf;
2. season selector and episode list.

The same `detailsPanel` instance is rendered once; its position changes according to active-player state. Existing sticky-player behavior and spacing remain intact.

## Scope and Verification

No API, cache, route, provider, watchlist, or persistence behavior changes. Verify poster, landscape, ranked, grid, missing-image, long-title, ranks 1–10, touch drag, keyboard navigation, reduced motion, and reduced transparency. TypeScript, ESLint, and diff checks must pass.
