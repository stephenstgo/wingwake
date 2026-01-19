'use server'

import { convexClient, api } from '@/lib/convex/server'
import { revalidatePath } from 'next/cache'
import type { UpdateProfile } from '@/lib/types/database'
import { Id } from '@/convex/_generated/dataModel'

/**
 * Get the current user's profile
 */
export async function getUserProfile() {
  try {
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    
    if (!profile) {
      return { error: 'Not authenticated' };
    }

    return { profile: {
      id: profile._id,
      email: profile.email,
      full_name: profile.fullName,
      role: profile.role,
      created_at: new Date(profile.createdAt).toISOString(),
      updated_at: new Date(profile.updatedAt).toISOString(),
    } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to get profile' };
  }
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(updates: UpdateProfile) {
  try {
    // Get current profile
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    
    if (!profile) {
      return { error: 'Not authenticated' };
    }

    // Update profile
    await convexClient.mutation(api["mutations/profiles"].updateProfile, {
      id: profile._id,
      email: updates.email,
      fullName: updates.full_name,
      role: updates.role as any,
    });

    revalidatePath('/dashboard/account');
    
    // Fetch updated profile
    const updated = await convexClient.query(api["queries/profiles"].getProfile, {
      id: profile._id,
    });

    return { profile: updated ? {
      id: updated._id,
      email: updated.email,
      full_name: updated.fullName,
      role: updated.role,
      created_at: new Date(updated.createdAt).toISOString(),
      updated_at: new Date(updated.updatedAt).toISOString(),
    } : null };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to update profile' };
  }
}

/**
 * Update the user's password
 * Note: With Convex Auth, password updates are handled by the auth provider
 * This function is kept for compatibility but may need to be implemented differently
 */
export async function updatePassword(currentPassword: string, newPassword: string) {
  // TODO: Implement password update with Convex Auth
  // Convex Auth Password provider should have a password update method
  return { error: 'Password update not yet implemented with Convex Auth' };
}
