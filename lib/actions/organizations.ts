'use server'

import { convexClient, api } from '@/lib/convex/server'
import { getUserOrganizations, createOrganization, addMemberToOrganization, getOrganizationMembers, removeMemberFromOrganization } from '@/lib/db/organizations'
import type { OrganizationType } from '@/lib/types/database'
import { Id } from '@/convex/_generated/dataModel'

/**
 * Finds an existing organization by name for the current user, or creates a new one if it doesn't exist.
 * If a new organization is created, the user is automatically added as an owner.
 */
export async function findOrCreateOrganization(
  organizationName: string,
  type: OrganizationType = 'individual'
): Promise<string | null> {
  if (!organizationName || organizationName.trim() === '') {
    return null
  }

  try {
    // Get current user profile
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    
    if (!profile) {
      throw new Error('Authentication required');
    }

    // Get user's existing organizations
    const userOrgs = await getUserOrganizations(profile._id);
    
    // Check if an organization with this name already exists for the user
    const existingOrg = userOrgs.find(org => 
      org.name.toLowerCase().trim() === organizationName.toLowerCase().trim()
    );

    if (existingOrg) {
      return existingOrg.id;
    }

    // Organization doesn't exist, create it
    const newOrg = await createOrganization({
      name: organizationName.trim(),
      type,
    });

    if (!newOrg) {
      throw new Error('Failed to create organization');
    }

    // Add the user as an owner of the newly created organization
    await addMemberToOrganization(newOrg.id, profile._id, 'owner');

    return newOrg.id;
  } catch (error) {
    console.error('Error in findOrCreateOrganization:', error);
    throw error;
  }
}

export async function createOrganizationAction(data: { name: string; type: OrganizationType }) {
  try {
    // Get current user profile
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    
    if (!profile) {
      throw new Error('Authentication required');
    }

    const org = await createOrganization({
      name: data.name.trim(),
      type: data.type,
    });

    if (!org) {
      throw new Error('Failed to create organization');
    }

    // Add the user as an owner of the newly created organization
    await addMemberToOrganization(org.id, profile._id, 'owner');

    return org;
  } catch (error) {
    console.error('Error in createOrganizationAction:', error);
    throw error;
  }
}

export async function inviteUserToOrganizationAction(
  organizationId: string,
  email: string,
  role: 'owner' | 'manager' | 'member' = 'member'
) {
  try {
    // Get current user profile
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    
    if (!profile) {
      throw new Error('Authentication required');
    }

    // Find user by email in profiles
    const targetProfile = await convexClient.query(api["queries/profiles"].getProfileByEmail, {
      email: email.toLowerCase(),
    });
    
    if (!targetProfile) {
      throw new Error(`User with email ${email} not found. They must sign up first.`);
    }

    // Add user to organization
    const member = await addMemberToOrganization(organizationId, targetProfile._id, role);

    if (!member) {
      throw new Error('Failed to add user to organization');
    }

    return member;
  } catch (error) {
    console.error('Error in inviteUserToOrganizationAction:', error);
    throw error;
  }
}

export async function removeUserFromOrganizationAction(
  organizationId: string,
  userId: string
) {
  try {
    // Get current user profile
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    
    if (!profile) {
      throw new Error('Authentication required');
    }

    const result = await removeMemberFromOrganization(organizationId, userId as Id<"profiles">);

    if (!result) {
      throw new Error('Failed to remove user from organization');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in removeUserFromOrganizationAction:', error);
    throw error;
  }
}
