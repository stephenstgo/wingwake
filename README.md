This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Convex account and project ([Sign up here](https://convex.dev))

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Convex:**
   - Create a new project at [convex.dev](https://convex.dev)
   - Run `npx convex dev` to initialize your Convex project
   - Copy your deployment URL from the output

3. **Configure environment variables:**
   ```bash
   cp env.example .env.local
   ```
   Then edit `.env.local` and add your Convex deployment URL:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

4. **Set up the database:**
   - The Convex schema is defined in `convex/schema.ts`
   - Run `npx convex dev` to sync your schema
   - Use the Convex dashboard to view your data
   - See `CONVEX_SETUP_COMPLETE.md` for detailed setup instructions

5. **Run the development servers:**

   In separate terminals:
   ```bash
   # Terminal 1: Convex dev server
   npm run convex:dev
   
   # Terminal 2: Next.js dev server
   npm run dev
   ```

   Or use the combined command:
   ```bash
   npm run dev:all
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Authentication

This project uses Convex Auth for authentication:

- **Sign Up**: `/signup` - Create a new account with email/password
- **Sign In**: `/login` - Sign in to your account with email/password
- **Dashboard**: `/dashboard` - Protected route that requires authentication

### Features

- Email/password authentication via Convex Auth
- Protected routes with middleware
- Client-side auth state management with React hooks
- Server-side session handling

### Convex Auth Setup

1. Convex Auth is configured in `convex/auth.ts`
2. The Password provider is enabled by default
3. **Required**: Set up JWT keys for authentication:
   ```bash
   # Generate JWT keys
   node generateKeys.mjs
   # Then set them in Convex Dashboard → Settings → Environment Variables
   # See docs/CONVEX_AUTH_SETUP.md for detailed instructions
   ```
3. User profiles are automatically synced with Convex Auth identities
4. See `CONVEX_SETUP_COMPLETE.md` for detailed authentication setup

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Ferry Flight Tracking System

This application includes a comprehensive ferry flight tracking system for managing unairworthy aircraft movements. See `docs/FERRY_FLIGHT_SYSTEM.md` for detailed documentation.

### Key Features

- **Ferry Flight Workflow** - Track flights from draft through completion
- **Discrepancy Management** - Document unairworthy conditions
- **Mechanic Sign-offs** - Digital safety assessments
- **FAA Permit Tracking** - Monitor permit applications and approvals
- **Document Management** - Centralized file storage with Convex Storage
- **Role-Based Access Control** - Owner, Mechanic, Pilot, Admin roles
- **Audit Logging** - Complete compliance trail

### Database Schema

The system uses Convex (document database) with:
- 11 core tables for ferry flight data
- Query-level authorization for data isolation
- Automated mutations for status validation and audit logging
- Helper functions for common operations

### API Usage

```typescript
import { 
  createFerryFlight, 
  createDiscrepancy, 
  createSignoff,
  submitPermit 
} from '@/lib/db'

// Create a ferry flight
const flight = await createFerryFlight({...})

// Add discrepancies
await createDiscrepancy({...})

// Mechanic sign-off
await createSignoff({...})

// Submit FAA permit
await submitPermit(permitId, 'email')
```

See `docs/FERRY_FLIGHT_SYSTEM.md` for complete API documentation.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Convex Documentation](https://docs.convex.dev) - learn about Convex backend features.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

**Note:** Make sure to:
1. Deploy your Convex backend: `npx convex deploy`
2. Set the `NEXT_PUBLIC_CONVEX_URL` environment variable in Vercel
3. Configure Convex Auth for production
