import { type NextRequest, NextResponse } from 'next/server'

// For now, keep simple middleware that allows public routes
// Convex Auth middleware for Next.js is experimental
// We'll handle auth checks in server components instead
export async function middleware(request: NextRequest) {
  // Allow public routes
  const publicRoutes = ['/login', '/signup', '/', '/auth']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route)
  )

  // Allow API routes for migration/seed
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/migrate') || 
                     request.nextUrl.pathname.startsWith('/api/seed')

  if (isPublicRoute || isApiRoute) {
    return NextResponse.next()
  }

  // For protected routes, we'll check auth in the server components
  // This is a simplified approach - in production you'd use Convex Auth middleware
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
