# Hobby Usage Guardrails Design

## Objective

Keep Spicy TV publicly browsable while reducing the likelihood that automated or runaway traffic exhausts Vercel Hobby allowances. Preserve normal use for a small group of people and make the routes responsible for compute and transfer visible using free Vercel tooling.

The system cannot guarantee indefinite availability under unlimited legitimate traffic. Vercel pauses Hobby projects after included usage is exhausted. The design therefore minimizes work per request and rejects abnormal traffic before it reaches application compute.

## Current Evidence

- The July 22 optimization reduced daily Fast Origin Transfer from roughly 4.4 GB to 1.2–1.8 GB on subsequent full days while Fast Data Transfer remained around 5–6 GB per day.
- The homepage is served as a Vercel cache hit.
- Repeated TMDB API requests transition from `MISS` to `HIT`.
- Repeated movie detail requests remain `MISS` and return `Cache-Control: private, no-cache, no-store`.
- Approximately 763,000 edge requests in six days is not consistent with ordinary use by two to four people and indicates automated traffic or a request loop.
- Vercel Hobby includes Observability, one WAF rate-limit rule per project, Bot Protection, AI Bot controls, and one hour of runtime-log retention.

## Architecture

### 1. Cache public detail pages

Movie and TV detail pages contain public catalog data and must not depend on cookies, headers, sessions, or other request-specific state during server rendering.

The implementation will identify the dynamic dependency that prevents full-route caching and isolate any personalized behavior into client-side requests. Public detail HTML and React Server Component responses should then be reusable at the edge.

Success signal:

1. The first request to an uncached detail URL may return `MISS`.
2. A repeated request to the same URL returns `HIT`.
3. The response no longer uses `private, no-cache, no-store`.
4. Signed-out browsing, metadata, related titles, seasons, and playback-provider navigation continue to work.

TMDB data caches remain explicit and use their existing revalidation windows. A failed upstream request must time out and must not leave background work running.

### 2. Reject abnormal traffic at Vercel's firewall

Firewall changes are configured in the Vercel dashboard rather than application middleware so rejected requests do not invoke Next.js functions.

The production project will use:

- Bot Protection Managed Ruleset in `Challenge` mode.
- AI Bots Managed Ruleset in `Deny` mode.
- One Hobby custom rate-limit rule matching request paths beginning with `/api/tmdb/`.
- A fixed window of 60 requests per IP per 60 seconds.
- A `429` response after the threshold.

The API limit is intentionally generous for ordinary interactive browsing while bounding scrapers and client loops. Static assets, page navigation, authentication, and playback-provider URLs are outside this rule.

The firewall configuration will first be checked against recent traffic. If Vercel supports a non-blocking log mode for the configured rule without consuming the sole rule twice, it may be observed briefly before switching to `429`; otherwise the documented threshold is applied directly and validated with normal browsing.

### 3. Use free platform telemetry

No persistent application request counter will be added. A counter stored in Postgres or another service would cause every abusive request to consume function and storage resources, while middleware logging cannot observe requests served directly from cache.

Operational tracking uses:

- Project Observability → Functions: rank routes by invocations and duration.
- Project Observability → Networking: rank paths by Fast Origin Transfer and Fast Data Transfer.
- Firewall Observability: inspect rate-limited, challenged, and denied traffic by IP, path, country, and rule.
- Runtime Logs: investigate current failures during the one-hour Hobby retention window.
- Team Usage: compare daily totals against the baseline below.

The repository will include a concise runbook describing these views, the expected healthy baseline, and what action to take when a threshold is exceeded.

## Guardrails and Thresholds

Initial operational thresholds:

- Fast Origin Transfer: investigate if a full day exceeds 2 GB after detail caching is deployed.
- Fluid Active CPU: investigate if a day exceeds 30 minutes.
- Function invocations: investigate any route whose daily count is implausible for the known user population.
- Firewall: investigate repeated rate limiting from one source or a sudden increase in challenged traffic.
- Cache verification: public catalog APIs and detail pages should produce hits on immediate repeat requests.

These are alerting heuristics, not application-enforced global daily caps. Hobby does not expose a free application API that can safely stop the project at a custom daily resource total. Vercel's own plan limit remains the final hard cap.

## Failure Behavior

- Rate-limited API clients receive HTTP `429`; public pages remain accessible.
- Suspicious browser-like automation receives Vercel's JavaScript challenge.
- Known AI crawlers are denied.
- Verified search-engine crawlers remain governed by Vercel's managed rules and `robots.txt`.
- If TMDB is unavailable, existing route error behavior remains unchanged; caching work must not cache personalized or error responses as successful catalog pages.

## Verification

### Automated repository checks

- Lint and production build pass.
- Existing provider-route tests pass using a repository-owned test command.
- Any new cache-boundary logic is tested at its public seam where practical.

### Local and production checks

- Repeated homepage, movie detail, TV detail, and representative TMDB API requests are inspected for status, cache headers, and `x-vercel-cache`.
- Normal browsing is exercised after firewall publication.
- A controlled burst over the API threshold confirms `429` without affecting page and static-asset requests.
- Vercel Firewall Observability shows the controlled rate-limit event.

Testing will avoid generating a large volume of billable traffic.

## Rollback

- Firewall rules can be changed or unpublished independently of a deployment.
- Bot Protection can be returned to log mode if legitimate browsers are challenged.
- Detail-page caching changes are isolated in the public rendering/data boundary and can be reverted without altering persisted user data.

## Out of Scope

- Requiring authentication to browse public content.
- Adding a paid logging or analytics vendor.
- Adding Cloudflare or another reverse proxy.
- Building a custom billing dashboard.
- Changing video provider traffic, which is served by third parties rather than proxied through this application.
