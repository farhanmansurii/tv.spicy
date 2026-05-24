# Spicy TV — Apple TV+ Design System

## Design Philosophy

Cinematic, immersive, and minimal. Every pixel serves the content. The UI disappears until the user needs it. Dark-first, OLED-optimized, with deep blacks and subtle luminance shifts.

## 1. Color & Atmosphere

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#050505` / `oklch(0.145 0 0)` | Page background, infinite black |
| Surface | `rgba(255,255,255,0.03-0.06)` | Cards, panels, buttons |
| Border | `rgba(255,255,255,0.06-0.10)` | Subtle separation |
| Text Primary | `rgba(255,255,255,0.90)` | Headlines, primary actions |
| Text Secondary | `rgba(255,255,255,0.50-0.70)` | Metadata, captions |
| Accent | `#ffffff` | Play buttons, active states |
| Star/Rating | `#facc15` | Ratings, highlights |

## 2. Typography

- **Font**: System UI stack (Inter on web, SF Pro on Apple devices)
- **Hero Title**: `clamp(3rem, 5vw, 5.5rem)`, weight 700, tracking tight
- **Logo Treatment**: Max-height `240px` on desktop, `200px` tablet, `140px` mobile
- **Section Headers**: `text-xs md:text-sm`, `uppercase`, `tracking-[0.12em]`, weight 700, color `white/70`
- **Metadata**: `text-xs md:text-sm`, weight 500, color `white/60`, pipe-separated
- **Body**: `text-base md:text-lg`, leading `[1.65]`, color `zinc-200/90`

## 3. Spacing Architecture

- **Hero Height**: `75vh` mobile, `85vh` tablet, `90vh` desktop
- **Section Padding**: `py-3 md:py-5` between content rows
- **Card Gap**: `gap-2.5` vertical, `pl-3 md:pl-5` horizontal carousel spacing
- **Hero Content Padding**: `pb-10 md:pb-20 lg:pb-24`
- **Container**: `max-w-7xl`, `px-4 sm:px-6 lg:px-8`

## 4. Hero Architecture

### Layout
- Full-bleed cinematic background image
- Ken Burns effect: `scale(1.06)` over `10s` on active slide
- Multi-layer gradient stack:
  1. Bottom scrim: `from-background via-background/70 via-[25%] to-transparent`
  2. Left vignette: `from-background/95 via-background/30 to-transparent`
  3. Top fade: `from-background/60 via-transparent to-transparent`
  4. Radial darkening: `radial-gradient(circle_at_50%_60%, transparent_10%, rgba(0,0,0,0.5)_100%)`

### Content Hierarchy
1. Metadata row (type | genres | year | runtime | rating | score)
2. Logo or Title (massive, max-width constrained)
3. Tagline or overview excerpt (when no logo)
4. Status pill (for returning series)
5. Action bar (Play + Watchlist)

### Transitions
- Image load: opacity `0 -> 100` over `700ms`
- Content reveal: `translate-y-6 -> 0`, opacity `0 -> 1`, duration `1000ms`
- Crossfade between slides: `700ms` opacity transition

## 5. Content Rows (Carousels)

### Section Headers
- Small, uppercase, wide letter-spacing
- No decorative icons or badges
- Clean left-alignment

### Cards
- Border radius: `rounded-xl md:rounded-2xl`
- Aspect ratios: `aspect-video` (landscape), `aspect-[2/3]` (portrait)
- Border: `ring-1 ring-inset ring-white/[0.05]`
- Hover: `scale-105`, deeper shadow, brighter image, title overlay fade-in
- Play button: `14x14` white circle, black icon, appears centered on hover

### Carousel Behavior
- Drag-free scrolling with `trimSnaps`
- Edge gradient fades: `from-background to-transparent`
- Navigation arrows: appear on hover, `bg-black/60`, `backdrop-blur-md`
- Card peek: `basis-[82%]` mobile, `basis-1/4` desktop

## 6. Detail Page

### Hero
- Same hero component as home, with `isDetailsPage={true}`
- Taller content overlap: `-mt-6 md:-mt-10` on content container
- Content bleeds directly into hero gradient

### Content Panels
- Glassmorphism: `bg-zinc-950/60 backdrop-blur-xl`
- Border radius: `rounded-2xl md:rounded-3xl`
- Border: `border-white/[0.08]`
- Shadow: `shadow-[0_8px_32px_rgba(0,0,0,0.25)]`
- Padding: `p-4 md:p-6 lg:p-8`

### Metadata Pills
- `rounded-full`, `border-white/10`, `bg-white/[0.04]`
- `px-3 py-1.5`, `text-xs`, color `zinc-300/90`

## 7. Header / Navigation

- Transparent at page top: `bg-transparent`
- Glassmorphism on scroll: `bg-background/70 backdrop-blur-2xl`
- Transition: `500ms` ease
- Height: `52px` mobile, `56px` desktop
- No bottom border until scrolled

## 8. Buttons & Actions

### Primary (Play)
- `bg-white text-black`
- Height: `h-11 md:h-12`
- Padding: `px-5 md:px-6`
- Font: `font-semibold text-sm`
- Hover: `hover:bg-white/90`
- Active: `active:scale-[0.98]`

### Secondary (Icon)
- `h-11 w-11 md:h-12 md:w-12 rounded-full`
- `bg-white/10 border border-white/15`
- Hover: `hover:bg-white/20`
- Backdrop blur for glass effect

## 9. Progress Indicators

### Hero Carousel
- Segmented bars at bottom center
- Active segment: `w-8 md:w-12`, fills with white over time
- Inactive: `w-4 md:w-6 bg-white/10`
- Smooth width animation synced to autoplay

### Continue Watching
- Thin bar at bottom of thumbnail: `h-[3px]`
- Background: `bg-white/15`
- Fill: `bg-white rounded-full`

## 10. Animation Principles

- **Durations**: `200ms` micro-interactions, `300-500ms` hovers, `700-1000ms` reveals
- **Easing**: `cubic-bezier(0.2, 0.8, 0.2, 1)` for entrances, `ease-out` for exits
- **Transform-based**: Use `transform` and `opacity` only for 60fps performance
- **Will-change**: Apply sparingly to hero images and carousel items

## 11. Banned Patterns

- No section numbering ("SECTION 01", "QUESTION 05")
- No emoji in UI
- No arbitrary floating badges or stamps on hero text
- No narrow text containers causing 4+ line headlines
- No visible scrollbars (hide globally, custom scrollbar for specific containers only)
- No flat backgrounds on cards (always subtle depth)
- No more than 2 info/action buttons in hero action bar
