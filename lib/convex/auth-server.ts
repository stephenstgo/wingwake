// Server-side Convex Auth helpers
import { convexClient, api } from './server';
import { auth } from '../../convex/auth';

/**
 * Get the current authenticated user from Convex Auth
 * Returns null if not authenticated
 */
export async function getConvexAuthUser() {
  try {
    // Note: Convex Auth server-side is experimental
    // For now, we'll use a query to check auth state
    // This is a simplified approach - in production you'd use proper middleware
    return null; // Placeholder - will be implemented with proper Convex Auth middleware
  } catch (error) {
    console.error('Error getting Convex auth user:', error);
    return null;
  }
}

/**
 * Ensure a Convex profile exists for the current auth user
 */
export async function ensureAuthProfile() {
  try {
    const profileId = await convexClient.mutation(api["mutations/profiles"].syncAuthProfile, {});
    return profileId;
  } catch (error) {
    console.error('Error syncing auth profile:', error);
    return null;
  }
}
