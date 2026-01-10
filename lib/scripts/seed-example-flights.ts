// Script to seed example ferry flights
// Run this from a server action or API route after migrations
// This script uses current flights from the database as example data

import { createClient } from '@/lib/supabase/server'
import { createOrganization, addMemberToOrganization, getUserOrganizations } from '@/lib/db/organizations'
import { createAircraft, getAircraftByOwner } from '@/lib/db/aircraft'
import { createFerryFlight, getFerryFlightsByOwner } from '@/lib/db'
import type { FerryFlight, Aircraft, Organization } from '@/lib/types/database'

export async function seedExampleFlights(userId: string) {
  const supabase = await createClient()
  
  // Verify user exists
  if (!userId) {
    throw new Error('User ID is required')
  }
  
  // Verify user has a profile (create if missing)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()
  
  if (profileError) {
    throw new Error(`Failed to check user profile: ${profileError.message || profileError.code || 'Unknown error'}`)
  }
  
  if (!profile) {
    // Create profile if it doesn't exist
    const { data: user } = await supabase.auth.getUser()
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.data.user?.email || null,
        role: 'owner'
      })
    
    if (createError) {
      throw new Error(`Failed to create user profile: ${createError.message || createError.code || 'Unknown error'}`)
    }
  }

  // Get user's current organizations
  const userOrgs = await getUserOrganizations(userId)
  
  // Get all current flights from user's organizations
  const allCurrentFlights: FerryFlight[] = []
  const allCurrentAircraft: Aircraft[] = []
  const allCurrentOrgs: Organization[] = [...userOrgs]

  for (const org of userOrgs) {
    // Get flights for this organization
    const flights = await getFerryFlightsByOwner(org.id)
    allCurrentFlights.push(...flights)
    
    // Get aircraft for this organization
    const aircraft = await getAircraftByOwner(org.id)
    allCurrentAircraft.push(...aircraft)
  }

  // If no current flights exist, fall back to creating example data
  if (allCurrentFlights.length === 0) {
    console.log('No current flights found. Creating example flights...')
    
    // Create example organizations
    const orgs = [
      { name: 'Skyward Aviation LLC', type: 'llc' as const },
      { name: 'Southwest Aircraft Sales', type: 'llc' as const },
      { name: 'East Coast Aviation Services', type: 'llc' as const },
      { name: 'Global Aircraft Exports Inc.', type: 'corporation' as const },
      { name: 'Aircraft Storage Solutions', type: 'llc' as const },
      { name: 'Aviation Maintenance Group', type: 'llc' as const },
      { name: 'Aircraft Weighing Services', type: 'llc' as const },
      { name: 'Flight Operations LLC', type: 'llc' as const },
      { name: 'Inspection Services Inc.', type: 'corporation' as const },
    ]

    const createdOrgs = []
    for (const org of orgs) {
      try {
        const { data: existing, error: checkError } = await supabase
          .from('organizations')
          .select('id')
          .eq('name', org.name)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
          if (checkError.message?.includes('infinite recursion') || checkError.code === '42P17') {
            throw new Error(`RLS recursion error when checking organization. Please run migration 009_fix_all_rls_recursion.sql. Original error: ${checkError.message}`)
          }
          if (checkError.code !== 'PGRST116') {
            console.warn(`Warning checking organization ${org.name} (will attempt to create anyway):`, checkError.message || checkError.code)
          }
        }

        let orgId: string
        if (existing) {
          orgId = existing.id
          createdOrgs.push({ id: orgId, ...org })
        } else {
          const newOrg = await createOrganization(org)
          if (!newOrg) {
            throw new Error(`Failed to create organization: ${org.name} (no data returned)`)
          }
          orgId = newOrg.id
          createdOrgs.push(newOrg)
        }

        // Add user as owner
        try {
          await addMemberToOrganization(orgId, userId, 'owner')
        } catch (memberError) {
          console.error(`Error adding member to ${org.name}:`, memberError)
        }
      } catch (error) {
        console.error(`Error processing organization ${org.name}:`, error)
        throw error
      }
    }

    // Create example aircraft
    const aircraftData = [
      { n_number: 'N12345', manufacturer: 'Cessna', model: '172N', year: 1978, owner_id: createdOrgs[0].id },
      { n_number: 'N67890', manufacturer: 'Piper', model: 'PA-28-181', year: 1985, owner_id: createdOrgs[0].id },
      { n_number: 'N11111', manufacturer: 'Cessna', model: '182T', year: 2003, owner_id: createdOrgs[3].id },
      { n_number: 'N22222', manufacturer: 'Beechcraft', model: 'Baron 58', year: 1975, owner_id: createdOrgs[4].id },
      { n_number: 'N24680', manufacturer: 'Beechcraft', model: 'Bonanza A36', year: 1990, owner_id: createdOrgs[5].id },
      { n_number: 'N13579', manufacturer: 'Mooney', model: 'M20J', year: 1988, owner_id: createdOrgs[1].id },
      { n_number: 'N33333', manufacturer: 'Piper', model: 'PA-32R', year: 1995, owner_id: createdOrgs[6].id },
      { n_number: 'N98765', manufacturer: 'Cirrus', model: 'SR22', year: 2005, owner_id: createdOrgs[7].id },
      { n_number: 'N54321', manufacturer: 'Diamond', model: 'DA40', year: 2010, owner_id: createdOrgs[8].id },
    ]

    const createdAircraft = []
    for (const ac of aircraftData) {
      try {
        const { data: existing, error: checkError } = await supabase
          .from('aircraft')
          .select('id')
          .eq('n_number', ac.n_number)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
          throw new Error(`Failed to check aircraft: ${checkError.message}`)
        }

        if (existing) {
          createdAircraft.push({ id: existing.id, ...ac })
        } else {
          const newAircraft = await createAircraft(ac)
          if (!newAircraft) {
            throw new Error(`Failed to create aircraft: ${ac.n_number}`)
          }
          createdAircraft.push(newAircraft)
        }
      } catch (error) {
        console.error(`Error processing aircraft ${ac.n_number}:`, error)
        throw error
      }
    }

    // Create example flights
    const flights = [
      { aircraft_id: createdAircraft[0].id, owner_id: createdOrgs[0].id, origin: 'KORD', destination: 'KLAX', purpose: 'Demo Ferry Flight', status: 'in_progress' as const },
      { aircraft_id: createdAircraft[1].id, owner_id: createdOrgs[0].id, origin: 'KSEA', destination: 'KPDX', purpose: 'Training Flight', status: 'in_progress' as const },
      { aircraft_id: createdAircraft[2].id, owner_id: createdOrgs[3].id, origin: 'KIAH', destination: 'CYYZ', purpose: 'Export/import delivery', status: 'in_progress' as const },
      { aircraft_id: createdAircraft[3].id, owner_id: createdOrgs[4].id, origin: 'KATL', destination: 'KPHX', purpose: 'Storage relocation', status: 'in_progress' as const },
      { aircraft_id: createdAircraft[4].id, owner_id: createdOrgs[5].id, origin: 'KJFK', destination: 'KMIA', purpose: 'Repositioning to a maintenance facility', status: 'inspection_pending' as const },
      { aircraft_id: createdAircraft[5].id, owner_id: createdOrgs[1].id, origin: 'KDFW', destination: 'KPHX', purpose: 'Delivery to new owner (domestic sale)', status: 'draft' as const },
      { aircraft_id: createdAircraft[6].id, owner_id: createdOrgs[6].id, origin: 'KDTW', destination: 'KORD', purpose: 'Weighing or modifications', status: 'draft' as const },
      { aircraft_id: createdAircraft[7].id, owner_id: createdOrgs[7].id, origin: 'KDEN', destination: 'KSLC', purpose: 'Repositioning to base', status: 'completed' as const },
      { aircraft_id: createdAircraft[8].id, owner_id: createdOrgs[8].id, origin: 'KBOS', destination: 'KBWI', purpose: 'Moving to annual inspection location', status: 'completed' as const },
    ]

    const createdFlights = []
    for (const flight of flights) {
      try {
        const { data: existing, error: checkError } = await supabase
          .from('ferry_flights')
          .select('id')
          .eq('aircraft_id', flight.aircraft_id)
          .eq('origin', flight.origin)
          .eq('destination', flight.destination)
          .maybeSingle()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`Error checking flight ${flight.origin} → ${flight.destination}:`, checkError)
          continue
        }

        if (!existing) {
          try {
            const newFlight = await createFerryFlight(flight)
            if (newFlight) {
              createdFlights.push(newFlight)
            }
          } catch (flightError) {
            console.error(`Error creating flight ${flight.origin} → ${flight.destination}:`, flightError)
          }
        }
      } catch (error) {
        console.error(`Error processing flight:`, error)
      }
    }

    return {
      organizations: createdOrgs.length,
      aircraft: createdAircraft.length,
      flights: createdFlights.length,
    }
  }

  // Use current flights as example data
  console.log(`Found ${allCurrentFlights.length} current flights. Using them as example data.`)
  
  // Ensure user is a member of all organizations that have flights
  const orgIdsWithFlights = new Set(allCurrentFlights.map(f => f.owner_id).filter(Boolean))
  
  for (const orgId of orgIdsWithFlights) {
    if (orgId && !allCurrentOrgs.find(o => o.id === orgId)) {
      // Try to get the organization and add user as member
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()
      
      if (org) {
        allCurrentOrgs.push(org)
        try {
          await addMemberToOrganization(orgId, userId, 'owner')
        } catch (error) {
          // Member might already exist, that's okay
          console.log(`User may already be a member of organization ${org.name}`)
        }
      }
    }
  }

  // Return counts of current data
  return {
    organizations: allCurrentOrgs.length,
    aircraft: allCurrentAircraft.length,
    flights: allCurrentFlights.length,
    message: `Using ${allCurrentFlights.length} current flights as example data`
  }
}

