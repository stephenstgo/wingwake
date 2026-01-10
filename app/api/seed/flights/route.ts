import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { InsertFerryFlight, FerryFlightStatus } from '@/lib/types/database'

// Common US airports for realistic flight data
const AIRPORTS = [
  'KORD', 'KLAX', 'KDFW', 'KJFK', 'KMIA', 'KSEA', 'KPHX', 'KIAH', 'KATL', 'KCLT',
  'KDEN', 'KMCI', 'KBOS', 'KBDL', 'KLAS', 'KPDX', 'KSFO', 'KSAN', 'KDTW', 'KMSP',
  'KBWI', 'KDCA', 'KIAD', 'KEWR', 'KLGA', 'KBNA', 'KMSY', 'KSTL', 'KCLE', 'KIND',
  'KCMH', 'KPIT', 'KBUF', 'KRDU', 'KCHS', 'KSAV', 'KJAX', 'KMCO', 'KTPA', 'KFLL',
  'KRSW', 'KPBI', 'KTLH', 'KGNV', 'KJAX', 'KAGS', 'KCAE', 'KGSP', 'KAVL', 'KTYS'
]

const PURPOSES = [
  'Delivery',
  'Maintenance',
  'Repositioning',
  'Storage',
  'Training',
  'Export',
  'Inspection',
  'Weighing',
  'Sale',
  'Relocation'
]

const STATUSES: FerryFlightStatus[] = [
  'completed',
  'completed',
  'completed',
  'completed',
  'completed',
  'completed',
  'completed',
  'completed',
  'completed',
  'aborted', // 10% aborted
]

function randomDateInPast12Months(): Date {
  const now = new Date()
  const twelveMonthsAgo = new Date(now)
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
  
  // Distribute dates more evenly across the 12 months
  // Use a slight bias toward more recent dates (more realistic)
  const randomFactor = Math.pow(Math.random(), 0.7) // Bias toward recent dates
  const randomTime = twelveMonthsAgo.getTime() + 
    randomFactor * (now.getTime() - twelveMonthsAgo.getTime())
  
  return new Date(randomTime)
}

function randomAirport(): string {
  return AIRPORTS[Math.floor(Math.random() * AIRPORTS.length)]
}

function randomPurpose(): string {
  return PURPOSES[Math.floor(Math.random() * PURPOSES.length)]
}

function randomStatus(): FerryFlightStatus {
  return STATUSES[Math.floor(Math.random() * STATUSES.length)]
}

function generateTailNumber(): string {
  const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ'
  const numbers = '0123456789'
  
  const letter1 = letters[Math.floor(Math.random() * letters.length)]
  const letter2 = letters[Math.floor(Math.random() * letters.length)]
  const letter3 = letters[Math.floor(Math.random() * letters.length)]
  const num1 = numbers[Math.floor(Math.random() * numbers.length)]
  const num2 = numbers[Math.floor(Math.random() * numbers.length)]
  const num3 = numbers[Math.floor(Math.random() * numbers.length)]
  
  return `N${letter1}${letter2}${letter3}${num1}${num2}${num3}`
}

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: authError?.message 
      }, { status: 401 })
    }

    // Get existing data to reference
    const { data: existingAircraft } = await supabase
      .from('aircraft')
      .select('id, n_number')
      .limit(100)

    const { data: existingOrgs } = await supabase
      .from('organizations')
      .select('id')
      .limit(100)

    const { data: existingUsers } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(100)

    const aircraftIds = existingAircraft?.map(a => a.id) || []
    const orgIds = existingOrgs?.map(o => o.id) || []
    const userIds = existingUsers?.map(u => u.id) || []
    const pilotIds = existingUsers?.filter(u => u.role === 'pilot' || u.role === 'admin').map(u => u.id) || userIds
    const mechanicIds = existingUsers?.filter(u => u.role === 'mechanic' || u.role === 'admin').map(u => u.id) || userIds

    // Generate 100+ flights
    const numFlights = 120 // Generate 120 to ensure we have at least 100 after potential failures
    const flights: InsertFerryFlight[] = []
    
    for (let i = 0; i < numFlights; i++) {
      const departureDate = randomDateInPast12Months()
      // Add some randomness to departure time (morning, afternoon, evening)
      const hourOfDay = 6 + Math.floor(Math.random() * 14) // 6 AM to 8 PM
      departureDate.setHours(hourOfDay, Math.floor(Math.random() * 60), 0, 0)
      
      const flightDurationHours = 1.5 + Math.random() * 9.5 // 1.5-11 hour flights
      const arrivalDate = new Date(departureDate.getTime() + flightDurationHours * 60 * 60 * 1000)
      
      const origin = randomAirport()
      let destination = randomAirport()
      // Ensure destination is different from origin
      let attempts = 0
      while (destination === origin && attempts < 10) {
        destination = randomAirport()
        attempts++
      }

      const status = randomStatus()
      
      // For completed flights, set actual dates
      // For aborted flights, only set departure (flight was started but didn't complete)
      const actualDeparture = status === 'completed' || status === 'aborted' 
        ? departureDate.toISOString() 
        : null
      const actualArrival = status === 'completed' 
        ? arrivalDate.toISOString() 
        : null

      const flight: InsertFerryFlight = {
        aircraft_id: aircraftIds.length > 0 && Math.random() > 0.3 
          ? aircraftIds[Math.floor(Math.random() * aircraftIds.length)] 
          : null,
        tail_number: aircraftIds.length === 0 || Math.random() > 0.3 
          ? generateTailNumber() 
          : null,
        owner_id: orgIds.length > 0 && Math.random() > 0.2
          ? orgIds[Math.floor(Math.random() * orgIds.length)]
          : null,
        pilot_user_id: pilotIds.length > 0 && Math.random() > 0.4
          ? pilotIds[Math.floor(Math.random() * pilotIds.length)]
          : null,
        mechanic_user_id: mechanicIds.length > 0 && Math.random() > 0.5
          ? mechanicIds[Math.floor(Math.random() * mechanicIds.length)]
          : null,
        origin,
        destination,
        purpose: randomPurpose(),
        status,
        planned_departure: departureDate.toISOString(),
        actual_departure: actualDeparture,
        actual_arrival: actualArrival,
      }

      flights.push(flight)
    }

    // Insert flights in batches to avoid overwhelming the database
    const batchSize = 20
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (let i = 0; i < flights.length; i += batchSize) {
      const batch = flights.slice(i, i + batchSize)
      
      // Insert without select() to avoid SELECT policy issues
      const { error: insertError } = await supabase
        .from('ferry_flights')
        .insert(
          batch.map(flight => ({
            ...flight,
            created_by: user.id,
          }))
        )

      if (insertError) {
        errorCount += batch.length
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`)
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError)
      } else {
        successCount += batch.length
      }
    }

    // Try to verify by counting flights created in the past 12 months
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const { count } = await supabase
      .from('ferry_flights')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twelveMonthsAgo.toISOString())

    return NextResponse.json({
      success: true,
      attempted: numFlights,
      inserted: successCount,
      errors: errorCount,
      errorMessages: errors.slice(0, 10), // Limit error messages
      totalFlightsInPast12Months: count || 0,
      message: `Successfully created ${successCount} flights. ${errorCount > 0 ? `${errorCount} failed.` : ''}`
    })
  } catch (error) {
    console.error('Error seeding flights:', error)
    return NextResponse.json({ 
      error: 'Seed failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
