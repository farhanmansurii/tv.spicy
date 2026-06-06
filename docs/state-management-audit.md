# State Management Audit

## Architecture Overview

The app uses Zustand for client state, React Query for server state, and Better Auth for session management. Local-first data (watchlist, favorites, continue-watching) is persisted to localStorage via Zustand's `persist` middleware and synced to a PostgreSQL DB in the background.

---

## Stores

### `authStore.ts` — GOOD
- No persistence (correct: session lives in HTTP-only cookie)
- All state is denormalized duplicates of `session.user` — manageable but could use computed properties

### `watchlistStore.ts` — FIXED
- `partialize` now only persists data arrays
- `loadFromDatabase()` now merges DB into local instead of overwriting
- **Remaining issue**: `invalidateUserQueries` called on every add/remove — unnecessary overhead

### `favoritesStore.ts` — FIXED
- Same fixes as watchlist
- **Critical issue**: `convertToLocalFormat` strips all metadata except `id` and `media_type`. Favorites loaded from DB lose poster/title data, forcing components to re-fetch from TMDB.

### `recentsStore.ts` — MOSTLY GOOD
- Proper `partialize` and merge logic
- **Issue**: `loadFromDatabase()` calls `/api/sync` POST after loading — redundant write path

### `episodeStore.ts` — FINE
- No persistence needed, simple ephemeral state

### `mediaInfoPanelStore.ts` — FINE
- `openTick` is a render-forcing hack but works

### `mediaQueryStore.ts` — WORKS BUT ODD
- `init()` is called from `tanstack-query-provider.tsx` — not its natural home
- `useMediaQuery()` exists alongside duplicate `useIsMobile()` hook

### `playerPrefsStore.ts` / `providerStore.ts` — FINE
- Simple persisted preferences

### `searchStore.ts` (recentsSearchStore.ts) — FINE
- Persists recent searches to localStorage

### `searchStore.ts` (query store) — FINE
- Simple ephemeral search state

---

## Hooks

### `use-auth.ts` — BUG: UNSTABLE MEMO
- `useMemo` depends on `session` which is a new object reference on every `useSession` re-render
- Defeats the purpose of stable selectors below it
- **Fix**: remove `session` from memo, read from Zustand store instead

### `use-database-sync.ts` — DEAD CODE
- Never imported anywhere
- Fetches the same data AuthSync already loads into stores
- **Fix**: remove or repurpose to read from stores

### `use-session-store.ts` — GOOD PATTERN
- Individual selector hooks are the correct Zustand consumption pattern
- Components should prefer `useUserId()` / `useIsAuthenticated()` over `useSessionStore()`

### `use-sync.ts` — FINE
- Simple wrapper around `syncLocalToDatabase`

### `use-personalized-greeting.ts` — OVERENGINEERED
- `hasRotatedRef` + `hasRotated` state are redundant
- `intervalRef` stores a timeout but is named like an interval
- **Fix**: simplify to one `useState` + one `useEffect`

### `use-has-mounted.ts` — FINE

### `use-haptics.ts` — FINE
- Lazy import, cleanup

### `use-reduced-motion.ts` — FINE

### `use-toast.ts` — STANDARD (shadcn)

### `use-mobile.ts` — DUPLICATE
- Same purpose as `useMediaQuery()` from `mediaQueryStore.ts`
- Uses `window.innerWidth` instead of `e.matches` from media query event
- **Fix**: consolidate or remove

---

## Critical Component Issues

### `continue-watching-button.tsx`
- Calls `useTVShowStore().initialize()` on every mount — redundant API call
- Uses full store destructuring: `const { recentlyWatched, initialize } = useTVShowStore()` — subscribes to ALL state changes

### `watch-list.tsx`
- Calls `initialize()` + shows `MediaLoader` skeleton while loading
- Since AuthSync already initializes, this just shows an unnecessary skeleton

### `recently-watched.tsx`
- Calls `initialize()` + shows `MediaLoader` skeleton
- Same problem as watch-list

### `my-favorites.tsx`
- Calls `initialize()` AND uses `useUserFavorites()` React Query hooks
- Then fetches TMDB details for EVERY favorite item — N+1 API storm
- Shows spinner while doing all of this

### `profile-page-client.tsx`
- Calls `initializeContinueWatching()`
- Uses React Query hooks `useUserWatchlist` / `useUserFavorites`
- Then fetches TMDB details for every item — massive overfetching

---

## Recommended Patterns (Industry Best Practice)

### 1. Store Selectors (Zustand)
**Bad:**
```ts
const { watchlist, isLoading } = useWatchListStore()
```
**Good:**
```ts
const watchlist = useWatchListStore((s) => s.watchlist)
```
This prevents re-renders when `isLoading` or other unrelated fields change.

### 2. Single Source of Truth for Synced Data
**Bad:**
- AuthSync loads data into Zustand
- Components ALSO call React Query for the same data
- Components fetch TMDB details redundantly

**Good:**
- AuthSync is the ONLY place that fetches DB data
- Components read from Zustand stores directly
- Rich metadata (posters, titles) is preserved in store items so no TMDB re-fetch needed

### 3. Local-First Architecture
**Bad:**
- Show spinners while DB syncs
- Overwrite local with DB data

**Good:**
- Render local data immediately
- Merge DB data invisibly in background
- Never block UI on network

### 4. Initialize Once, Globally
**Bad:**
- Every component that needs data calls `initialize()`
- Race conditions, redundant API calls

**Good:**
- One global sync component (`AuthSync`) handles all store hydration
- Components just read from stores

---

## Action Items

1. [x] Fix `watchlistStore.ts` — merge instead of overwrite, proper `partialize`
2. [x] Fix `favoritesStore.ts` — same
3. [x] Fix `AuthSync` — single session sync with user ID tracking
4. [ ] Fix `use-auth.ts` — stable memo
5. [ ] Remove redundant `initialize()` calls from components
6. [ ] Fix `my-favorites.tsx` — stop N+1 TMDB fetching
7. [ ] Fix `profile-page-client.tsx` — stop redundant fetching
8. [ ] Consolidate `useIsMobile` / `useMediaQuery`
9. [ ] Simplify `use-personalized-greeting`
