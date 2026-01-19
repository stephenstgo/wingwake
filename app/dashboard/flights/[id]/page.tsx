import { redirect, notFound } from 'next/navigation'
import { getFerryFlight } from '@/lib/db'
import { getDocumentsByFlight } from '@/lib/db/documents'
import { getStatusHistory } from '@/lib/db/audit-logs'
import { FlightPageTemplate, type FlightInfo } from '@/components/flight-page-template'
import { convexClient, api } from '@/lib/convex/server'

export default async function FerryFlightDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Get current user profile from Convex
  const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});

  if (!profile) {
    redirect('/login')
  }

  const { id } = await params
  const flight = await getFerryFlight(id)

  if (!flight) {
    notFound()
  }

  // Get documents and status history
  const documents = await getDocumentsByFlight(id)
  const statusHistory = await getStatusHistory(id)

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
      userEmail={profile.email || undefined}
      statusHistory={statusHistory}
    />
  )
}

