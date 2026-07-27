# Vercel Hobby Usage Runbook

Spicy TV is expected to serve a small number of people. Large request counts or repeated uncached catalog pages should be treated as automation or a client request loop.

## Healthy baseline

- Movie and TV detail pages return a cache hit on an immediate repeat request.
- TMDB API GET routes return a cache hit on an immediate repeat request.
- Fast Origin Transfer remains below 2 GB per full day.
- Fluid Active CPU remains below 30 minutes per day.
- No single dynamic route has a request count that is implausible for the known users.

These thresholds are investigation triggers, not guarantees. Vercel's Hobby allowance is the final hard cap.

## Weekly check

In the `tv-spicy` Vercel project:

1. Open **Observability → Fast Data Transfer** and sort by route.
2. Confirm `/movie/[movie]` and `/tv/[tv]` are no longer dominating transfer.
3. Open **Observability → Functions** and sort by invocations, then duration.
4. Inspect any public route with thousands of function invocations.
5. Open **Firewall → Observability** and review rate-limited, challenged, and denied traffic.
6. Open team **Usage** and compare Fast Origin Transfer and Fluid Active CPU with the healthy baseline.

Runtime logs on Hobby retain only the most recent hour. Use them for a currently failing route, not long-term traffic accounting.

## Cache spot check

Run each command twice. The first response may be a miss; the second should be a hit.

```bash
curl -sS -D - -o /dev/null https://spicy-tv.vercel.app/movie/550
curl -sS -D - -o /dev/null https://spicy-tv.vercel.app/movie/550

curl -sS -D - -o /dev/null https://spicy-tv.vercel.app/tv/1399
curl -sS -D - -o /dev/null https://spicy-tv.vercel.app/tv/1399

curl -sS -D - -o /dev/null \
  'https://spicy-tv.vercel.app/api/tmdb/search?query=batman&page=1'
curl -sS -D - -o /dev/null \
  'https://spicy-tv.vercel.app/api/tmdb/search?query=batman&page=1'
```

On Vercel, inspect `x-vercel-cache`. Locally after `next build && next start`, inspect `x-nextjs-cache`.

## Firewall configuration

- Bot Protection Managed Ruleset: `Challenge`
- AI Bots Managed Ruleset: `Deny`
- Custom rate-limit match: request path starts with `/api/tmdb/`
- Counting key: source IP
- Fixed window: 60 seconds
- Request limit: 60
- Exceeded action: HTTP `429`

The API rule deliberately excludes pages, static assets, auth endpoints, and third-party playback URLs.

## Incident response

### Detail pages are misses

1. Confirm the current production deployment includes the ISR change.
2. Check whether the response has `private, no-cache, no-store`.
3. Inspect recent changes for `cookies()`, `headers()`, `connection()`, an uncached fetch, or `dynamic = 'force-dynamic'` in the route tree.
4. Reproduce with a production build locally before changing code.

### One API path is spiking

1. Inspect the route in Observability and Runtime Logs.
2. Check Firewall Observability for a concentrated IP, country, bot, or user agent.
3. Confirm the WAF rate-limit rule is published.
4. Check client code for an effect loop, polling interval, repeated query invalidation, or automatic pagination.

### Legitimate users receive `429`

1. Confirm the browser is not making a request loop.
2. Review the source in Firewall Observability.
3. Increase the limit modestly only if the requests represent normal interaction.
4. Do not disable the rule solely to accommodate a broken client loop.

### Usage exceeds the baseline

Use the route-level view to distinguish:

- High Fast Data Transfer with cache hits: large responses or real/bot readership.
- High Fast Origin Transfer: cache misses or dynamic rendering.
- High Function invocations: uncached API/page traffic.
- High Fluid Active CPU: expensive rendering, database work, retries, or slow upstream calls.

Do not add per-request database logging as a first response; that increases function and storage usage during an attack.
