# Better Auth Magic Link - How It Works

## Overview

Magic Link authentication allows users to sign in by clicking a link sent to their email address, eliminating the need for passwords. Better Auth handles the token generation, storage, and verification automatically.

## How Magic Link Works - Step by Step

### **Step 1: User Requests Magic Link**
- User enters their email address on the sign-in page
- Client calls `signIn.magicLink({ email: "[email protected]" })`
- This sends a POST request to `/api/auth/sign-in/magic-link`

### **Step 2: Server Generates Token**
- Better Auth generates a unique, secure token
- Token is stored in the `Verification` table with:
  - `identifier`: User's email address
  - `value`: The generated token (can be hashed or plain)
  - `expiresAt`: Expiration timestamp (default: 5 minutes)
- Token is associated with the email address

### **Step 3: Email is Sent**
- Better Auth calls your `sendMagicLink` function
- You receive:
  - `email`: User's email address
  - `token`: The generated token
  - `url`: Pre-built verification URL (e.g., `https://spicy-tv.vercel.app/api/auth/verify-magic-link?token=abc123`)
- You send an email to the user with the magic link

### **Step 4: User Clicks Magic Link**
- User receives email and clicks the magic link
- Link points to: `/api/auth/verify-magic-link?token=abc123`
- Browser navigates to this URL

### **Step 5: Token Verification**
- Better Auth receives the verification request
- It looks up the token in the `Verification` table
- Validates:
  - Token exists
  - Token hasn't expired
  - Token matches the email
- If valid, creates/updates user session

### **Step 6: User Authentication**
- If user exists: Signs them in and creates a session
- If user doesn't exist (and `disableSignUp: false`): Creates new user account and signs them in
- Session cookie is set in the browser
- User is redirected to `callbackURL` (or default route)

### **Step 7: Token Cleanup**
- Used token is deleted from the `Verification` table
- One-time use: Token cannot be reused

## Database Schema

Magic Link uses the existing `Verification` table:

```prisma
model Verification {
  id         String   @id @default(cuid())
  identifier String   // Email address
  value      String   // The magic link token
  expiresAt  DateTime // Expiration time
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verification")
}
```

## Security Features

1. **Token Expiration**: Default 5 minutes (configurable)
2. **One-Time Use**: Tokens are deleted after successful verification
3. **Token Hashing**: Optional token hashing for additional security
4. **Email Verification**: Only the email recipient can use the link
5. **Rate Limiting**: Better Auth can limit requests per email/IP

## Configuration Options

- **`expiresIn`**: Token expiration time in seconds (default: 300)
- **`disableSignUp`**: Prevent new user registration via magic link (default: false)
- **`generateToken`**: Custom token generation function
- **`storeToken`**: How to store token (`"plain"`, `"hashed"`, or custom)

## Implementation Steps

### 1. Install Email Service (if not already installed)
```bash
npm install resend  # or nodemailer, sendgrid, etc.
```

### 2. Configure Server (`lib/auth.ts`)
```typescript
import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/db/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }, ctx) => {
        // Send email using your email service
        // Example with Resend:
        await resend.emails.send({
          from: '[email protected]',
          to: email,
          subject: 'Sign in to Spicy TV',
          html: `<a href="${url}">Click here to sign in</a>`,
        });
      },
      expiresIn: 600, // 10 minutes
      disableSignUp: false, // Allow new users
    }),
  ],
  // ... other config
});
```

### 3. Configure Client (`lib/auth-client.ts`)
```typescript
import { createAuthClient } from 'better-auth/react';
import { magicLinkClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL,
  basePath: '/api/auth',
  plugins: [
    magicLinkClient(),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
```

### 4. Update Sign-In UI
```typescript
// In sign-in page component
const handleMagicLinkSignIn = async (email: string) => {
  const result = await signIn.magicLink({
    email,
    callbackURL: '/',
    newUserCallbackURL: '/welcome',
  });

  if (result.error) {
    toast.error(result.error.message);
  } else {
    toast.success('Check your email for the magic link!');
  }
};
```

### 5. Handle Verification (Automatic)
- Better Auth automatically handles `/api/auth/verify-magic-link` route
- No additional code needed - it's handled by the plugin

## Flow Diagram

```
User → Enter Email → Client calls signIn.magicLink()
  ↓
Server → Generate Token → Store in DB → Call sendMagicLink()
  ↓
Email Service → Send Email with Link
  ↓
User → Click Link → Navigate to /api/auth/verify-magic-link?token=xxx
  ↓
Server → Verify Token → Create Session → Redirect to callbackURL
  ↓
User → Authenticated ✅
```

## Advantages Over Password Auth

1. **No Password Management**: Users don't need to remember passwords
2. **Better Security**: No password leaks, no weak passwords
3. **Simpler UX**: One-click sign-in
4. **Email Verification**: Built-in email verification
5. **Reduced Support**: No password reset flows needed

## Considerations

1. **Email Delivery**: Must have reliable email service
2. **Email Spam**: Magic links might go to spam folder
3. **No Offline Access**: Requires internet connection
4. **Email Access**: User must have access to their email
