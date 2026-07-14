# Movie/TV iframe provider candidate research

Date: 2026-07-14  
Scope: providers not already represented in `components/features/media/episode/providers.ts`  
Decision target: whether a provider has enough first-party documentation and a live route to justify a future manual iframe-source entry.

## Executive result

The only new candidates with both first-party embed documentation and successful live HTTP responses were **VidCore** and **YapGrid**. VidCore is the stronger fit for this registry because it documents both movie and episode URL forms, a `startAt` resume parameter, and `postMessage` playback events. YapGrid has a live movie route and a live TV-shaped route, but the first-party page exposes a complete movie example while only asserting TV support; it does not document a TV URL shape or progress protocol in the material reviewed. Treat YapGrid as a manual smoke-test candidate, not a ready recommendation.

**APIPlayer/mplayer.to** has unusually complete documentation, including episode URLs, `postMessage`, and server-side resume, but it is not a candidate at this snapshot: both representative routes returned HTTP 502 and the response included `X-Frame-Options: SAMEORIGIN`.

No provider is recommended as production-ready solely from this research. HTTP 200 means that an HTML route was reachable; it does not prove that a playable stream was selected, that media bytes loaded, or that playback worked inside this application’s iframe.

## Existing-registry de-duplication

The current registry already contains Vidfast, Vidking, VidLink, Vidsrc, AutoEmbed, Rivestream, VidEasy, MoviePire, VidZee, ZXCStream, Vidnest, CineSrc, TouStream, VidZen, and 111Movies, including disabled entries. Its comments also identify `vidsrc.pro`, `embed.su`, and `autoembed.cc` as the same VidSrc-family event format. Those names, aliases, and family domains were excluded from new-candidate research. See the [current provider registry](../../components/features/media/episode/providers.ts).

## Test method and evidence boundary

Representative IDs used:

- movie: `27205` (Inception) for VidCore and APIPlayer; `550` (Fight Club) for YapGrid, matching YapGrid’s own example;
- TV episode: TMDB show `1399`, season `1`, episode `1` (used only as a route-shape probe).

On 2026-07-14, read-only `curl -L` checks followed redirects and recorded status, content type, final URL, and selected iframe-related response headers. A 200 response was classified as **endpoint reachable**. No browser session was used to click play, observe a loaded media element, or verify audio/video; therefore **actual playback confirmation: none** for every candidate below.

## Candidate comparison

| Candidate | First-party URL forms | Resume/progress documented | Iframe/header observation | Live route result | Maintenance signal | Assessment |
|---|---|---|---|---|---|---|
| [VidCore](https://www.vidcore.org/docs/video-player-api-documentation) | Movie: `/embed/movie/{tmdbId}`. TV episode: `/embed/tv/{tmdbId}/{season}/{episode}`. The official docs show both forms and a `PLAYER_EVENT` listener example. | `startAt` is documented for starting at seconds. Docs list `play`, `pause`, `seeked`, `ended`, `timeupdate`, and `playerstatus`; the exact payload shape needed by this registry is not documented in the page reviewed. | Movie and TV returned `200 text/html`; no `X-Frame-Options` or `Content-Security-Policy` header was observed in the response headers. This is only a compatibility signal, not playback proof. | `https://www.vidcore.org/embed/movie/27205` → 200; `https://www.vidcore.org/embed/tv/1399/1/1` → 200. | Live first-party home/docs; homepage claims automatic link updates, multi-server fallback, and 14+ servers. These are provider claims, not independently measured uptime. | **Best new fit, pending browser playback and payload capture.** The route shape and event concept map cleanly to the registry, but the parser contract must be verified before adding it. |
| [YapGrid](https://yapgrid.com/) | Official page documents movie `/embed/movie/{id}` and says the player supports movies and TV with season/episode selection. The reviewed page does not show an explicit TV URL example or parameter contract. | No `startAt`, resume, `postMessage`, or progress API was disclosed on the reviewed first-party page. | Movie and TV-shaped probes returned `200 text/html`; no `X-Frame-Options` or `Content-Security-Policy` header was observed. | `https://yapgrid.com/embed/movie/550` → 200; `https://yapgrid.com/embed/tv/1399/1/1` → 200. The TV 200 verifies route reachability only; it does not verify that the route is the supported TV contract. | First-party page exposes real-time server-status UI, “auto-updated content” language, Discord, and a linked [official repository](https://github.com/enikqi/yapgrid). GitHub API reported repository `archived: false`, `pushed_at: 2026-06-20T12:22:09Z`, and `updated_at: 2026-06-20T12:30:25Z` at check time. | **Provisional smoke-test candidate only.** Do not add until the provider publishes the TV URL form and a progress/resume contract, or a browser test establishes a stable manual-only fallback. |
| [APIPlayer / mplayer.to](https://apiplayer.ru/docs) | Fully documented: movie `/embed/movie/:id`; TV show `/embed/tv/:id`; episode `/embed/tv/:id/:season/:episode`, plus dash and query forms. Accepts IMDB or TMDB IDs. | Strongest documentation: `resume=1` prompt, `postMessage` `timeupdate`/`state`/`progress` events, and anonymous-cookie server-side progress saved every 30 seconds and on pause/end. | Official iframe example requests `allow="autoplay; encrypted-media; screen-wake-lock"`. Both live routes returned `502 text/plain`; response included `X-Frame-Options: SAMEORIGIN`, which is incompatible with a third-party parent in ordinary iframe use. | `https://apiplayer.ru/embed/movie/27205` → 502; `https://apiplayer.ru/embed/tv/1399/1/1` → 502. | Detailed, unusually complete docs and stated 60 requests/minute limit, but no reliable live route at this snapshot; no first-party ads/privacy disclosure was found in the docs reviewed. | **Do not recommend now.** Recheck later; the documentation is good, but current reachability and framing headers fail the practical gate. |

## Provider details

### VidCore

The official documentation gives the exact movie and TV episode paths, lists `startAt` in seconds, and says the iframe posts playback events to its parent. The React integration guide independently demonstrates the iframe wrapper and says to use `postMessage` for watch history and progress sync ([API docs](https://www.vidcore.org/docs/video-player-api-documentation), [React integration](https://www.vidcore.org/docs/react-video-player-integration)). The route probes returned HTML 200 for both media types.

The provider’s homepage advertises “minimal ads,” adaptive HLS, multi-server fallback, and automatic link updates ([homepage](https://www.vidcore.org/)). “Minimal ads” is a first-party marketing claim; it should not be treated as a guarantee. Its short [privacy policy](https://www.vidcore.org/privacy) says an integrating application is responsible for explaining its own analytics, watch-progress, and preference storage. The registry would still need an origin-locked parser and a real browser test to learn the event payload and confirm media playback.

### YapGrid

The official page supplies a complete movie iframe example with `allow="autoplay; fullscreen; picture-in-picture"`, TMDB movie IDs, and subtitle-related options. It states full movie/TV support and season/episode selection, but the captured documentation section did not supply a TV route pattern, resume parameter, or event API ([official page](https://yapgrid.com/)). The successful TV-shaped 200 response therefore cannot be promoted to “documented TV support.”

The same page claims multi-server playback, built-in proxying, synchronized subtitles, real-time server availability, and auto-updated content. No ads or privacy policy disclosure was found on the reviewed first-party page. The linked repository is a useful maintenance signal, but its low star count is not an availability or quality measure.

### APIPlayer / mplayer.to

This is the best-documented technical contract of the three. The docs specify standard iframe permissions, IMDB/TMDB identifiers, movie and TV URL forms, optional `autoplay`/`autonext`/`resume`, a bidirectional `postMessage` API, and a progress endpoint backed by an anonymous `mpsid` cookie ([documentation](https://apiplayer.ru/docs)). However, both representative live routes returned 502 during this check, and the response header was `X-Frame-Options: SAMEORIGIN`. That combination makes it unsuitable for the existing third-party manual iframe selector until the provider fixes reachability and framing behavior.

## Follow-up gate before any registry change

1. Open the candidate route in a real browser from the tv.spicy origin.
2. Confirm the iframe remains loaded, a server/source is selected, and a short media segment actually starts; record this separately from HTTP status.
3. For VidCore, capture one origin-locked `postMessage` payload for movie and TV and map its fields before implementing a parser.
4. For YapGrid, obtain or verify the official TV URL contract and determine whether progress is available; otherwise keep it manual-only with the existing time-based fallback.
5. Recheck `X-Frame-Options`, CSP, cookies, and any ad/analytics behavior from the browser context before exposing a provider to users.

## Second-pass research — 2026-07-14

This broader pass searched for distinct free, no-credential iframe services outside the registry and the first-pass report. VidSrc.link was rejected as a VidSrc-family alias, and NexStream was rejected because its official documentation requires an API key. The checks below used the same representative IDs: movie `27205` and TV episode `1399/1/1`.

The second-pass conclusion is narrow: **VidPhantom is the only additional candidate that passed the documentation plus live-route gate.** It is not playback-confirmed and should not be added without a browser smoke test. ezvidapi, 2Embed, and VidAPI/vaplayer were rejected for the reasons recorded below.

### Accepted for browser smoke test: VidPhantom

Official documentation gives:

- movie: `https://vidphantom.com/movie/[TMDB_ID]`;
- TV episode: `https://vidphantom.com/tv/[TMDB_ID]/[SEASON]/[EPISODE]`;
- `startAt` in seconds for resume-style URL construction;
- origin-locked `MEDIA_DATA` progress snapshots and `PLAYER_EVENT` messages containing `currentTime`, `duration`, `tmdbId`, `mediaType`, and TV season/episode fields.

Those details are documented on the [VidPhantom first-party site](https://vidphantom.com/), including the iframe examples, progress data structure, and event examples. The site says the service is ad-free, claims daily content updates, lists multiple active domains, and links to Discord; these are provider claims and maintenance signals, not independent uptime evidence. No privacy policy or account requirement was disclosed on the reviewed page. The direct routes responded without credentials.

Read-only HTTP checks on 2026-07-14:

| Route | HTTP/final URL | Framing headers | Playback confirmation |
|---|---|---|---|
| `https://vidphantom.com/movie/27205` | `200 text/html`; final URL unchanged | No `X-Frame-Options` or `Content-Security-Policy` observed | **Not performed** |
| `https://vidphantom.com/tv/1399/1/1` | `200 text/html`; final URL unchanged | No `X-Frame-Options` or `Content-Security-Policy` observed | **Not performed** |

The 200 responses establish endpoint reachability only. They do not establish that a source was selected, that media bytes loaded, or that audio/video played in a tv.spicy iframe. VidPhantom’s documented `PLAYER_EVENT` shape appears compatible with the registry’s `parseSuFamily` field conventions, but that is a documentation-based mapping, not a captured browser message.

### Rejected: ezvidapi

The [first-party site](https://ezvidapi.com/) documents no-auth movie and TV iframe routes (`/embed/movie/:tmdb_id` and `/embed/tv/:tmdb_id/:season/:episode`), claims multi-provider failover, and says the embed is CSP-compatible with no tracker pixels or surprise redirects. It does not document a resume parameter or a `postMessage` progress contract. The page also links or compares upstream providers including VidSrc, so it is an aggregator rather than a distinct playback network in the same sense as a direct provider.

Live checks rejected it: both `https://ezvidapi.com/embed/movie/27205` and `https://ezvidapi.com/embed/tv/1399/1/1` returned `502 text/plain` with `X-Frame-Options: SAMEORIGIN`; final URLs were unchanged. No playback was attempted. The documented claim of CSP compatibility cannot override the observed 502/SAMEORIGIN response, so this is not a current iframe candidate.

### Rejected: 2Embed

The [official 2Embed page](https://www.2embedstream.xyz/) documents movie `/embed/movie/{id}` and TV `/embed/tv/{id}/{season}/{episode}` routes, says no subscription or account is needed, and explicitly discloses popup ads. It claims links are automatically updated and offers multiple servers, but it does not document resume/progress parameters or a parent-page event API. Its content-aggregator disclaimer also says that an ID may appear to exist without actual hosted content.

The canonical no-`www` routes were checked read-only after the `www` host produced an SSL connection failure: `https://2embedstream.xyz/embed/movie/27205` and `https://2embedstream.xyz/embed/tv/1399/1/1` both returned `404 text/html`, with final URLs unchanged. No X-Frame-Options or CSP header was observed in those 404 responses. Because both live routes are dead at this snapshot, 2Embed is rejected; no playback was claimed.

### Rejected: VidAPI / vaplayer

The [VidAPI first-party home](https://vidapi.ru/) and [API documentation](https://vidapi.ru/api) describe movie and TV routes hosted on a different domain, `vaplayer.ru`, and document `startAt`/`resumeAt` plus `PLAYER_EVENT` progress payloads. The docs also state that only whitelisted domains can embed the player, that `frame-ancestors` CSP is enforced, and that a dashboard/login is used for allowed-site configuration. The home page explicitly instructs integrators to sign up, add a domain, and configure the service; it also discloses one player popup per session on the free mode. That fails the requested no-account criterion even though the public route itself is reachable.

Live checks against the documented player host returned `200 text/html` for both `https://vaplayer.ru/embed/movie/27205` and `https://vaplayer.ru/embed/tv/1399/1/1`, with final URLs unchanged. No X-Frame-Options or CSP header appeared in the observed response headers, but the provider’s own documentation says domain whitelisting/CSP enforcement applies, so the header result is not enough to establish third-party frameability. No playback was attempted. VidAPI/vaplayer is rejected as an account/domain-configuration service rather than a no-account candidate.

### Alias and requirement exclusions

- [VidSrc.link](https://vidsrc.link/) documents the same `/embed/movie/{id}` and `/embed/tv/{id}/{season}/{episode}` family shape and calls itself VidSrc; it was rejected as an alias/family duplicate of the existing `vidsrc` entry.
- [NexStream](https://api.codespecters.com/) documents movie and TV routes but marks `apikey` as required, so it was rejected from the no-account set before endpoint testing.
- Existing first-pass entries and aliases were not retested or counted as new candidates.

### Second-pass follow-up gate

VidPhantom must still pass a real browser test from the tv.spicy origin: verify iframe rendering, source selection, short media start, event origin, and the exact TV progress fields. Until that happens, the report supports only “documented and HTTP-reachable,” never “plays.”
