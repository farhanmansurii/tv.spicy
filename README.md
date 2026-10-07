# Watvh

Next.js streaming app for browsing movies and TV shows via [TMDb](https://www.themoviedb.org/), with watchlist, favorites, and watch-time tracking.

**Live:** [watvh.vercel.app](https://watvh.vercel.app)

## Screenshots

![Home](https://github.com/farhanmansurii/tv.spicy/assets/74182335/193045be-dff2-4f24-b24f-27d4d63d21e6)
![Details](https://github.com/farhanmansurii/tv.spicy/assets/74182335/c4539edb-5348-421e-aa6a-448c2b0e5fe5)

## Features

- Browse movies and TV shows from the TMDb catalog (home, browse, discover, genres)
- Search titles; signed-in users keep recent search history
- Watch movies and TV shows in-app
- Library for signed-in users: watchlist, favorites, continue watching / recently watched with progress
- Auth via better-auth (Google sign-in and email magic links)
- Responsive layout for desktop and mobile

## Stack

| Area | Choice |
| --- | --- |
| App | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS 4 |
| Data | Prisma, PostgreSQL, TanStack Query |
| Client state | Zustand |
| Auth | better-auth |
| Validation | Zod |
| CI | GitHub Actions — `tsc --noEmit`, ESLint, `npm test` on Node 24 |

## Setup

### 1. Clone and install

```bash
git clone https://github.com/farhanmansurii/tv.spicy.git
cd tv.spicy
npm install
```

`postinstall` runs `prisma generate`.

### 2. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`. Full comments live in [`.env.example`](.env.example). Summary:

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_TMDB_BEARER_TOKEN` or `NEXT_PUBLIC_TMDB_API_KEY` | TMDb access (one required in production). Server-only `TMDB_BEARER_TOKEN` / `TMDB_API_KEY` aliases work too. Bearer token preferred. Get credentials at [TMDb API settings](https://www.themoviedb.org/settings/api). |
| `DATABASE_URL` | Postgres connection string (required in production for auth/library). |
| `PRISMA_DATABASE_URL` | Optional Prisma Accelerate URL; when set, takes precedence over `DATABASE_URL`. |
| `BETTER_AUTH_SECRET` or `NEXTAUTH_SECRET` | Session signing (one required in production). |
| `BETTER_AUTH_URL` / `NEXTAUTH_URL` | Auth base URL; required in production when not on Vercel (`VERCEL_URL` is used there). |
| `NEXT_PUBLIC_SITE_URL` | Optional canonical origin for metadata/sitemap. |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Optional client auth base URL. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google sign-in. |
| `RESEND_API_KEY` / `EMAIL_FROM` | Optional magic-link email. Without Resend, links are logged on the server. |

Nothing in `.env.example` is a real credential.

### 3. Database

Point `DATABASE_URL` at Postgres, then apply the schema with your usual Prisma workflow (for example `npx prisma db push` or migrations).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm test` | Run `*.test.ts` with `tsx --test` |
| `npm run lint` | ESLint |

## License

This repository does not currently include a license file.
