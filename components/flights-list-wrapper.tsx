"use client"

import { useSearchParams } from 'next/navigation'
import { FlightsListSection } from './flights-list-section'

interface Flight {
  id: string
  tail_number?: string | null
  origin: string
  destination: string
  status: string
  actual_arrival?: string | null
  created_at?: string | null
  updated_at?: string | null
  aircraft?: {
    n_number?: string | null
    model?: string | null
  } | null
}

interface FlightsListWrapperProps {
  activeFlights: Flight[]
  pendingFlights: Flight[]
  completedFlights: Flight[]
}

export function FlightsListWrapper({ 
  activeFlights, 
  pendingFlights, 
  completedFlights 
}: FlightsListWrapperProps) {
  const searchParams = useSearchParams()
  const section = searchParams.get('section')

  // Determine which sections should be open based on query parameter
  const activeOpen = section ? section === 'active' : true
  const pendingOpen = section ? section === 'pending' : true
  const completedOpen = section ? section === 'completed' : false

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-8">
      <FlightsListSection 
        title="Active Flights" 
        flights={activeFlights} 
        defaultOpen={activeOpen}
      />
      <FlightsListSection 
        title="Pending Flights" 
        flights={pendingFlights} 
        defaultOpen={pendingOpen}
      />
      <FlightsListSection 
        title="Completed Flights" 
        flights={completedFlights} 
        defaultOpen={completedOpen}
      />
    </div>
  )
}
