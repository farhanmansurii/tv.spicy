# API Request Reduction Design

## Goal

Keep Spicy TV comfortably within Vercel's Hobby limits by removing automatic,
duplicated, and high-frequency application requests while preserving automatic
login restoration and local-first media state.

## Required behavior

- A returning user with a valid Better Auth cookie is logged in automatically.
- Opening the site may perform one session lookup, but changing tabs or focusing
  the browser must not trigger another session lookup.
- Session validation should avoid a database query when a recently validated,
  signed session cookie is available.
- Client components must consume one shared auth state instead of independently
  owning the authentication lifecycle.
- A signed-in browser bootstrap must use one combined data synchronization
  request rather than separate watchlist, favorites, and recently-watched reads.
- Anonymous users must not request personalized database data.
- Playback progress remains responsive in local state, while remote persistence
  is limited to meaningful checkpoints rather than every progress event.
- Sign-in, sign-out, profile routing, watchlist, favorites, continue watching,
  and cross-device synchronization must continue to work.

## Selected approach

### Session lifecycle

`AuthProvider` is the single client owner of Better Auth's `useSession()` hook.
It mirrors the result into the existing Zustand auth store. Other components
read narrow selectors from that store.

The Better Auth client disables focus and offline revalidation and keeps
interval polling disabled. A valid session is still checked once when the
client session atom mounts, which restores login on a hard load.

The Better Auth server enables its signed `compact` cookie cache for five
minutes. During that window, `get-session` and authenticated route handlers can
validate the user without querying Postgres. Session revocation on another
device may therefore take at most five minutes to be observed on this device;
explicit sign-out on the current device remains immediate.

### Personalized-data bootstrap

After the shared auth store receives a user ID, `AuthSync` collects the
local-first watchlist, favorites, recently watched items, and recent searches.
It sends them once to `/api/sync`.

The sync endpoint merges the submitted data, reads the canonical user home data,
and returns that data in the same response. The client then:

1. merges the canonical response into each local store;
2. seeds the existing TanStack Query personalized-home cache;
3. marks the user bootstrap complete.

This replaces the current potential fan-out of two watchlist reads, two
favorite reads, one recently-watched read, a sync write, and a separate
personalized-home read.

Anonymous sessions skip this flow. Repeated mounts for the same user in one
browser session also skip it.

### Playback persistence

Player events continue updating Zustand immediately so the interface and resume
position stay current. Database writes are coordinated per media item:

- ordinary progress events persist at most once per 60-second window;
- pause, ended, page-hidden, and unmount checkpoints flush the latest progress;
- duplicate checkpoints with no meaningful position change are ignored;
- completion at 95% still removes the continue-watching entry.

The coordinator exposes a small scheduling interface so timing behavior can be
tested without mounting a real third-party player.

### Query invalidation

Local mutations update the personalized-home cache directly or invalidate only
after their corresponding mutation succeeds. Progress ticks do not invalidate
unrelated watchlist and favorites data. Default query retry behavior remains
bounded and window-focus refetching stays disabled.

## Error handling

- Session-check failure leaves the app signed out and does not start data sync.
- Bootstrap failure keeps local data usable and permits one explicit retry;
  it does not start multiple parallel bootstrap requests.
- Background mutation failures retain local-first state and log one concise
  error. A later login bootstrap reconciles local data with the database.
- Playback flush failures keep the latest local checkpoint so a later flush can
  retry it.

## Verification seams

The following public seams will receive regression coverage:

1. Auth client configuration: focus refetch and polling are disabled.
2. Server auth configuration: the five-minute signed cookie cache is enabled.
3. Bootstrap coordinator: concurrent calls for one user collapse to one
   `/api/sync` request and anonymous state makes no request.
4. Sync route response: one request returns the merged canonical user data.
5. Progress persistence coordinator: frequent progress events produce at most
   one ordinary write per minute and an explicit flush persists the latest
   checkpoint.

The final gate is the full test suite, ESLint, TypeScript through the Next.js
production build, and a static request-graph audit confirming no remaining
automatic multi-endpoint bootstrap path.

## Expected request budget

| User action | Before | After |
| --- | ---: | ---: |
| Anonymous hard load | one session lookup plus focus repeats | one session lookup |
| Return to browser tab | one session lookup | zero |
| Signed-in bootstrap | up to seven personalized requests | one combined request |
| Session validation within five minutes | Postgres-backed lookup | signed-cookie validation |
| Continuous playback | potentially repeated writes every few seconds | at most one ordinary write per minute |
