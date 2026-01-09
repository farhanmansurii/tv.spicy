# Database Setup Guide

## Prerequisites

1. Vercel account (for Vercel Postgres)
2. Prisma CLI installed (`npm install -g prisma` or use `npx`)

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard
2. Navigate to your project → Storage tab
3. Click "Create Database" → Select "Postgres"
4. Choose a name and region
5. Copy the connection strings provided

## Step 2: Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

Update the `DATABASE_URL` with your Vercel Postgres connection string:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

## Step 3: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# Or if you prefer to push schema directly (for development)
npx prisma db push
```

## Step 4: Verify Database Connection

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

## Step 5: Deploy to Production

When deploying to Vercel:

1. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

2. Run migrations in production:
   ```bash
   npx prisma migrate deploy
   ```

## Database Schema

The database includes the following tables:

- **users** - User accounts (managed by NextAuth)
- **accounts** - OAuth account connections
- **sessions** - User sessions
- **watchlist** - User's watchlist items
- **recently_watched** - Recently watched episodes
- **favorites** - User's favorite media
- **recent_searches** - Search history

## Migration from Local Storage

When a user signs in for the first time, their local data (localStorage/IndexedDB) will automatically sync to the database. This happens in the `AuthSync` component.

## Troubleshooting

### Connection Issues

- Verify `DATABASE_URL` is correct
- Check if database is paused (Vercel Postgres free tier doesn't pause)
- Ensure SSL mode is set: `?sslmode=require`

### Migration Errors

- Make sure Prisma schema matches your database
- Try `npx prisma db push` for development
- Use `npx prisma migrate reset` to reset (⚠️ deletes all data)

### Type Errors

- Run `npx prisma generate` after schema changes
- Restart your TypeScript server
