// Helper to ensure a Convex profile exists for a Convex Auth user
// This is now primarily used for migration purposes
import { convexClient, api } from '@/lib/convex/server';
import { getConvexProfileId } from './profile-utils';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Ensures a Convex profile exists for a given user ID
 * This is a legacy function for migration - new users should use syncAuthProfile
 * 
 * @deprecated Use syncAuthProfile mutation instead for new users
 */
export async function ensureConvexProfile(userId: string): Promise<Id<"profiles"> | null> {
  // Check if profile already exists
  let convexProfileId = await getConvexProfileId(userId);
  
  if (convexProfileId) {
    return convexProfileId;
  }
  
  // Profile doesn't exist, create a minimal one
  // This is for migration purposes only
  try {
    const profileId = await convexClient.mutation(api["mutations/profiles"].createProfile, {
      supabaseUserId: userId, // Keep for migration reference
      email: undefined,
      fullName: undefined,
      role: 'viewer',
    });
    
    return profileId;
  } catch (error) {
    console.error('Error creating Convex profile:', error);
    return null;
  }
}
