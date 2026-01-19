import { NextResponse } from 'next/server'

/**
 * @deprecated This route was for seeding flights in Supabase
 * Use /api/seed/example-data instead for Convex seeding
 */
export async function POST() {
  return NextResponse.json({
    error: 'This endpoint is deprecated',
    message: 'Use /api/seed/example-data instead for Convex data seeding',
    newEndpoint: '/api/seed/example-data',
  }, { status: 410 }) // 410 Gone
}
