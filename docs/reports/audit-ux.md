# UX Flow Audit Report: tv.spicy

**Target Worktree:** `/Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux`  
**Scope:** End-to-end user flows, state transitions, feedback latency, navigation structure, and microcopy.  
**Auditor:** UX Flow Scout  

---

## 1. Flow Walkthroughs

### Flow 1: First Visit to Sign-In, Failures, and Abandonment

* **Entry Points:**
  * Desktop header user avatar button ([`components/auth/auth-button.tsx:54-77`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/auth/auth-button.tsx#L54-L77)).
  * Mobile header profile icon link ([`components/layout/header/header.tsx:192-197`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/layout/header/header.tsx#L192-L197)).
  * Route proxy bounce when accessing protected routes `/profile` or `/library` ([`proxy.ts:88-92`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/proxy.ts#L88-L92)).
* **Decision Points:**
  * Sign in via email and password vs. "Continue with Google".
* **Dead Ends:**
  * Full-screen takeover ([`components/ui/sign-in.tsx:70`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/ui/sign-in.tsx#L70)) contains no "Back", "Cancel", or "Return to Home" button. If the user decides to abandon sign-in, they are trapped unless they recognize the site header behind/above the overlay or hit the browser back button.
  * No account registration / Sign Up flow exists anywhere in the UI. If a user does not yet have an account, there is no link or button to create one. Submitting their credentials simply returns an authentication failure.
  * No "Forgot Password" or recovery link exists.
  * The error page ([`app/auth/error/page.tsx:29-31`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/auth/error/page.tsx#L29-L31)) only features a "Try Again" button that routes back to `/auth/signin`. There is no link back to the homepage.
* **Moments Where App Gives No Feedback:**
  * Submitting an invalid email/password displays a floating toast in Sonner ([`app/auth/signin/page.tsx:62`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/auth/signin/page.tsx#L62)), but the inline error box ([`components/ui/sign-in.tsx:78-82`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/ui/sign-in.tsx#L78-L82)) remains hidden because it only reads URL query params (`?error=`), not form submission state. The input fields receive no error outlines or inline validation text.
* **Actions with No Undo:**
  * Abandoning midway loses input field contents with no auto-save or draft state.
* **State Appearing to Succeed but Does Not:**
  * Clicking the desktop avatar button calls `router.push('/auth/signin')` ([`components/auth/auth-button.tsx:55`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/auth/auth-button.tsx#L55)) without passing `callbackUrl`. Upon successful sign-in, `safeCallbackUrl` falls back to `'/'` ([`app/auth/signin/page.tsx:25`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/auth/signin/page.tsx#L25)), dumping the user at the homepage and losing their place.
* **Refresh Requirements:**
  * None; sign-in triggers `router.push(callbackUrl)` and `router.refresh()`.

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. Click user button in header | [`components/auth/auth-button.tsx:55`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/auth/auth-button.tsx#L55) | Navigates to `/auth/signin` via `router.push('/auth/signin')`. | No visible text label on desktop (icon only). Does not preserve current page in `callbackUrl`. |
| 2. Click profile on mobile | [`components/layout/header/header.tsx:193`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/layout/header/header.tsx#L193) | Navigates to `/auth/signin` via link. | `aria-label` announces "Profile" to screen readers even though the user is logged out and the destination is sign-in. |
| 3. View sign-in screen | [`components/ui/sign-in.tsx:70-145`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/ui/sign-in.tsx#L70-L145) | Renders viewport-filling form (`100dvh`, `100dvw`) with email, password, and Google auth. | No cancel, close, or home button. No "Sign Up" option for new users. No "Forgot Password" link. |
| 4. Submit invalid credentials | [`app/auth/signin/page.tsx:61-63`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/auth/signin/page.tsx#L61-L63) | Calls `signIn.email` and fires `toast.error(result.error.message)`. | Inline form error banner is not displayed; error is isolated in an ephemeral toast in the corner. Form inputs show no error state. |
| 5. Encounter OAuth failure | [`app/auth/error/page.tsx:22-35`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/auth/error/page.tsx#L22-L35) | Renders `AuthErrorPage` with error message and "Try Again". | Dead end: "Try Again" loops back to `/auth/signin`. No option to cancel and return home. |
| 6. Successful login | [`app/auth/signin/page.tsx:64-67`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/auth/signin/page.tsx#L64-L67) | Shows success toast, navigates to `callbackUrl`, and refreshes. | Since `callbackUrl` was not set by the header trigger, user is always redirected to `/` instead of where they were browsing. |

---

### Flow 2: Land on Home -> Browse Rows -> Open a Title

* **Entry Points:**
  * Visit `/` directly.
* **Visible vs. Scrolled Content:**
  * *Visible above the fold:* Fixed header, Hero carousel occupying `62dvh` to `72dvh` (`min-h-[430px]`, `max-h-[760px]` via [`components/features/media/hero-height.ts:6-7`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/hero-height.ts#L6-L7)). The hero banner shows title logo/text, metadata, and buttons.
  * *Must be scrolled:* ALL content rows (Continue Watching, Popular Tonight, Saved rows, Binge-worthy Series, etc.) are below the viewport fold. The user must scroll past the hero banner to see any catalogue rows.
* **First Meaningful Action:**
  * Clicking "Play" / "Start Watching" on the featured hero title ([`components/features/watchlist/continue-watching-button.tsx:276-293`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-button.tsx#L276-L293)), or scrolling down to inspect content rows.
* **Decision Points:**
  * Clicking primary "Play" on hero vs. secondary "More Info" icon.
  * Scrolling rows horizontally vs. clicking row title / "View All" link to view the category grid.
* **Dead Ends:**
  * Clicking "Play" on a movie in the hero does not start playback. It navigates to `/movie/[id]` ([`continue-watching-button.tsx:215`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-button.tsx#L215)). On the movie detail page, the hero also has a "Play" button ([`components/features/media/details/detail-hero.tsx:133`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/details/detail-hero.tsx#L133)), which merely scrolls down to `#media-player` where the user must click play a third time.
  * Clicking "More Info" ([`continue-watching-button.tsx:224-228`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-button.tsx#L224-L228)) navigates to the exact same URL (`/movie/[id]`) as clicking "Play".
* **Moments Where App Gives No Feedback:**
  * Clicking a card in `DataRow` ([`components/features/media/card/media-card.tsx:42-48`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/card/media-card.tsx#L42-L48)) uses `prefetch={false}`. There is no active loading indicator or transition bar between click and navigation payload arrival.
* **Actions with No Undo:**
  * N/A (browsing is read-only).
* **State Appearing to Succeed but Does Not:**
  * N/A.
* **Refresh Requirements:**
  * None.

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. Initial page render | [`app/page.tsx:55-66`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/page.tsx#L55-L66) | Hero carousel renders at 62–72dvh height. | Rows are entirely pushed below the fold; user cannot tell content rows exist without scrolling. |
| 2. Interact with hero CTA | [`components/features/watchlist/continue-watching-button.tsx:215`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-button.tsx#L215) | Clicking "Play" on a movie hero navigates to `/movie/[id]`. | "Play" acts as "More Info", routing to detail page rather than streaming immediately. Both "Play" and "More Info" execute identical navigation. |
| 3. Scroll down to browse rows | [`app/page.tsx:68-144`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/page.tsx#L68-L144) | Intersects rows wrapped in Suspense and Tanstack Query. | Multiple staggered skeleton loaders appear sequentially as user scrolls down. |
| 4. Click a media card | [`components/features/media/card/media-card.tsx:42-47`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/card/media-card.tsx#L42-L47) | Card triggers Next.js navigation with `prefetch={false}`. | No transition indicator between click and page transition; latency is perceived as an unresponsive tap. |

---

### Flow 3: Detail -> Play -> Leave Mid-way -> Continue Watching Resume

* **Entry Points:**
  * Detail page (`/movie/[id]` or `/tv/[id]`).
* **Steps & Resume Mechanism:**
  * For movies: Detail page renders `<DetailHero>` and `<ShowContainer>`. The player is placed below `<InfoPanelSection>` ([`components/features/media/details/show-container.tsx:117-123`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/details/show-container.tsx#L117-L123)). Clicking "Play" smooth-scrolls to the embedded iframe.
  * For TV: Clicking "Choose Episode" scrolls to `#episodes-section` ([`components/features/media/details/detail-hero.tsx:156-159`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/details/detail-hero.tsx#L156-L159)). Clicking an episode card sets `activeEP` and mounts `<TVContainer>`.
  * Progress Tracking: Handled by `usePlaybackProgress` ([`components/features/media/episode/use-playback-progress.ts:77-181`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/use-playback-progress.ts#L77-L181)).
    * If provider supports postMessage (e.g., Vidfast, Vidlink, CineSrc), updates store on `timeupdate`.
    * If provider has no postMessage (e.g., VidZee, EmbedMaster, VidEasy), it attempts wall-clock fallback ([`use-playback-progress.ts:141-166`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/use-playback-progress.ts#L141-L166)), but silently bails out if `durationSeconds` is missing from the item ([`use-playback-progress.ts:145-146`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/use-playback-progress.ts#L145-L146)). Zero progress is recorded.
  * Finding it later in Continue Watching: Appears in `RecentlyWatched` row on Home or Library.
  * Clicking Continue Watching card ([`components/features/watchlist/continue-watching-card.tsx:22-25`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-card.tsx#L22-L25)) navigates to `/movie/[id]` or `/tv/[id]?season=X&episode=Y`.
  * **Does resume actually resume at the right position?**
    * **No, it does NOT resume automatically.** `activeResumeSeconds` starts at `0` ([`components/features/media/episode/episode.tsx:57`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L57)). The iframe loads from time 0:00.
    * The user must notice and click the small "Resume MM:SS" chip in `PlayerControls` ([`components/features/media/episode/player-controls.tsx:42-65`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/player-controls.tsx#L42-L65)).
    * Clicking Resume remounts the iframe with a URL query param (`?t=` or `?startAt=`).
    * If the selected provider does not support query resume (e.g., `vidking`, `embedmaster`, `videasy` in [`components/features/media/episode/providers/registry.ts`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/providers/registry.ts)), the URL builder appends nothing ([`url-builders.ts:81-83`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/providers/url-builders.ts#L81-L83)). Clicking Resume simply restarts playback from 0:00!
* **Decision Points:**
  * Noticing the Resume chip vs. watching from the start.
* **Dead Ends:**
  * On providers without resume support, clicking the Resume chip reloads the iframe back to 0:00 with no warning that the provider cannot seek.
* **Moments Where App Gives No Feedback:**
  * When watching on a provider without postMessage, leaving midway does not record any progress if duration was unset; the item either does not update or stays at 0%.
* **Actions with No Undo:**
  * Clicking "Start over" on a Continue Watching card ([`continue-watching-card.tsx:54-58`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-card.tsx#L54-L58)) immediately resets time watched to 0 with no confirmation and no undo toast.
* **State Appearing to Succeed but Does Not:**
  * The Resume chip appears on screen even when the current provider has `hasResume: false`, giving the illusion that seeking will occur.

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. Click "Play" on Movie detail | [`components/features/media/details/detail-hero.tsx:160`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/details/detail-hero.tsx#L160) | Scrolls page to `#media-player`. | Video is placed beneath the full storyline and cast details; page scrolls rather than playing in place. |
| 2. Play video in iframe | [`components/features/media/episode/episode.tsx:206-216`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L206-L216) | Third-party iframe mounts and streams video. | If provider has no postMessage API and no prior duration, progress tracking bails silently. |
| 3. Navigate away midway | [`components/features/media/episode/use-playback-progress.ts:58-75`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/use-playback-progress.ts#L58-L75) | `pagehide` and `visibilitychange` flush progress to store. | Flushes asynchronously; if network drops or tab crashes, last position is lost. |
| 4. Return via Continue Watching | [`components/features/watchlist/continue-watching-card.tsx:22-25`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-card.tsx#L22-L25) | Clicking card navigates to `/movie/[id]` or `/tv/[id]?season=X&episode=Y`. | For movies, lands back at top of hero, not at player. For TV, causes dynamic layout shift when episode mounts. |
| 5. Player loads | [`components/features/media/episode/episode.tsx:57, 119`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L57) | Player initializes with `activeResumeSeconds: 0`. Video starts from beginning. | Does NOT auto-resume. Requires finding and clicking the "Resume MM:SS" chip. |
| 6. Click Resume chip | [`components/features/media/episode/player-controls.tsx:42-65`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/player-controls.tsx#L42-L65) | Re-renders iframe with resume timestamp parameter. | Fails silently on providers that lack query resume support (Vidking, EmbedMaster, VidEasy), reloading to 0:00. |

---

### Flow 4: Search

* **Entry Points:**
  * Header search icon trigger ([`components/layout/header/header.tsx:189`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/layout/header/header.tsx#L189) and desktop action).
  * Direct URL `/search`.
* **Typing & Suggestions:**
  * Auto-focuses search input on mount ([`app/search/page.tsx:268-271`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L268-L271)).
  * Debounces query by 400ms ([`app/search/page.tsx:289-296`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L289-L296)).
  * Query only enables if `query.length >= 2` ([`app/search/page.tsx:302`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L302)).
  * **No live suggestions or auto-complete exist.** Typing does not show autocomplete suggestions; it only triggers a full search grid once 2+ characters are reached. Typing 1 character produces zero feedback or guidance.
* **Empty Result & Nonsense Query:**
  * If a query returns no results (e.g. "xzxzxzxz"), renders `<EmptyResults>` ([`app/search/page.tsx:176-190`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L176-L190)): "No results for '...'. Try a different search term or check your spelling."
  * This is a complete dead end: no trending recommendations, no "browse popular" link, no clear CTA.
  * **Critical Bug on API / Network Error:** If the search API fails or throws a network error, `searchData` is undefined, `results` is `[]`, and `isFetching` becomes false. The page renders `<EmptyResults>` ([`app/search/page.tsx:340`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L340)), falsely reporting that the user's query yielded zero results instead of surfacing a network error!
* **Clearing History:**
  * Individual remove button on recent searches ([`app/search/page.tsx:123-141`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L123-L141)) has `opacity-0 group-hover:opacity-100`. On touch devices, this button cannot be seen because hover does not exist.
  * "Clear all" button ([`app/search/page.tsx:94-99`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L94-L99)) immediately calls `clearRecentlySearched()`. There is NO confirmation dialog and NO undo toast. History is instantly and irreversibly deleted.
* **Stale Results Glitch:**
  * Because `placeholderData: (prev) => prev` is used in `useQuery` ([`app/search/page.tsx:303`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L303)) and `showLoader` is only true when `results.length === 0` ([`app/search/page.tsx:341`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L341)), editing an existing search query freezes previous search results on screen with no loading spinner during the fetch.

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. Enter `/search` | [`app/search/page.tsx:268-271`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L268-L271) | Focuses search input; shows Recent Searches or Trending. | Clean initial view, but filters ("Everything", "Movies", "TV Shows") are shown before any query is typed. |
| 2. Type 1 character | [`app/search/page.tsx:302`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L302) | Nothing happens (`query.length >= 2` guard). | No UI feedback explaining minimum 2 characters required. Recent searches remain visible. |
| 3. Type search term | [`app/search/page.tsx:289-304`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L289-L304) | Debounces 400ms, then queries TMDB. | No search suggestions dropdown; results replace the entire page view. |
| 4. Type nonsense query | [`app/search/page.tsx:176-190`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L176-L190) | Displays "No results for [query]" empty state. | Dead end: no suggestions, no trending recovery links, no "Clear search" CTA. |
| 5. Network error during search | [`app/search/page.tsx:340`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L340) | Query failure leaves `results: []`. Renders `EmptyResults`. | False error reporting: surfaces network/TMDB outages as "No results found" for the query. |
| 6. Click "Clear all" recents | [`app/search/page.tsx:94-99`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L94-L99) | Calls `clearRecentlySearched()`. | One-click instant wipe with zero confirmation dialog and zero undo affordance. |
| 7. Delete individual recent on mobile | [`app/search/page.tsx:135`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L135) | `opacity-0 group-hover:opacity-100` styling. | Button is invisible on touch devices where hover is unsupported. |

---

### Flow 5: Watchlist and Favorites

* **Entry Points:**
  * DetailHero action bar ([`components/features/media/details/detail-hero.tsx:163-207`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/details/detail-hero.tsx#L163-L207)).
  * ContinueWatchingButton on hero ([`components/features/watchlist/continue-watching-button.tsx:85-178`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-button.tsx#L85-L178)).
* **Add, Remove & Undo:**
  * Add to Watchlist: Optimistically updates local Zustand store (`useWatchListStore`) and sends background `POST /api/watchlist`. Icon flips immediately from Plus to Checkmark. Toast appears: "Added to Watchlist".
  * Remove from Watchlist: Optimistically filters store, sends `DELETE /api/watchlist`. Toast appears: "Removed from Watchlist".
  * **No Undo:** Neither the Watchlist remove toast nor the Favorites remove toast provides an "Undo" action. Once removed, the user must manually re-add.
  * Favorites: Similar optimistic update on `useFavoritesStore`. Heart fills/unfills instantly. Toast appears: "Added to favorites" / "Removed from favorites". No undo.
* **Immediate vs. Refresh Visibility:**
  * In `LibraryPage` (`/library`), changes to Watchlist and Favorites reflect immediately because `LibraryWatchlist` and `LibraryFavoritesSynced` subscribe directly to Zustand stores.
  * **Critical Homepage Desync for Anonymous Users:** On the homepage, `<HomePersonalizedRows section="saved" />` renders `UserWatchlistAll` and `UserFavoritesAll` ([`components/features/home/home-personalized-rows.tsx:40-41`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/home/home-personalized-rows.tsx#L40-L41)). However, `UserWatchlistRow` ([`components/features/home/user-media-row.tsx:69-90`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/home/user-media-row.tsx#L69-L90)) ONLY reads from `usePersonalizedHome()` Tanstack Query, which is disabled if `userId` is null! It completely ignores the local Zustand store! As a result, an anonymous user who adds titles to their Watchlist or Favorites will NEVER see them appear in the saved rows on the homepage, even after a page refresh!
* **Removing from Library View:**
  * In `LibraryWatchlist` ([`components/features/watchlist/library-watchlist.tsx:63-71`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/library-watchlist.tsx#L63-L71)) and `LibraryFavoritesSynced` ([`components/features/watchlist/library-favorites-synced.tsx:80-83`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/library-favorites-synced.tsx#L80-L83)), items are rendered with standard `MediaCard` components. `MediaCard` has NO remove button or action menu.
  * A user cannot remove an item from within their Library! They must click the card, navigate to the detail page, wait for it to load, click the remove button, and navigate back.

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. Click Add to Watchlist | [`continue-watching-button.tsx:114-121`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-button.tsx#L114-L121) | Optimistically adds to store; shows success toast. | Icon changes immediately, but toast feedback waits for background sync return if awaited. |
| 2. Click Remove from Watchlist | [`continue-watching-button.tsx:91-100`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-button.tsx#L91-L100) | Removes from store; shows "Removed from watchlist" toast. | No "Undo" button in the toast. If clicked accidentally, user must search and re-add manually. |
| 3. View saved rows on Home (Logged-in) | [`components/features/home/user-media-row.tsx:69`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/home/user-media-row.tsx#L69) | Queries `/api/home/personalized` and renders "My Watchlist". | Works for authenticated users, but updates are tied to server query cache rather than local store. |
| 4. View saved rows on Home (Anonymous) | [`hooks/use-user-data.ts:20`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/hooks/use-user-data.ts#L20) | `enabled: !!userId` evaluates to false. | Row returns `null`. Anonymous users never see their saved watchlist or favorites on the homepage. |
| 5. Manage items in Library | [`components/features/watchlist/library-watchlist.tsx:63`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/library-watchlist.tsx#L63) | Items render as regular media links. | No inline remove or batch edit. Removing requires full navigation round-trip to title detail page. |

---

### Flow 6: History

* **Entry Points:**
  * Continue Watching row on Homepage ([`components/features/watchlist/recently-watched.tsx`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/recently-watched.tsx)).
  * Library "Continue" tab ([`components/features/watchlist/library-continue-watching.tsx`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/library-continue-watching.tsx)).
* **View & Clear Verification:**
  * Header shows "Continue Watching" with a "Clear" trash button ([`recently-watched.tsx:68-73`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/recently-watched.tsx#L68-L73)).
  * **Confirm Step Verification:** The newly added `DestructiveConfirm` dialog ([`components/features/watchlist/destructive-confirm.tsx`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/destructive-confirm.tsx)) IS properly wired up in both `recently-watched.tsx:76-83` and `library-continue-watching.tsx:86-93`.
  * Clicking "Clear" opens an accessible `role="alertdialog"` modal with title "Clear continue watching?", explaining it removes items across all devices. Focus is safely trapped on the Cancel button ([`destructive-confirm.tsx:67`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/destructive-confirm.tsx#L67)).
* **Recoverability:**
  * **Yes, clear IS recoverable within 8 seconds.**
  * `clearRecentlyWatched()` takes a snapshot of `recentlyWatched` before deleting ([`recently-watched.tsx:28`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/recently-watched.tsx#L28)).
  * A toast appears for 8000ms: `"History cleared. Your continue watching history was removed."` with an `Undo` button.
  * Clicking Undo calls `store.restoreRecentlyWatched(snapshot)` ([`store/recentsStore.ts:474`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/store/recentsStore.ts#L474)), which restores the items locally and resyncs them to the DB.
  * After 8 seconds, the toast dismisses and the action becomes permanently unrecoverable.
* **Single Item Remove:**
  * Removing a single card ([`continue-watching-card.tsx:35-52`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-card.tsx#L35-L52)) does NOT show a confirm dialog, but DOES offer the 8-second Undo toast.

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. Click "Clear" on history | [`recently-watched.tsx:68`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/recently-watched.tsx#L68) | Sets `confirmOpen(true)`. | None; clear trigger is clearly visible. |
| 2. Confirmation modal appears | [`destructive-confirm.tsx:135-195`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/destructive-confirm.tsx#L135-L195) | Renders modal with focus on Cancel. | Properly blocks accidental clicks and explains impact clearly. |
| 3. Confirm deletion | [`recently-watched.tsx:32-44`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/recently-watched.tsx#L32-L44) | Deletes history and fires 8s Sonner toast with Undo action. | Safe pattern; recoverability window exists. |
| 4. Click Undo in toast | [`recently-watched.tsx:41`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/recently-watched.tsx#L41) | Calls `restoreRecentlyWatched(snapshot)` to revert deletion. | History items and sync timestamps are restored properly. |
| 5. Remove single card | [`continue-watching-card.tsx:35-52`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-card.tsx#L35-L52) | Removes card with no modal, shows Undo toast. | Hover-only action buttons are hard to tap on mobile touchscreens. |

---

### Flow 7: Library

* **Entry Points:**
  * Header nav link `Library` ([`components/layout/header/navigation-data.ts:22`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/layout/header/navigation-data.ts#L22)).
  * Direct URL `/library`.
* **Signed-Out vs. Signed-In:**
  * **Severe Architectural Contradiction:**
    * In `proxy.ts:8`, `/library` is declared in `PROTECTED_ROUTES`:
      `const PROTECTED_ROUTES = ['/profile', '/library'];`
    * If an unauthenticated user navigates to `/library`, `proxy.ts:88-92` forces a redirect to `/auth/signin?callbackUrl=/library`.
    * HOWEVER, `app/library/page.tsx:166-197` was explicitly designed with a local, signed-out experience:
      * Displays `"Library · Local"` and `"Stored on this device."` ([`app/library/page.tsx:166, 181`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L166)).
      * Features a `"Sign in to sync"` button ([`app/library/page.tsx:191-195`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L191-L195)).
    * Because of `proxy.ts`, this entire signed-out state is COMPLETELY UNREACHABLE for anonymous users. Clicking "Library" in the header unexpectedly demands login!
* **Tab Switching:**
  * Three tabs: "Continue" (`continue`), "Watchlist" (`watchlist`), "Favorites" (`favorites`).
  * Features auto-switching on initial load ([`app/library/page.tsx:112-127`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L112-L127)): if "Continue" is empty but "Watchlist" or "Favorites" has items, it automatically switches tabs.
* **Are Counts Trustworthy?**
  * **NO, counts are frequently inaccurate and cause hydration mismatches:**
    * Tab button count calculation ([`app/library/page.tsx:101-103`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L101-L103)) counts raw store array lengths:
      `watchlistItems = (watchlist?.length || 0) + (tvwatchlist?.length || 0)`
    * BUT `LibraryWatchlist` ([`components/features/watchlist/library-watchlist.tsx:17-25`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/library-watchlist.tsx#L17-L25)) filters out shows without `poster_path` or `backdrop_path`. If items lack artwork, the tab badge might say "5" while the rendered grid only shows 3 cards!
    * In `recentlyWatched`, `sanitizeContinueWatchingItems` drops completed items, but raw count queries may temporarily reflect dropped items until synchronization.
    * On initial SSR render, `isMounted` is false, forcing all counts to 0 ([`app/library/page.tsx:100`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L100)). Badges pop into view abruptly after hydration.

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. Anonymous user clicks "Library" | [`proxy.ts:88-92`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/proxy.ts#L88-L92) | Intercepted by proxy and redirected to `/auth/signin`. | User expectation is violated; local storage library is blocked behind an unexpected login wall. |
| 2. Signed-in user enters `/library` | [`app/library/page.tsx:150-156`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L150-L156) | Renders spinner if auth is pending, then loads library. | If `AuthSync` bootstrap is in-flight, shows empty state before suddenly popping in user items. |
| 3. Inspect tab counts | [`app/library/page.tsx:101-108`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L101-L108) | Tab badges show count of saved items. | Counts do not match rendered cards when items without images are filtered out by sub-views. |
| 4. Auto tab switch | [`app/library/page.tsx:112-127`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L112-L127) | Switches to Watchlist if Continue Watching is empty. | Can disorient users who expect to land on Continue Watching or who watch the page jump tabs. |
| 5. Switch tabs via keyboard | [`app/library/page.tsx:132-148`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L132-L148) | Arrow keys navigate between tabs. | Functional, but tabs lack swipe gestures on mobile devices. |

---

### Flow 8: Deep Linking

* **Entry Points:**
  * Direct URL: `/tv/[id]?season=[S]&episode=[E]` or `/movie/[id]`.
* **Valid Deep Link:**
  * Example: `/tv/1399?season=1&episode=2`.
  * `parseSeasonParam` and `parseEpisodeParam` validate numbers against known seasons ([`components/features/media/player/deep-link-params.ts:14-34`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/player/deep-link-params.ts#L14-L34)).
  * **Critical Side Effect on Page Load:** In `SeasonTabs` ([`components/features/media/seasons/season-tabs.tsx:122-125`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/seasons/season-tabs.tsx#L122-L125)):
    ```tsx
    if (ep && activeEP?.id !== ep.id) {
        setActiveEP(ep);
        addRecentlyWatched(ep);
    }
    ```
    **Merely loading a deep-linked TV URL automatically writes that episode into the user's Continue Watching history!** Even if the user never presses play or leaves immediately, the title is saved to history.
  * **Layout Shift on Load:** The player is gated on `hasActiveEpisode` ([`season-tabs.tsx:224`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/seasons/season-tabs.tsx#L224)). On initial render, episodes have not loaded yet from React Query, so `hasActiveEpisode` is false. Once episodes load, `TVContainer` mounts above the details panel, causing a sudden 300–500px downward layout shift.
* **Invalid Deep Link:**
  * Example: `/tv/1399?season=999&episode=999`.
  * `parseSeasonParam` detects `999` is not in `validSeasonNumbers` and returns `null` ([`deep-link-params.ts:20`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/player/deep-link-params.ts#L20)).
  * In `season-tabs.tsx:109-111`, it silently falls back to `validSeasons[0].season_number` (Season 1).
  * `parseEpisodeParam('999', episodes.length)` returns `null` ([`deep-link-params.ts:30-32`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/player/deep-link-params.ts#L30-L32)).
  * Because `eParam` is null, `activeEP` is never set.
  * **Result:** The player DOES NOT RENDER. The URL still says `?season=999&episode=999`. There is ZERO error message, banner, or toast explaining why the episode did not open. The user is presented with the DetailHero saying "Choose Episode" and Season 1 selected in the tabs.
* **Invalid Show ID:**
  * Example: `/tv/999999999` or `/movie/invalid-slug`.
  * `getDetailShow` returns null. `notFound()` is triggered ([`app/tv/[tv]/page.tsx:96-97`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/tv/%5Btv%5D/page.tsx#L96-L97)), rendering `app/not-found.tsx`.
  * Renders a clean 404 screen with buttons for "Home" and "Search".

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. Open valid deep link | [`components/features/media/seasons/season-tabs.tsx:105-126`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/seasons/season-tabs.tsx#L105-L126) | Parses season/episode and activates episode in store. | Merely opening the URL mutates watch history (`addRecentlyWatched`), polluting Continue Watching. |
| 2. Player mounts after load | [`components/features/media/seasons/season-tabs.tsx:224`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/seasons/season-tabs.tsx#L224) | `TVContainer` renders once episodes query resolves. | Massive Cumulative Layout Shift (CLS): player pops in above details panel with no skeleton placeholder. |
| 3. Open invalid season/episode | [`components/features/media/player/deep-link-params.ts:20, 31`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/player/deep-link-params.ts#L20) | Out-of-bounds parameters parse to `null`. | Silent failure: player does not load, URL stays dirty with invalid params, zero feedback given. |
| 4. Open non-existent show ID | [`app/tv/[tv]/page.tsx:97`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/tv/%5Btv%5D/page.tsx#L97) | `getDetailShow` returns null; calls `notFound()`. | Safe standard 404 page is rendered with options to return Home or Search. |

---

### Flow 9: Player

* **Entry Points:**
  * Detail pages for Movie or TV.
* **Provider Selection:**
  * Select dropdown rendered in `PlayerControls` ([`components/features/media/episode/player-controls.tsx:109-136`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/player-controls.tsx#L109-L136)).
  * Displays enabled sources from registry: Vidfast (rank 1), CineSrc, VidLink, VidAPI, VidZee, VidEasy, EmbedMaster, ZXCStream, Vidking.
  * Selection is saved to `useProviderStore` and persisted in localStorage (`provider-storage`).
* **Switching Providers:**
  * Changing provider updates `selectedProvider`.
  * `setHasResumed(false)` resets the resume state ([`components/features/media/episode/episode.tsx:70`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L70)).
  * `setStatus('loading')` activates a black backdrop with a spinner and text `"Loading player…"` ([`episode.tsx:229-241`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L229-L241)).
  * The iframe reloads with the new provider's URL.
* **A Provider that Fails:**
  * Failure timeout is set to 15 seconds (`PLAYER_LOAD_TIMEOUT_MS = 15_000` in [`episode.tsx:15`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L15)).
  * If the network hangs or provider is offline, the user must wait 15 full seconds before the error UI appears.
  * **The False-Ready Iframe Problem:**
    * `handleIframeLoad` fires on the iframe's native `onLoad` event ([`episode.tsx:148, 216`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L148)).
    * Browsers fire `onLoad` when the iframe finishes loading an HTTP document, **even if that document is a 404, Cloudflare DDoS challenge, ad wall, or broken error page**.
    * The moment the error page loads inside the iframe, `status` switches to `'ready'`. The "Loading player…" overlay disappears, and the user is left looking directly at an unplayable third-party error page with no app-level fallback!
  * If the 15s timeout DOES trigger (`status === 'failed'`):
    * Displays: `"Playback failed. This source didn’t respond in time. Retry it, or pick another source above."` ([`episode.tsx:255-261`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L255-L261)).
    * Offers a "Retry" button.
    * **No automatic failover:** The app does not automatically try the next highest-ranked provider. The user must manually operate the dropdown.
* **Security & Sandboxing:**
  * The iframe ([`episode.tsx:206-216`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L206-L216)) contains NO `sandbox` attribute. Third-party providers are permitted to open popups, popunders, or initiate redirects.

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. Select alternative provider | [`player-controls.tsx:109`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/player-controls.tsx#L109) | Opens Radix select with provider names. | Technical hostnames (VidAPI, ZXCStream, EmbedMaster) look unpolished and obscure to non-technical users. |
| 2. Provider change initiated | [`episode.tsx:138`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L138) | Sets `status('loading')`. Spinner overlay displays. | Good loading indication, but resume position is reset without asking. |
| 3. Provider fails to respond | [`episode.tsx:142-146`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L142-L146) | Waits 15,000ms before triggering failure state. | 15 seconds is excessive; users will assume the app has frozen long before the error message appears. |
| 4. Provider loads Cloudflare / 404 | [`episode.tsx:148, 216`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L148) | Iframe `onLoad` fires; status becomes `'ready'`. | The loading overlay fades away to reveal a broken third-party page. The app believes playback succeeded. |
| 5. Player timeout failure | [`episode.tsx:243-274`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/episode/episode.tsx#L243-L274) | Shows "Playback failed" alert with Retry button. | No automatic failover to the next available provider. User must manually experiment with other sources. |

---

### Flow 10: Error and Empty Paths

* **Entry Points:**
  * Upstream TMDB failure, empty catalog response, device offline, route errors.
* **When TMDB is Down:**
  * *Homepage (`/`):* `loadFailed` triggers if essential arrays are empty ([`app/page.tsx:168-177`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/page.tsx#L168-L177)). Renders `<HomePageError>` with `<PageFetchError>`: "Couldn’t load the homepage. We couldn’t reach the catalog. Try again in a moment." Provides a "Try again" button that reloads the page (`window.location.reload()` in [`page-fetch-error.tsx:24`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/shared/errors/page-fetch-error.tsx#L24)).
  * *Movie Browse (`/movie`):* If `topRatedMovies` or `genres` is empty ([`app/movie/page.tsx:62-69`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/movie/page.tsx#L62-L69)), renders `<PageFetchError title="Couldn't load movies">`.
  * *Category Browse (`/browse/[slug]`):* If upstream fails or returns 0 items ([`app/browse/[slug]/page.tsx:44-63`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/browse/%5Bslug%5D/page.tsx#L44-L63)), renders `<PageFetchError title="Couldn't load this collection">`.
  * *Detail Pages (`/movie/[id]`, `/tv/[id]`):* If `fetchDetailsTMDB` throws due to TMDB outage ([`lib/api/tmdb-client.ts:362`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/lib/api/tmdb-client.ts#L362)), error escapes to `app/movie/error.tsx` or `app/tv/error.tsx`.
* **When a Page Has No Data:**
  * *DataRow Component:* If an individual row returns empty data ([`components/features/media/row/data-row.tsx:173-189`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/row/data-row.tsx#L173-L189)), renders `<RowStatePanel state="empty">`: "Nothing to show here. This row is empty right now. Check back later." Features a "Refresh" button.
  * *Search with no results:* Shows empty results prompt ([`app/search/page.tsx:176-190`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L176-L190)).
  * *Library sections with no items:* Shows customized empty states with callouts: "Your watchlist is empty", "No favorites yet", "No recent activity".
* **When Network is Lost (Offline):**
  * The app has **zero offline detection** (`navigator.onLine` is never checked; no offline event listeners exist).
  * Client transitions via `next/link` hang silently.
  * Client queries fail and render inline error cards (`RowStatePanel` with "Retry" button).
  * Search falsely claims zero results exist.
  * Server navigation displays browser default offline crash page ("No internet").
* **Way Forward from Each Error:**
  * Global error ([`app/error.tsx:54-63`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/error.tsx#L54-L63)): Provides "Try again" (`reset()`) and "Home" (`Link href="/"`) buttons.
  * Page fetch errors ([`page-fetch-error.tsx:43-55`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/shared/errors/page-fetch-error.tsx#L43-L55)): Provides "Try again" button (`window.location.reload()`).
  * Detail route errors ([`app/movie/error.tsx:24-26`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/movie/error.tsx#L24-L26)): ONLY provides "Try again" button. No link to return home, browse, or search! If the title ID is broken, user is stuck refreshing an unrecoverable error.

| Step | file:line | What happens | Friction |
| --- | --- | --- | --- |
| 1. TMDB catalog outage on Home | [`app/page.tsx:174-177`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/page.tsx#L174-L177) | Detects empty data arrays and renders `PageFetchError`. | Clear error message with reload action; gracefully avoids caching degraded ISR state. |
| 2. TMDB outage on title detail | [`app/movie/error.tsx:17-29`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/movie/error.tsx#L17-L29) | Caught by `app/movie/error.tsx`. Displays "Couldn’t load movies". | Confusing plural copy ("movies") on a single title page. Traps user with only "Try again"; no navigation exit. |
| 3. Data row query failure | [`components/features/media/row/data-row.tsx:159-170`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/row/data-row.tsx#L159-L170) | Individual row fails and renders `RowStatePanel`. | Well-contained inline failure; row offers retry button without crashing surrounding page. |
| 4. Network disconnection | Unhandled in client | App loses network connection. | No offline banner or toast. Search misattributes connection failure to empty search results. |

---

## 2. Cross-Cutting UX Audit Findings

### Navigation & Discoverability
* **Two-Interaction Reachability:**
  * Home, Movies, TV Series, Search, and Library are reachable within 1 interaction on desktop and 2 on mobile (via hamburger).
  * **Major Orphaned Route (`/genres`):** The `/genres` page (`app/genres/page.tsx`) is completely absent from all navigation bars ([`navigation-data.ts:7-24`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/layout/header/navigation-data.ts#L7-L24)). It is indexed in sitemap and referenced in breadcrumbs, but no top-level link exists in the header or sidebar. Users can only reach genres by scrolling to the bottom of the Movies or TV pages.
* **Location & Active State Clarity:**
  * Active indicators work well on top-level routes (`/`, `/movie`, `/tv`, `/library`).
  * On `/browse/[slug]` (e.g. `/browse/popular-tonight`), `/search`, and `/genres`, no nav item is highlighted. The header provides zero contextual orientation or breadcrumb indicating where the user is.

### Latency Perception & Feedback
* **Missing Transition Indicators:**
  * All media cards use `prefetch={false}` ([`components/features/media/card/media-card.tsx:44`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/card/media-card.tsx#L44)). When a card is clicked, there is no top progress bar, skeleton, or cursor indicator during the 400–1200ms page load.
* **Frozen Search Results:**
  * In `/search`, searching while results are already rendered retains stale results with no background loading indicator ([`app/search/page.tsx:303, 341`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L303)).
* **Severe Layout Shift on TV Details:**
  * Gating the player behind `hasActiveEpisode` in `SeasonTabs` ([`season-tabs.tsx:224`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/seasons/season-tabs.tsx#L224)) causes the entire page below the hero to jump down several hundred pixels when the episodes query resolves.

### Language & Microcopy Consistency
* **Television Nomenclature Chaos:**
  * Desktop header: `"TV Series"` ([`navigation-data.ts:17`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/layout/header/navigation-data.ts#L17)).
  * Hero banner: `"Series"` ([`hero-banner.tsx:204`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/media/hero-banner.tsx#L204)).
  * Search filter: `"TV Shows"` ([`app/search/page.tsx:27`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/search/page.tsx#L27)).
  * User media row: `"My Shows"` ([`user-media-row.tsx:34`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/home/user-media-row.tsx#L34)).
  * Route error page: `"TV content"` ([`app/tv/error.tsx:20`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/tv/error.tsx#L20)).
* **History Nomenclature Fragmentation:**
  * Homepage row: `"Continue Watching"` ([`recently-watched.tsx:63`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/recently-watched.tsx#L63)).
  * Library tab: `"Continue"` ([`app/library/page.tsx:217`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/library/page.tsx#L217)).
  * Clear confirmation & toast: `"History"` ([`recently-watched.tsx:35`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/recently-watched.tsx#L35)).
  * Library empty state: `"No recent activity"` ([`library-continue-watching.tsx:64`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/library-continue-watching.tsx#L64)).
* **Watchlist Copy vs. Icon Mismatch:**
  * Library empty state directs users: *"Add shows and movies to your watchlist by clicking the bookmark icon on any details page."* ([`library-watchlist.tsx:39`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/library-watchlist.tsx#L39)). The details page hero does NOT have a bookmark icon; it uses a `PlusIcon` / `CheckIcon` ([`continue-watching-button.tsx:306`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/components/features/watchlist/continue-watching-button.tsx#L306)).
* **Plural Error on Detail Routes:**
  * Opening a single movie detail route that fails displays: `"Couldn't load movies"` ([`app/movie/error.tsx:20`](file:///Users/farhanmansuri/.herdr/worktrees/tv.spicy/audit-ux/app/movie/error.tsx#L20)).

### Violations of User Expectation
1. **Three "Play" clicks to watch a movie:** Clicking Play on the home hero opens the movie detail page. Clicking Play on the detail page hero scrolls down to the embedded player. Clicking the embedded player actually starts playback.
2. **Anonymous library lockout:** Unauthenticated users are bounced to sign-in when clicking Library, even though the app advertises local-first storage.
3. **Passive watch history pollution:** Merely opening a shared link or episode page records the episode into Continue Watching without the user ever playing it.
4. **False search empty states on connection loss:** A failing network presents as "No results found for your query".
5. **No registration or recovery in auth:** First-time visitors cannot sign up or reset passwords.

---

## 3. Actionable Recommendations Table

| Before | After | Why |
| --- | --- | --- |
| `proxy.ts:8` protects `/library` behind authentication, redirecting unauthenticated users to `/auth/signin`. | Remove `/library` from `PROTECTED_ROUTES` in `proxy.ts` so anonymous users can view local storage. | The library UI explicitly supports unauthenticated local storage and should not force login. |
| `components/auth/auth-button.tsx:55` routes to `/auth/signin` without appending `?callbackUrl=`. | Pass `?callbackUrl=${encodeURIComponent(pathname)}` when pushing to sign-in. | Users expect to return to their active browsing context after authenticating. |
| `components/ui/sign-in.tsx:70-146` contains no cancel/close button, no sign-up link, and no password reset link. | Add a top-left close/back button, a "Create account" tab/link, and a "Forgot password" prompt. | Prevents trapping users on the sign-in screen and provides essential authentication lifecycle paths. |
| `app/auth/signin/page.tsx:62` only renders authentication errors inside a corner Sonner toast. | Surface the error message inside the form's inline error banner (`SignInPage:78`) and highlight input borders. | Users look at the form inputs when submitting credentials, not at floating screen edges. |
| `components/features/watchlist/continue-watching-button.tsx:215` routes movie hero "Play" clicks to `/movie/[id]`. | On the homepage hero, either label the button "View Movie" or auto-scroll to an embedded player upon navigation. | Calling an action "Play" when it only navigates to another overview page violates core mental models. |
| `components/features/media/episode/episode.tsx:57` initializes `activeResumeSeconds` to 0, forcing manual chip click. | Automatically initialize `activeResumeSeconds` to `savedPositionSeconds` if greater than 30 seconds. | Users expect continue watching items to resume playback where they left off without a secondary click. |
| `components/features/media/episode/use-playback-progress.ts:145` silently skips fallback progress tracking if duration is missing. | Populate default duration from TMDB metadata (`show.runtime` or `episode.runtime * 60`) when store duration is null. | Enables progress tracking for providers lacking postMessage APIs rather than losing progress completely. |
| `components/features/media/episode/episode.tsx:15` waits 15,000ms before declaring playback failure. | Reduce playback timeout to 7,000ms and display a clear source-switching prompt or auto-try next source. | 15 seconds of a black screen feels broken; users abandon long before the timeout expires. |
| `components/features/media/seasons/season-tabs.tsx:124` calls `addRecentlyWatched(ep)` immediately upon mounting deep-linked episode. | Move `addRecentlyWatched` to only fire when the player receives its first play event or ticks 10s of progress. | Merely viewing a URL should not pollute a user's continue watching history. |
| `components/features/media/seasons/season-tabs.tsx:224` dynamically mounts `TVContainer` only after episodes load, causing massive CLS. | Reserve an aspect-ratio container skeleton for the player during loading states. | Prevents jarring layout shifts that push page content downward during episode resolution. |
| `components/features/media/player/deep-link-params.ts:20, 31` returns null on invalid params with no UI message. | Display a toast notification ("Episode not found, showing Season 1") and scrub invalid query params with `replaceState`. | Informs users why their shared link didn't open the expected episode. |
| `app/search/page.tsx:340` renders `EmptyResults` whenever `results.length === 0`, even if query threw an error. | Check `isError` on `useQuery` and render an error card with a retry button instead of `EmptyResults`. | Upstream connection failures must not be blamed on the user's search query. |
| `app/search/page.tsx:94` clears all search history immediately with no confirmation or undo. | Add an 8-second Sonner undo toast to `clearRecentlySearched()`, mirroring the continue watching clear flow. | Destructive history wipes should always be recoverable. |
| `components/layout/header/navigation-data.ts:7-24` omits `/genres` from desktop and mobile navigation menus. | Add `{ label: 'Genres', href: '/genres' }` to `navigationItems`. | Restores discoverability for an existing top-level catalog route. |
| `components/features/watchlist/library-watchlist.tsx:63` renders plain media cards with no remove button. | Add a quick-action remove icon or context menu to cards rendered within library tabs. | Users should be able to manage their watchlist without navigating away to detail pages. |
| `components/features/home/user-media-row.tsx:69` only reads from server Tanstack Query, rendering nothing for anonymous users. | Fall back to local Zustand stores (`watchlistStore`, `favoritesStore`) when `userId` is null. | Allows anonymous users to see their saved watchlist and favorites on the homepage. |
| `app/movie/error.tsx:20` displays `"Couldn't load movies"` on single-title detail routes and provides no exit link. | Change copy to `"Couldn't load movie details"` and add a "Browse Movies" button linking to `/movie`. | Fixes plural phrasing mismatch and prevents trapping users on broken detail pages. |
| `components/features/watchlist/library-watchlist.tsx:39` instructs users to click the "bookmark icon", but detail heroes use `PlusIcon`. | Align copy to say "plus icon" or change the detail hero button to use a bookmark icon. | Eliminates confusion caused by conflicting visual iconography instructions. |

---

## 4. Top 10 Prioritized Friction Points

The friction score is calculated as:  
$$\text{Friction Score} = \text{Frequency (1–10)} \times \text{Cost / Severity (1–10)}$$

1. **Anonymous Users Locked Out of Library**  
   * **Score:** $9 \times 9 = 81$  
   * **Evidence:** `proxy.ts:8`, `app/library/page.tsx:166-197`.  
   * **Impact:** Every single unauthenticated visitor who clicks "Library" is blocked by a login redirect, completely breaking the local-first storage value proposition.
2. **Resume Does Not Actually Resume Playback**  
   * **Score:** $8 \times 9 = 72$  
   * **Evidence:** `components/features/media/episode/episode.tsx:57, 119`, `player-controls.tsx:42-65`.  
   * **Impact:** Returning to an in-progress show starts playback from 0:00. The user must manually spot and click the small resume chip, and on multiple providers, it fails to seek entirely.
3. **Movie "Play" CTA Requires 3 Clicks Across 2 Pages**  
   * **Score:** $9 \times 7 = 63$  
   * **Evidence:** `components/features/watchlist/continue-watching-button.tsx:215`, `show-container.tsx:117-123`.  
   * **Impact:** High-intent users clicking "Play" on the home hero are dumped onto an overview page, where clicking "Play" merely scrolls down past the storyline to a third click.
4. **Search Outages Falsely Reported as "No Results Found"**  
   * **Score:** $6 \times 9 = 54$  
   * **Evidence:** `app/search/page.tsx:300-341`.  
   * **Impact:** Any transient network issue or TMDB 5xx error gaslights the user into thinking valid titles do not exist in the catalog.
5. **No Sign-Up or Account Creation Option in Sign-In Flow**  
   * **Score:** $6 \times 8 = 48$  
   * **Evidence:** `components/ui/sign-in.tsx:70-146`, `app/auth/signin/page.tsx`.  
   * **Impact:** First-time users directed to sign in have no mechanism to register with email/password; submitting leads to an unhelpful "Invalid email or password" error.
6. **Watch History Polluted by Passive Deep Link Visits**  
   * **Score:** $7 \times 6 = 42$  
   * **Evidence:** `components/features/media/seasons/season-tabs.tsx:124`.  
   * **Impact:** Simply opening or previewing a link immediately marks the episode as in-progress in Continue Watching.
7. **Anonymous Users' Watchlist and Favorites Missing from Home Rows**  
   * **Score:** $7 \times 6 = 42$  
   * **Evidence:** `components/features/home/user-media-row.tsx:69`, `hooks/use-user-data.ts:20`.  
   * **Impact:** Local-first saves appear to evaporate when users return to the home screen.
8. **Inability to Remove Items Directly from Library Cards**  
   * **Score:** $6 \times 6 = 36$  
   * **Evidence:** `components/features/watchlist/library-watchlist.tsx:63`, `components/features/media/card/media-card.tsx:42`.  
   * **Impact:** Curating or cleaning up saved lists requires an exhausting multi-page navigation round-trip for every single item.
9. **Dead End and Confusing Copy on Detail Route Errors**  
   * **Score:** $4 \times 8 = 32$  
   * **Evidence:** `app/movie/error.tsx:20-26`, `app/tv/error.tsx:20-26`.  
   * **Impact:** A broken title ID leaves users stranded on an uninformative error screen ("Couldn't load movies") with only a broken "Try again" reload button.
10. **Genres Route Completely Orphaned from Navigation**  
    * **Score:** $5 \times 6 = 30$  
    * **Evidence:** `components/layout/header/navigation-data.ts:7-24`, `app/genres/page.tsx`.  
    * **Impact:** A primary discovery vector of the streaming service is invisible from main navigation bars on both desktop and mobile.
