import { NextResponse } from 'next/server'
import { convexClient, api } from '@/lib/convex/server'
import { Id } from '@/convex/_generated/dataModel'

/**
 * @deprecated This route was for testing Supabase INSERT operations
 * With Convex, use mutations instead. This is kept for reference.
 */
export async function POST() {
  try {
    // Get current user profile
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    
    if (!profile) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: 'No Convex profile found'
      }, { status: 401 })
    }
    
    // Test creating an organization via Convex mutation
    const testOrgName = `Test Org ${Date.now()}`
    
    const orgId = await convexClient.mutation(api["mutations/organizations"].createOrganization, {
      name: testOrgName,
      type: 'individual',
    });
    
    // Test adding member
    const memberId = await convexClient.mutation(api["mutations/organizations"].addMemberToOrganization, {
      organizationId: orgId,
      userId: profile._id,
      role: 'owner',
    });
    
    return NextResponse.json({
      success: true,
      message: 'Convex mutations working correctly',
      testOrganizationId: orgId,
      testMemberId: memberId,
      note: 'This endpoint is deprecated. Use Convex mutations directly in your code.'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      note: 'This endpoint is deprecated. Use Convex mutations directly.'
    }, { status: 500 })
  }
}
