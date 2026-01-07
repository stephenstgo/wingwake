// Script to seed example ferry flights
// Run this from a server action or API route after migrations

import { createClient } from '@/lib/supabase/server'
import { createOrganization, addMemberToOrganization } from '@/lib/db/organizations'
import { createAircraft } from '@/lib/db/aircraft'
import { createFerryFlight } from '@/lib/db'

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

  // Create organizations
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
      // Check if organization already exists
      // Note: This SELECT might fail due to RLS if user isn't a member, but that's okay
      // We'll just try to create it anyway
      const { data: existing, error: checkError } = await supabase
        .from('organizations')
        .select('id')
        .eq('name', org.name)
        .maybeSingle()

      if (checkError) {
        // Check for recursion error
        if (checkError.message?.includes('infinite recursion') || checkError.code === '42P17') {
          throw new Error(`RLS recursion error when checking organization. Please run migration 009_fix_all_rls_recursion.sql. Original error: ${checkError.message}`)
        }
        // PGRST116 = no rows found (this is fine, we'll create it)
        // Other errors might be RLS blocking SELECT, which is also fine - we'll try to create
        if (checkError.code !== 'PGRST116') {
          console.warn(`Warning checking organization ${org.name} (will attempt to create anyway):`, checkError.message || checkError.code)
        }
      }

      let orgId: string
      if (existing) {
        // Organization already exists
        orgId = existing.id
        createdOrgs.push({ id: orgId, ...org })
        console.log(`Organization "${org.name}" already exists, using existing ID: ${orgId}`)
      } else {
        // Create new organization
        console.log(`Creating organization: ${org.name}`)
        try {
          const newOrg = await createOrganization(org)
          if (!newOrg) {
            throw new Error(`Failed to create organization: ${org.name} (no data returned)`)
          }
          orgId = newOrg.id
          createdOrgs.push(newOrg)
          console.log(`Successfully created organization "${org.name}" with ID: ${orgId}`)
        } catch (orgError) {
          // createOrganization now throws errors with details, so re-throw with context
          console.error(`Error creating organization "${org.name}":`, orgError)
          if (orgError instanceof Error) {
            throw new Error(`Failed to create organization "${org.name}": ${orgError.message}`)
          }
          throw new Error(`Failed to create organization: ${org.name} (unknown error)`)
        }
      }

      // Add user as owner (ignore if already exists)
      try {
        console.log(`Adding user ${userId} as owner to organization "${org.name}" (${orgId})`)
        const memberResult = await addMemberToOrganization(orgId, userId, 'owner')
        if (!memberResult) {
          // Check if member already exists (this is okay)
          const { data: existingMember, error: checkError } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', orgId)
            .eq('user_id', userId)
            .maybeSingle()
          
          if (checkError && checkError.code !== 'PGRST116') {
            console.warn(`Error checking membership for ${org.name}:`, checkError)
          }
          
          if (!existingMember) {
            // This is a problem - we couldn't add the member and they don't exist
            throw new Error(`Failed to add user to organization ${org.name}. This may be due to RLS policies.`)
          } else {
            console.log(`User already a member of "${org.name}"`)
          }
        } else {
          console.log(`Successfully added user as owner to "${org.name}"`)
        }
      } catch (memberError) {
        console.error(`Error adding member to ${org.name}:`, memberError)
        // Don't throw - continue with other organizations
        // But log the issue
        if (memberError instanceof Error && memberError.message.includes('RLS')) {
          throw new Error(`RLS policy issue: Cannot add members to organizations. Please ensure migration 005_fix_org_members_rls.sql has been run and that you have permission to insert into organization_members.`)
        }
        throw memberError
      }
    } catch (error) {
      console.error(`Error processing organization ${org.name}:`, error)
      throw error
    }
  }

  // Create aircraft
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
        console.error(`Error checking aircraft ${ac.n_number}:`, checkError)
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

  // Validate we have enough data
  if (createdOrgs.length < 9) {
    throw new Error(`Expected 9 organizations, but only created/found ${createdOrgs.length}`)
  }
  if (createdAircraft.length < 9) {
    throw new Error(`Expected 9 aircraft, but only created/found ${createdAircraft.length}`)
  }

  // Create ferry flights
  const flights = [
    // Active flights
    { aircraft_id: createdAircraft[0].id, owner_id: createdOrgs[0].id, origin: 'KORD', destination: 'KLAX', purpose: 'Demo Ferry Flight', status: 'in_progress' as const },
    { aircraft_id: createdAircraft[1].id, owner_id: createdOrgs[0].id, origin: 'KSEA', destination: 'KPDX', purpose: 'Training Flight', status: 'in_progress' as const },
    { aircraft_id: createdAircraft[2].id, owner_id: createdOrgs[3].id, origin: 'KIAH', destination: 'CYYZ', purpose: 'Export/import delivery', status: 'in_progress' as const },
    { aircraft_id: createdAircraft[3].id, owner_id: createdOrgs[4].id, origin: 'KATL', destination: 'KPHX', purpose: 'Storage relocation', status: 'in_progress' as const },
    // Pending flights
    { aircraft_id: createdAircraft[4].id, owner_id: createdOrgs[5].id, origin: 'KJFK', destination: 'KMIA', purpose: 'Repositioning to a maintenance facility', status: 'inspection_pending' as const },
    { aircraft_id: createdAircraft[5].id, owner_id: createdOrgs[1].id, origin: 'KDFW', destination: 'KPHX', purpose: 'Delivery to new owner (domestic sale)', status: 'draft' as const },
    { aircraft_id: createdAircraft[6].id, owner_id: createdOrgs[6].id, origin: 'KDTW', destination: 'KORD', purpose: 'Weighing or modifications', status: 'draft' as const },
    // Completed flights
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
        throw new Error(`Failed to check flight: ${checkError.message}`)
      }

      if (!existing) {
        try {
          console.log(`Creating flight: ${flight.origin} → ${flight.destination}`)
          const newFlight = await createFerryFlight(flight)
          if (!newFlight) {
            console.warn(`Flight created but could not retrieve it: ${flight.origin} → ${flight.destination}`)
            // Flight was created but we can't retrieve it - this is okay, continue
            // We'll count it as created even though we don't have the full object
            createdFlights.push({ id: 'unknown', ...flight } as any)
          } else {
            console.log(`Successfully created flight: ${flight.origin} → ${flight.destination} (ID: ${newFlight.id})`)
            createdFlights.push(newFlight)
          }
        } catch (flightError) {
          console.error(`Error creating flight ${flight.origin} → ${flight.destination}:`, flightError)
          // Don't throw - continue with other flights
          // But log the error for debugging
          if (flightError instanceof Error) {
            console.error(`Flight creation error details: ${flightError.message}`)
          }
        }
      } else {
        console.log(`Flight already exists: ${flight.origin} → ${flight.destination}`)
        createdFlights.push(existing as any)
      }
    } catch (error) {
      console.error(`Error processing flight ${flight.origin} → ${flight.destination}:`, error)
      // Don't throw - continue with other flights
      // The error is already logged above
    }
  }

  return {
    organizations: createdOrgs.length,
    aircraft: createdAircraft.length,
    flights: createdFlights.length,
  }
}

