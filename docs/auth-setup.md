# Authentication Setup Guide

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://spicy-tv.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Getting OAuth Credentials

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set Application type to "Web application"
6. Add authorized redirect URI: `https://spicy-tv.vercel.app/api/auth/callback/google`
7. Copy the Client ID and Client Secret

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: SpicyTV
   - Homepage URL: `https://spicy-tv.vercel.app`
   - Authorization callback URL: `https://spicy-tv.vercel.app/api/auth/callback/github`
4. Copy the Client ID and Client Secret

### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32

## Features

- OAuth authentication with Google and GitHub
- JWT-based sessions (no database required)
- Protected routes (middleware)
- User profile page with stats
- Sync with existing watchlist and recents
- Beautiful sign-in page
- User menu in header
