import { NextResponse } from 'next/server'
import { convexClient, api } from '@/lib/convex/server'

/**
 * @deprecated This route was for testing Supabase RLS (Row Level Security) policies
 * Convex doesn't use RLS - authorization is handled in query/mutation logic
 * This endpoint is kept for reference but tests Convex queries instead
 */
export async function GET() {
  try {
    // Get current user profile
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    
    if (!profile) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const tests = {
      canViewOwnProfile: false,
      canViewOwnOrganizations: false,
      canViewOwnFlights: false,
      note: 'Convex uses query-level authorization instead of RLS'
    }

    // Test 1: Can view own profile
    const ownProfile = await convexClient.query(api["queries/profiles"].getProfile, {
      id: profile._id,
    });
    tests.canViewOwnProfile = !!ownProfile;

    // Test 2: Can view own organizations
    const userOrgs = await convexClient.query(api["queries/organizations"].getUserOrganizations, {
      userId: profile._id,
    });
    tests.canViewOwnOrganizations = Array.isArray(userOrgs);

    // Test 3: Can view own flights
    const userFlights = await convexClient.query(api["queries/ferryFlights"].getUserFerryFlights, {
      userId: profile._id,
    });
    tests.canViewOwnFlights = Array.isArray(userFlights);

    return NextResponse.json({
      authenticated: true,
      profileId: profile._id,
      tests,
      message: 'Convex queries work. Authorization is handled in query logic, not RLS policies.'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      note: 'This endpoint is deprecated. Convex doesn\'t use RLS.'
    }, { status: 500 })
  }
}
