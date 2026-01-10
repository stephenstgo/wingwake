import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getFerryFlight } from '@/lib/db'
import { FlightPageTemplate, type FlightInfo } from '@/components/flight-page-template'

export default async function FerryFlightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const flight = await getFerryFlight(id)

  if (!flight) {
    notFound()
  }

  // Transform database flight data to FlightInfo format expected by FlightPageTemplate
  const flightInfo: FlightInfo = {
    owner: flight.owner?.name || 'Unknown Owner',
    aircraft: {
      model: flight.aircraft?.model || 'Unknown Model',
      registration: flight.tail_number || flight.aircraft?.n_number || 'N/A',
    },
    pilot: {
      name: flight.pilot?.full_name || flight.pilot?.email || 'Not Assigned',
      ratings: 'Commercial Pilot', // TODO: Get from pilot qualifications
    },
    mechanic: {
      name: flight.mechanic?.full_name || flight.mechanic?.email || 'Not Assigned',
      certification: 'A&P Mechanic', // TODO: Get from mechanic qualifications
    },
    insurance: {
      company: 'TBD', // TODO: Get from insurance_policies table
      policy: 'TBD',
    },
    departure: {
      name: flight.origin,
      code: flight.origin, // TODO: Extract airport code if available
    },
    arrival: {
      name: flight.destination,
      code: flight.destination, // TODO: Extract airport code if available
    },
  }

  // Get the tail number for deletion confirmation (same logic as registration display)
  const tailNumberForDeletion = flight.tail_number || flight.aircraft?.n_number || null

  return (
    <FlightPageTemplate 
      flightType="Ferry Flight"
      flightInfo={flightInfo}
      initialFiles={[]}
      flightStatus={flight.status}
      flightId={flight.id}
      tailNumber={tailNumberForDeletion}
      plannedDeparture={flight.planned_departure}
    />
  )
}

