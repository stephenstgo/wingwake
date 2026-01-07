// Script to delete example ferry flights data
// This removes all data created by the seed script

import { createClient } from '@/lib/supabase/server'

export async function deleteExampleFlights(userId: string) {
  const supabase = await createClient()
  
  // Verify user exists
  if (!userId) {
    throw new Error('User ID is required')
  }
  
  // List of example organization names from seed script
  const exampleOrgNames = [
    'Skyward Aviation LLC',
    'Southwest Aircraft Sales',
    'East Coast Aviation Services',
    'Global Aircraft Exports Inc.',
    'Aircraft Storage Solutions',
    'Aviation Maintenance Group',
    'Aircraft Weighing Services',
    'Flight Operations LLC',
    'Inspection Services Inc.',
  ]
  
  // List of example N-numbers from seed script
  const exampleNNumbers = [
    'N12345',
    'N67890',
    'N11111',
    'N22222',
    'N24680',
    'N13579',
    'N33333',
    'N98765',
    'N54321',
  ]
  
  let deletedFlights = 0
  let deletedAircraft = 0
  let deletedOrgs = 0
  
  try {
    // 1. Delete ferry flights that belong to example organizations
    // First, get the organization IDs
    // Note: This SELECT might be blocked by RLS if user isn't a member
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .in('name', exampleOrgNames)
    
    if (orgsError) {
      console.error('Error fetching organizations:', orgsError)
      // If SELECT is blocked, try to delete by name pattern or use a different approach
      if (orgsError.code === '42501' || orgsError.message?.toLowerCase().includes('row-level security')) {
        throw new Error(`Cannot access organizations due to RLS. You may need to be a member of the organizations to delete them. Error: ${orgsError.message}`)
      }
      throw new Error(`Failed to fetch organizations: ${orgsError.message}`)
    }
    
    if (!orgs || orgs.length === 0) {
      // No example organizations found - nothing to delete
      return {
        flights: 0,
        aircraft: 0,
        organizations: 0,
      }
    }
    
    if (orgs && orgs.length > 0) {
      const orgIds = orgs.map(org => org.id)
      
      // Count flights before deletion
      const { count: flightsCountBefore } = await supabase
        .from('ferry_flights')
        .select('*', { count: 'exact', head: true })
        .in('owner_id', orgIds)
      
      // Delete flights
      const { error: flightsError } = await supabase
        .from('ferry_flights')
        .delete()
        .in('owner_id', orgIds)
      
      if (flightsError) {
        console.error('Error deleting flights:', flightsError)
        throw new Error(`Failed to delete flights: ${flightsError.message}`)
      }
      
      deletedFlights = flightsCountBefore || 0
    }
    
    // 2. Count aircraft before deletion
    const { count: aircraftCountBefore } = await supabase
      .from('aircraft')
      .select('*', { count: 'exact', head: true })
      .in('n_number', exampleNNumbers)
    
    // Delete aircraft with example N-numbers
    const { error: aircraftError } = await supabase
      .from('aircraft')
      .delete()
      .in('n_number', exampleNNumbers)
    
    if (aircraftError) {
      console.error('Error deleting aircraft:', aircraftError)
      throw new Error(`Failed to delete aircraft: ${aircraftError.message}`)
    }
    
    deletedAircraft = aircraftCountBefore || 0
    
    // 3. Delete organizations (only if they have no remaining flights or aircraft)
    // First check if any have remaining data
    if (orgs && orgs.length > 0) {
      const orgIds = orgs.map(org => org.id)
      
      // Check for remaining flights
      const { count: remainingFlights } = await supabase
        .from('ferry_flights')
        .select('*', { count: 'exact', head: true })
        .in('owner_id', orgIds)
      
      // Check for remaining aircraft
      const { count: remainingAircraft } = await supabase
        .from('aircraft')
        .select('*', { count: 'exact', head: true })
        .in('owner_id', orgIds)
      
      // Only delete orgs if they have no remaining data
      if ((remainingFlights || 0) === 0 && (remainingAircraft || 0) === 0) {
        const { error: orgsDeleteError } = await supabase
          .from('organizations')
          .delete()
          .in('id', orgIds)
        
        if (orgsDeleteError) {
          console.error('Error deleting organizations:', orgsDeleteError)
          // Don't throw - orgs might have other data
          console.warn('Could not delete some organizations - they may have other data')
        } else {
          deletedOrgs = orgs.length
        }
      } else {
        console.warn('Organizations have remaining data, not deleting them')
      }
    }
    
    return {
      flights: deletedFlights,
      aircraft: deletedAircraft,
      organizations: deletedOrgs,
    }
  } catch (error) {
    console.error('Error deleting example data:', error)
    throw error
  }
}

