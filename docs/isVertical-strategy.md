# `isVertical` Strategy Documentation

## Overview

The `isVertical` prop controls the orientation and layout of media cards in rows across different pages. This document outlines the strategy and implementation for each page.

## Component Hierarchy

```
Page Component
  └─> HomeRow / FetchAndRenderRow / WatchList / RecentlyWatched
        └─> MediaRow
              └─> MediaCard
```

## Strategy by Page

### 1. Home Page (`/`)

**Component Used:** `HomeRow`

**Strategy:**
- `isVertical` is **NOT explicitly passed** (defaults to `undefined`)
- Uses **responsive behavior** based on device type
- **Mobile**: Portrait cards (poster_path required)
- **Desktop**: Landscape cards (backdrop_path required)

**Implementation:**
```tsx
// app/page.tsx
<HomeRow
  endpoint="trending/tv/week"
  text="Binge-Worthy Series"
  type="tv"
  // isVertical is undefined - responsive mode
/>
```

**MediaRow Logic:**
```tsx
// When isVertical === undefined
return isMobile ? !!show.poster_path : !!show.backdrop_path;
```

**Result:**
- ✅ Adaptive layout based on screen size
- ✅ Optimized for mobile (portrait) and desktop (landscape)
- ✅ Better UX across devices

---

### 2. TV Page (`/tv`)

**Component Used:** `FetchAndRenderRow`

**Strategy:**
- `isVertical` defaults to **`undefined`** (responsive behavior)
- **Mobile**: Portrait cards (poster_path required)
- **Desktop**: Landscape cards (backdrop_path required)

**Implementation:**
```tsx
// app/tv/page.tsx
<FetchAndRenderRow
  apiEndpoint="trending/tv/week"
  text="Top TV Shows"
  type="tv"
  // isVertical defaults to undefined in FetchAndRenderRow (responsive)
/>
```

**FetchAndRenderRow Default:**
```tsx
// components/features/media/row/fetch-and-render-row.tsx
isVertical = undefined,  // Responsive: vertical on mobile, landscape on desktop
```

**MediaRow Logic:**
```tsx
// When isVertical === undefined
return isMobile ? !!show.poster_path : !!show.backdrop_path;
```

**Result:**
- ✅ Vertical (portrait) layout on mobile for better UX
- ✅ Landscape layout on desktop for cinematic feel
- ✅ Optimized for each device type

---

### 3. Movies Page (`/movies`)

**Component Used:** `FetchAndRenderRow`

**Strategy:**
- `isVertical` defaults to **`undefined`** (responsive behavior)
- **Mobile**: Portrait cards (poster_path required)
- **Desktop**: Landscape cards (backdrop_path required)

**Implementation:**
```tsx
// app/movie/page.tsx
<FetchAndRenderRow
  apiEndpoint="trending/movie/week"
  text="Top Movies"
  type="movie"
  // isVertical defaults to undefined in FetchAndRenderRow (responsive)
/>
```

**Result:**
- ✅ Vertical (portrait) layout on mobile for better UX
- ✅ Landscape layout on desktop for cinematic feel
- ✅ Optimized for each device type

---

### 4. WatchList Component

**Component Used:** `MediaRow` (direct)

**Strategy:**
- `isVertical` is **explicitly set to `false`**
- Always uses **landscape/horizontal** layout
- Requires `backdrop_path` for all items

**Implementation:**
```tsx
// components/features/watchlist/watch-list.tsx
<MediaRow
  isVertical={false}  // Explicitly set
  text="My Movies"
  shows={filteredMovieWatchlist}
  type="movie"
/>
```

**Result:**
- ✅ Consistent with other rows on the page
- ✅ Better visual hierarchy
- ✅ Matches user expectations

---

### 5. RecentlyWatched Component

**Component Used:** `MediaRow` (direct)

**Strategy:**
- `isVertical` is **explicitly set to `false`**
- Always uses **landscape/horizontal** layout
- Uses `still_path` (episode stills) as `backdrop_path`

**Implementation:**
```tsx
// components/features/watchlist/recently-watched.tsx
<MediaRow
  isVertical={false}  // Explicitly set
  text="Continue Watching"
  shows={shows}
  type="tv"
/>
```

**Result:**
- ✅ Consistent with other rows
- ✅ Episode stills work well in landscape format
- ✅ Better continuation of viewing experience

---

## MediaRow Component Logic

### Filtering Logic:

```tsx
const validShows = useMemo(() => {
  return shows?.filter((show: Show) => {
    if (isVertical === true) return !!show.poster_path;      // Portrait: require poster
    if (isVertical === false) return !!show.backdrop_path;   // Landscape: require backdrop
    // Responsive (undefined): mobile=poster (vertical), desktop=backdrop (landscape)
    return isMobile ? !!show.poster_path : !!show.backdrop_path;
  }) || [];
}, [shows, isMobile, isVertical]);

// Determine effective vertical state: default to vertical on mobile when undefined
const effectiveIsVertical = isVertical === undefined ? isMobile : isVertical;
```

### Layout Logic:

```tsx
// Desktop: Grid layout (when isVertical === true)
{isVertical && !isMobile ? (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
    {/* Portrait cards in grid */}
  </div>
) : (
  // Mobile/Desktop: Carousel layout
  <Carousel>
    {/* Landscape or portrait cards in carousel */}
  </Carousel>
)}
```

### Card Sizing in Carousel:

```tsx
// Landscape cards (isVertical === false)
'basis-[82%] sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4'

// Portrait cards (isVertical === true or undefined on mobile)
'basis-[44%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6'
```

---

## Summary Table

| Page/Component | Component | `isVertical` Value | Layout | Image Type Required |
|---------------|-----------|-------------------|--------|-------------------|
| **Home (`/`)** | `HomeRow` | `undefined` | **Responsive** | Mobile: `poster_path`<br>Desktop: `backdrop_path` |
| **TV (`/tv`)** | `FetchAndRenderRow` | `undefined` (default) | **Responsive** | Mobile: `poster_path`<br>Desktop: `backdrop_path` |
| **Movies (`/movies`)** | `FetchAndRenderRow` | `undefined` (default) | **Responsive** | Mobile: `poster_path`<br>Desktop: `backdrop_path` |
| **WatchList** | `MediaRow` | `false` (explicit) | **Landscape** | `backdrop_path` |
| **RecentlyWatched** | `MediaRow` | `false` (explicit) | **Landscape** | `backdrop_path` (from `still_path`) |

---

## Design Rationale

### Home Page (`undefined` = Responsive)
- **Why:** Home page is the entry point, needs to work well on all devices
- **Benefit:** Optimized experience for both mobile and desktop users
- **Trade-off:** Requires both poster and backdrop images in data

### TV/Movies Pages (`undefined` = Responsive)
- **Why:** Mobile-first approach - vertical cards work better on small screens
- **Benefit:** Better mobile UX with portrait cards, landscape on desktop for cinematic feel
- **Trade-off:** Requires both poster and backdrop images in data

### WatchList/RecentlyWatched (`false` = Landscape)
- **Why:** User collections benefit from landscape format for better content visibility
- **Benefit:** More content visible at once, better for scanning user's collection
- **Trade-off:** Less mobile-optimized, but acceptable for user-specific content

---

## Best Practices

1. **Home Page**: Use `undefined` for responsive behavior
2. **Dedicated Pages (TV/Movies)**: Use `undefined` for responsive behavior (vertical on mobile, landscape on desktop)
3. **User Collections (WatchList/RecentlyWatched)**: Use `false` for landscape layout (better for scanning collections)
4. **Mobile-First**: Default to vertical (portrait) on mobile for better UX
5. **Data Requirements**: Ensure API returns both poster_path and backdrop_path for responsive layouts
6. **Explicit Override**: Only set `isVertical={false}` when you specifically need landscape layout on all devices

---

## Future Considerations

- Consider making `isVertical` responsive by default in `MediaRow`
- Add prop to override responsive behavior when needed
- Consider A/B testing different strategies for engagement
- Monitor performance impact of different layouts

---

## Related Files

- `components/features/media/row/media-row.tsx` - Main row component
- `components/features/media/row/home-row.tsx` - Home page row wrapper
- `components/features/media/row/fetch-and-render-row.tsx` - TV/Movies page row wrapper
- `components/features/media/card/media-card.tsx` - Individual card component
- `app/page.tsx` - Home page
- `app/tv/page.tsx` - TV page
- `app/movie/page.tsx` - Movies page

---

**Last Updated:** 2024
**Maintained By:** Development Team

