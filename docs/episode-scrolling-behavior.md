# Episode Clicking and Scrolling Behavior

## All Scrolling Possibilities When Clicking an Episode

### 1. **From Continue Watching Card** (`continue-watching-card.tsx`)
- **Context**: Homepage or any page with "Continue Watching" section
- **Action**: Uses Next.js `Link` to navigate to `/tv/{showId}?season={season}&episode={episode}`
- **Scrolling Behavior**:
  - ❌ No explicit scroll behavior
  - Relies on page navigation and subsequent scroll handlers
- **Issues**:
  - Page navigation triggers `media-details.tsx` scroll-to-top
  - Then `season-tabs.tsx` tries to scroll to player
  - These may conflict or happen in wrong order

### 2. **From Season Tabs - Direct Episode Click** (`season-tabs.tsx`)
- **Context**: Already on details page, clicking episode in grid/list/carousel view
- **Action**: `onEpisodeClick` callback (line 78-90)
- **Scrolling Behaviors**:
  - ✅ **Scroll to Player** (line 82-84): `playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })`
  - ✅ **Scroll Active Episode into View** (line 145-159): `activeEpisodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })` with 100ms delay
- **Issues**:
  - Two scrolls happen: one to player (immediate), one to episode card (100ms delay)
  - May conflict or cause jarring UX
  - Different behavior in grid vs list vs carousel views

### 3. **From Media Details Page Navigation** (`media-details.tsx`)
- **Context**: Navigating to any details page
- **Action**: `useEffect` on pathname change (line 18-21)
- **Scrolling Behavior**:
  - ✅ **Scroll to Top**: `window.scrollTo({ top: 0, behavior: 'smooth' })`
- **Issues**:
  - Always scrolls to top, even when coming from Continue Watching
  - May interfere with episode-specific scrolling

### 4. **From Continue Watching Button** (`continue-watching-button.tsx`)
- **Context**: Hero banner or details page "Play/Resume" button
- **Action**: `handlePlay` callback (line 206-232)
- **Scrolling Behavior**:
  - ❌ No explicit scroll behavior
  - Uses `router.push` to navigate
- **Issues**:
  - Same as Continue Watching Card - relies on subsequent handlers

### 5. **From URL Parameters (Initial Load)**
- **Context**: Page loads with `?season=X&episode=Y` in URL
- **Action**: `useEffect` in `season-tabs.tsx` (line 54-66)
- **Scrolling Behavior**:
  - ✅ **Scroll Active Episode into View** (line 145-159): Only if episode is already active
- **Issues**:
  - May not scroll if episode isn't loaded yet
  - No scroll to player on initial load

## Current Problems

1. **Conflicting Scrolls**: Multiple scroll behaviors happen simultaneously or in wrong order
2. **Timing Issues**: 100ms delay for episode scroll may be too short or too long
3. **View Mode Differences**: Grid/list/carousel may have different scroll behavior
4. **Navigation Conflicts**: Page scroll-to-top conflicts with episode-specific scrolling
5. **Initial Load**: Episodes loaded from URL params may not scroll properly
6. **Continue Watching**: No scroll behavior when navigating from Continue Watching cards

## Recommended Solutions

1. **Prioritize Scroll Target**: Decide what should scroll first (player vs episode card)
2. **Unified Scroll Handler**: Create a single scroll handler that coordinates all scrolls
3. **Context-Aware Scrolling**: Different scroll behavior based on where user came from
4. **Debounce/Queue Scrolls**: Prevent multiple scrolls from conflicting
5. **Better Timing**: Adjust delays and ensure DOM is ready before scrolling
6. **View Mode Handling**: Ensure scroll works correctly in all view modes (grid/list/carousel)
