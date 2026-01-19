// Database helper functions for Organizations
import { convexClient, api } from '@/lib/convex/server'
import { getConvexProfileId } from '@/lib/convex/profile-utils'
import { ensureConvexProfile } from '@/lib/convex/ensure-profile'
import type { 
  Organization, 
  InsertOrganization, 
  UpdateOrganization,
  OrganizationMember 
} from '@/lib/types/database'
import { Id } from '../../convex/_generated/dataModel'

function convertOrganization(doc: any): Organization | null {
  if (!doc) return null;
  return {
    id: doc._id,
    name: doc.name,
    type: doc.type,
    created_at: new Date(doc.createdAt).toISOString(),
    updated_at: new Date(doc.updatedAt).toISOString(),
  };
}

function convertOrganizationMember(doc: any): OrganizationMember | null {
  if (!doc) return null;
  return {
    id: doc._id,
    organization_id: doc.organizationId,
    user_id: doc.userId,
    role: doc.role,
    created_at: new Date(doc.createdAt).toISOString(),
  };
}

export async function getOrganization(id: string): Promise<Organization | null> {
  try {
    const result = await convexClient.query(api["queries/organizations"].getOrganization, {
      id: id as Id<"organizations">,
    });
    return convertOrganization(result);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  try {
    // Ensure Convex profile exists, create if needed
    const convexProfileId = await ensureConvexProfile(userId);
    if (!convexProfileId) {
      return [];
    }
    
    const results = await convexClient.query(api["queries/organizations"].getUserOrganizations, {
      userId: convexProfileId,
    });
    return results.map(convertOrganization).filter((o): o is Organization => o !== null);
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return [];
  }
}

export async function createOrganization(org: InsertOrganization): Promise<Organization | null> {
  try {
    const orgId = await convexClient.mutation(api["mutations/organizations"].createOrganization, {
      name: org.name,
      type: org.type,
    });
    
    return await getOrganization(orgId);
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

export async function updateOrganization(
  id: string, 
  updates: UpdateOrganization
): Promise<Organization | null> {
  try {
    await convexClient.mutation(api["mutations/organizations"].updateOrganization, {
      id: id as Id<"organizations">,
      name: updates.name,
      type: updates.type,
    });
    
    return await getOrganization(id);
  } catch (error) {
    console.error('Error updating organization:', error);
    return null;
  }
}

export async function addMemberToOrganization(
  organizationId: string,
  userId: string,
  role: 'owner' | 'manager' | 'member' = 'member'
): Promise<OrganizationMember | null> {
  try {
    // Convert Supabase user ID to Convex profile ID
    const convexProfileId = await getConvexProfileId(userId);
    if (!convexProfileId) {
      console.error('Could not find Convex profile for Supabase user ID:', userId);
      return null;
    }
    
    const memberId = await convexClient.mutation(api["mutations/organizations"].addMemberToOrganization, {
      organizationId: organizationId as Id<"organizations">,
      userId: convexProfileId,
      role,
    });
    
    // Fetch the created member
    const members = await convexClient.query(api["queries/organizations"].getOrganizationMembers, {
      organizationId: organizationId as Id<"organizations">,
    });
    
    const member = members.find(m => m._id === memberId);
    return member ? convertOrganizationMember(member) : null;
  } catch (error) {
    console.error('Error adding member:', error);
    return null;
  }
}

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  try {
    const results = await convexClient.query(api["queries/organizations"].getOrganizationMembers, {
      organizationId: organizationId as Id<"organizations">,
    });
    return results.map(convertOrganizationMember).filter((m): m is OrganizationMember => m !== null);
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

export async function removeMemberFromOrganization(
  organizationId: string,
  userId: string
): Promise<boolean> {
  try {
    // Convert Supabase user ID to Convex profile ID
    const convexProfileId = await getConvexProfileId(userId);
    if (!convexProfileId) {
      console.error('Could not find Convex profile for Supabase user ID:', userId);
      return false;
    }
    
    await convexClient.mutation(api["mutations/organizations"].removeMemberFromOrganization, {
      organizationId: organizationId as Id<"organizations">,
      userId: convexProfileId,
    });
    return true;
  } catch (error) {
    console.error('Error removing member:', error);
    return false;
  }
}
