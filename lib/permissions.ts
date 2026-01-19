// User Roles and Permissions System
import { convexClient, api } from '@/lib/convex/server'
import { useConvexAuth, useQuery } from 'convex/react'
import type { UserRole } from '@/lib/types/database'
import { Id } from '@/convex/_generated/dataModel'

export type Permission = 
  | 'ferry_flight:create'
  | 'ferry_flight:update'
  | 'ferry_flight:delete'
  | 'ferry_flight:view'
  | 'discrepancy:create'
  | 'discrepancy:update'
  | 'discrepancy:delete'
  | 'mechanic_signoff:create'
  | 'faa_permit:create'
  | 'faa_permit:update'
  | 'faa_permit:submit'
  | 'document:upload'
  | 'document:delete'
  | 'aircraft:create'
  | 'aircraft:update'
  | 'organization:manage'
  | 'pilot:update_status'

// Permission matrix: role -> permissions
const PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'ferry_flight:create',
    'ferry_flight:update',
    'ferry_flight:delete',
    'ferry_flight:view',
    'discrepancy:create',
    'discrepancy:update',
    'discrepancy:delete',
    'mechanic_signoff:create',
    'faa_permit:create',
    'faa_permit:update',
    'faa_permit:submit',
    'document:upload',
    'document:delete',
    'aircraft:create',
    'aircraft:update',
    'organization:manage',
    'pilot:update_status',
  ],
  owner: [
    'ferry_flight:create',
    'ferry_flight:update',
    'ferry_flight:view',
    'faa_permit:create',
    'faa_permit:update',
    'faa_permit:submit',
    'document:upload',
    'document:delete',
    'aircraft:create',
    'aircraft:update',
    'organization:manage',
  ],
  mechanic: [
    'ferry_flight:view',
    'discrepancy:create',
    'discrepancy:update',
    'discrepancy:delete',
    'mechanic_signoff:create',
    'document:upload',
  ],
  pilot: [
    'ferry_flight:view',
    'pilot:update_status',
    'document:upload',
  ],
  viewer: [
    'ferry_flight:view',
  ],
}

// Server-side: Get user role from Convex profile
export async function getUserRole(profileId?: Id<"profiles">): Promise<UserRole | null> {
  try {
    // If profileId is provided, get role directly
    if (profileId) {
      const profile = await convexClient.query(api["queries/profiles"].getProfile, {
        id: profileId,
      });
      return profile?.role || 'viewer';
    }
    
    // Otherwise, get current user profile
    const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
    return profile?.role || 'viewer';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function hasPermission(permission: Permission, profileId?: Id<"profiles">): Promise<boolean> {
  const role = await getUserRole(profileId);
  if (!role) {
    return false;
  }
  
  return PERMISSIONS[role].includes(permission);
}

export async function requirePermission(permission: Permission, profileId?: Id<"profiles">): Promise<void> {
  const has = await hasPermission(permission, profileId);
  if (!has) {
    throw new Error(`Permission denied: ${permission}`);
  }
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return PERMISSIONS[role] || [];
}

// Check if user can access a specific ferry flight
export async function canAccessFerryFlight(flightId: Id<"ferryFlights">, profileId?: Id<"profiles">): Promise<boolean> {
  try {
    const role = await getUserRole(profileId);
    if (role === 'admin') {
      return true;
    }
    
    // Get flight and check associations
    const flight = await convexClient.query(api["queries/ferryFlights"].getFerryFlight, {
      id: flightId,
    });
    
    if (!flight) {
      return false;
    }
    
    // If no profileId provided, get current user
    let currentProfileId = profileId;
    if (!currentProfileId) {
      const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
      if (!profile) return false;
      currentProfileId = profile._id;
    }
    
    // Check if user is owner (via organization)
    if (flight.ownerId) {
      const members = await convexClient.query(api["queries/organizations"].getOrganizationMembers, {
        organizationId: flight.ownerId,
      });
      if (members.some(m => m.userId === currentProfileId)) {
        return true;
      }
    }
    
    // Check if user is pilot, mechanic, or creator
    return (
      flight.pilotUserId === currentProfileId ||
      flight.mechanicUserId === currentProfileId ||
      flight.createdBy === currentProfileId
    );
  } catch (error) {
    console.error('Error checking flight access:', error);
    return false;
  }
}

// Check if user can manage an organization
export async function canManageOrganization(organizationId: Id<"organizations">, profileId?: Id<"profiles">): Promise<boolean> {
  try {
    const role = await getUserRole(profileId);
    if (role === 'admin') {
      return true;
    }
    
    // Get current profile if not provided
    let currentProfileId = profileId;
    if (!currentProfileId) {
      const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});
      if (!profile) return false;
      currentProfileId = profile._id;
    }
    
    const members = await convexClient.query(api["queries/organizations"].getOrganizationMembers, {
      organizationId,
    });
    
    const member = members.find(m => m.userId === currentProfileId);
    return member?.role === 'owner' || member?.role === 'manager';
  } catch (error) {
    console.error('Error checking organization access:', error);
    return false;
  }
}
