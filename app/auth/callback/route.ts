import { NextResponse } from 'next/server'

// OAuth callback handler for Convex Auth
// Convex Auth handles OAuth callbacks automatically via ConvexAuthProvider
// This route is kept for compatibility but may not be needed for password auth

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/dashboard'

  // Convex Auth handles OAuth callbacks automatically
  // For password auth, this route is not used
  // Redirect to the intended destination
  return NextResponse.redirect(`${origin}${next}`)
}
