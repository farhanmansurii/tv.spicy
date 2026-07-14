# Provider registry redesign

Date: 2026-07-14

## Goal

Make iframe providers easy to add, disable, verify, and remove without exposing provider-specific details throughout the player. Add VidCore as the default visible source, retain a lean selector of six to eight sources, and prepare VidPhantom as the next candidate without claiming playback before browser confirmation.

## Scope

- Replace the 570-line mixed provider registry with a data-first registry and optional progress adapters.
- Make VidCore the persisted-store default and the fallback when a saved provider is unavailable.
- Add VidCore using its documented movie, TV, and `startAt` contracts.
- Add VidPhantom as `candidate`, hidden until its browser playback and event payload are confirmed.
- Keep provider switching manual; do not add automatic fallback or probing from user browsers.
- Keep broken and rejected providers documented but hidden.
- Do not modify the header.

## Provider states

Every provider has one explicit status:

- `enabled`: available in the manual source selector.
- `candidate`: integrated or researched, but hidden pending browser confirmation.
- `disabled`: hidden because it is broken, blocked, duplicated, or intentionally retired. A reason is required.

HTTP reachability alone does not normally promote a provider to `enabled`. Promotion requires either a browser check from the application origin or an explicit product-owner decision to launch it with `playback: 'pending'`. VidCore is the explicit exception requested for this change.

## Architecture

The provider module exposes a small interface:

```ts
listEnabledProviders(): ProviderSummary[]
resolveProvider(id: string): ResolvedProvider
buildProviderUrl(id: string, media: ProviderMedia): string
```

Callers do not read registry arrays, URL templates, origins, or parser functions directly. `resolveProvider` always returns an enabled provider and falls back to VidCore.

The implementation is split by responsibility:

```text
components/features/media/episode/providers/
├── index.ts
├── types.ts
├── registry.ts
├── url-builders.ts
└── progress/
    ├── types.ts
    ├── vidking.ts
    ├── vidlink.ts
    ├── vidsrc-family.ts
    └── media-data.ts
```

`registry.ts` contains compact declarations. Standard providers select a shared URL builder. Only genuinely different `postMessage` payloads use a progress adapter. Shared families reuse one adapter rather than copying parsers.

## Registry declaration

A normal provider is declarative:

```ts
defineProvider({
  id: 'vidcore',
  label: 'VidCore',
  status: 'enabled',
  rank: 1,
  urls: standardEmbedUrls('https://www.vidcore.org'),
  resume: queryResume('startAt'),
  progressAdapter: 'vidcore',
  verification: {
    checkedAt: '2026-07-14',
    movieRoute: 'reachable',
    tvRoute: 'reachable',
    playback: 'pending',
  },
});
```

Required fields are ID, label, status, rank, URL builder, and verification record. Disabled entries also require `disabledReason`. Capability badges are derived from configuration; maintainers do not manually duplicate them.

## Player data flow

1. The persisted store contains only a provider ID and defaults to `vidcore`.
2. The episode player resolves that ID through the provider module.
3. Invalid, candidate, or disabled IDs resolve to VidCore and update persisted state once.
4. The player requests one URL for the currently selected provider instead of eagerly building URLs for every provider.
5. Progress tracking receives the resolved provider. It attaches an origin-locked adapter when available; otherwise it uses the existing time-based fallback.
6. The selector receives provider summaries from `listEnabledProviders()` and remains manual.

## Initial visible list

VidCore becomes rank 1 and the default. The initial visible order is VidCore, Vidking, VidLink, Vidfast, Vidsrc, VidZen, VidZee, and 111Movies. This keeps the selector at eight entries and prioritizes documented contracts, current route reachability, and useful resume/progress support. VidEasy, MoviePire, ZXCStream, Vidnest, and CineSrc remain as hidden candidates rather than being deleted.

VidPhantom is initially `candidate`. It can become enabled after the user confirms movie and TV playback and its actual message origin/payload matches the documented contract. YapGrid remains research-only because its TV route and progress contract are not documented strongly enough. APIPlayer, ezvidapi, 2Embed, VidAPI, NexStream, and duplicate VidSrc-family aliases are excluded for the reasons captured in the research report.

## Error handling

- Registry construction fails fast in development for duplicate IDs, duplicate ranks, missing disabled reasons, invalid HTTPS base URLs, or enabled providers without verification metadata.
- URL construction validates media type and requires positive season and episode numbers for TV.
- Unknown persisted IDs fall back to VidCore without rendering an empty iframe.
- Provider failures never trigger automatic source switching. The UI keeps the manual dropdown available.
- Provider event listeners accept messages only from the configured origin and ignore malformed payloads.

## Verification tooling

Add a local provider-check command that evaluates declared movie and TV routes and reports DNS, HTTP status, redirect destination, `X-Frame-Options`, and CSP framing directives. It never labels playback as working.

Browser verification remains a manual checklist:

1. Load one representative movie and one TV episode from the application origin.
2. Confirm the iframe renders and a short segment starts.
3. Confirm fullscreen and manual source switching.
4. For progress-capable providers, capture and validate origin-locked events.
5. Update the registry verification record and promote the status separately.

The user owns browser QA. Implementation verification is limited to focused static checks and provider-module tests; no production build is required.

## Tests

- Registry validation rejects invalid declarations.
- Enabled providers are sorted by rank and capped at eight.
- Candidate and disabled providers never appear in selector results.
- Unknown or disabled saved IDs resolve to VidCore.
- Movie and TV URL builders encode identifiers and parameters correctly.
- CineSrc retains its query-based TV route.
- Resume parameters compose correctly with existing query strings.
- Progress adapters reject incorrect origins and malformed payloads.

## Research basis

The provider decisions come from [`docs/research/provider-candidates-2026-07-14.md`](../../research/provider-candidates-2026-07-14.md). The report distinguishes documentation and HTTP reachability from playback confirmation.

## Non-goals

- Automatic failover or provider health requests from end-user browsers.
- A provider administration UI or remote database.
- Paid, credentialed, or domain-whitelisted providers.
- Claims about content availability, uptime, legality, ads, or playback beyond observed evidence.
