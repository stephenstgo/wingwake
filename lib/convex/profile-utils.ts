// Utility functions to convert between Supabase user IDs and Convex profile IDs
import { convexClient, api } from '@/lib/convex/server';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Get the Convex profile ID from a Supabase user ID
 * This is needed during migration when we still use Supabase auth
 */
export async function getConvexProfileId(supabaseUserId: string): Promise<Id<"profiles"> | null> {
  try {
    const profile = await convexClient.query(api["queries/profiles"].getProfileBySupabaseUserId, {
      supabaseUserId,
    });
    
    return profile?._id || null;
  } catch (error) {
    console.error('Error getting Convex profile ID:', error);
    return null;
  }
}
