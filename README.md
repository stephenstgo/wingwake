This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project ([Sign up here](https://supabase.com))

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to your project settings → API
   - Copy your project URL and anon/public key

3. **Configure environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Authentication

This project includes full authentication setup with Supabase:

- **Sign Up**: `/signup` - Create a new account with email/password, Google OAuth, or Apple OAuth
- **Sign In**: `/login` - Sign in to your account with email/password, Google, or Apple
- **Dashboard**: `/dashboard` - Protected route that requires authentication
- **Auth Callback**: `/auth/callback` - Handles OAuth redirects

### Features

- Email/password authentication
- Google OAuth authentication
- Apple OAuth authentication (Sign in with Apple)
- Protected routes with middleware
- Client-side auth state management
- Server-side session handling

### Supabase Setup

1. In your Supabase project, enable the authentication providers you want to use:
   - Go to Authentication → Providers
   - Enable Email provider (enabled by default)
   - Enable Google provider if you want OAuth (requires OAuth credentials)
   - Enable Apple provider if you want OAuth (requires Apple Developer credentials)

2. For Google OAuth:
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
   - Add authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Add your credentials to Supabase Authentication → Providers → Google

3. For Apple OAuth:
   - You need an Apple Developer account (paid membership required)
   - Create a Service ID in [Apple Developer Portal](https://developer.apple.com/account/)
   - Create a Key with Sign in with Apple enabled
   - Configure your Service ID with the redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
   - Add your credentials to Supabase Authentication → Providers → Apple
   - See [Supabase Apple OAuth guide](https://supabase.com/docs/guides/auth/social-login/auth-apple) for detailed instructions

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
