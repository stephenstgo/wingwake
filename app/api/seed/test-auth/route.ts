import { NextResponse } from 'next/server'
import { convexClient, api } from '@/lib/convex/server'

/**
 * @deprecated This route was for testing Supabase Auth
 * With Convex Auth, authentication is handled automatically
 * Use the Convex dashboard or check profile queries directly
 */
export async function GET() {
  try {
    // Get current user profile from Convex
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    
    if (!profile) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: 'No Convex profile found. Sign in to create a profile.'
      }, { status: 401 })
    }
    
    return NextResponse.json({
      authenticated: true,
      profileId: profile._id,
      email: profile.email,
      fullName: profile.fullName,
      role: profile.role,
      message: 'Convex Auth is working. Profile found via getCurrentUserProfile query.'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      note: 'This endpoint is deprecated. Use Convex queries directly.'
    }, { status: 500 })
  }
}
