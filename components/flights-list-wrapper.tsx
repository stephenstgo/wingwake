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
  filterStatus?: string
  filterCreatedMonth?: string
  filterCompletedMonth?: string
}

export function FlightsListWrapper({ 
  activeFlights, 
  pendingFlights, 
  completedFlights,
  filterStatus,
  filterCreatedMonth,
  filterCompletedMonth
}: FlightsListWrapperProps) {
  const searchParams = useSearchParams()
  const section = searchParams.get('section')

  // Filter flights based on query parameters
  const filterFlightsByStatus = (flights: Flight[]): Flight[] => {
    if (filterStatus) {
      return flights.filter(f => f.status === filterStatus)
    }
    return flights
  }

  const filterFlightsByCreatedMonth = (flights: Flight[]): Flight[] => {
    if (filterCreatedMonth) {
      return flights.filter(flight => {
        if (!flight.created_at) return false
        const flightDate = new Date(flight.created_at)
        const flightMonthKey = `${flightDate.getFullYear()}-${String(flightDate.getMonth() + 1).padStart(2, '0')}`
        return flightMonthKey === filterCreatedMonth
      })
    }
    return flights
  }

  const filterFlightsByCompletedMonth = (flights: Flight[]): Flight[] => {
    if (filterCompletedMonth) {
      return flights.filter(flight => {
        const dateStr = flight.actual_arrival || flight.updated_at
        if (!dateStr) return false
        const flightDate = new Date(dateStr)
        const flightMonthKey = `${flightDate.getFullYear()}-${String(flightDate.getMonth() + 1).padStart(2, '0')}`
        return flightMonthKey === filterCompletedMonth
      })
    }
    return flights
  }

  // Apply filters to each flight category
  // When filtering by status, only show flights in the relevant section
  let filteredActiveFlights = activeFlights
  let filteredPendingFlights = pendingFlights
  let filteredCompletedFlights = completedFlights

  // Apply status filter - only to the relevant section
  if (filterStatus) {
    // Determine which section this status belongs to
    const statusLower = filterStatus.toLowerCase()
    const isActiveStatus = ['scheduled', 'in_progress', 'permit_issued'].includes(statusLower)
    const isPendingStatus = ['draft', 'inspection_pending', 'inspection_complete', 'faa_submitted', 'faa_questions', 'denied'].includes(statusLower)
    const isCompletedStatus = ['completed', 'aborted'].includes(statusLower)

    if (isActiveStatus) {
      filteredActiveFlights = filterFlightsByStatus(activeFlights)
      // Clear other sections when filtering by status
      filteredPendingFlights = []
      filteredCompletedFlights = []
    } else if (isPendingStatus) {
      filteredPendingFlights = filterFlightsByStatus(pendingFlights)
      filteredActiveFlights = []
      filteredCompletedFlights = []
    } else if (isCompletedStatus) {
      filteredCompletedFlights = filterFlightsByStatus(completedFlights)
      filteredActiveFlights = []
      filteredPendingFlights = []
    } else {
      // Unknown status, apply filter to all sections
      filteredActiveFlights = filterFlightsByStatus(activeFlights)
      filteredPendingFlights = filterFlightsByStatus(pendingFlights)
      filteredCompletedFlights = filterFlightsByStatus(completedFlights)
    }
  }

  // Apply month filters
  if (filterCreatedMonth) {
    // Apply createdMonth filter to all sections (flights created in that month regardless of current status)
    filteredActiveFlights = filterFlightsByCreatedMonth(filteredActiveFlights)
    filteredPendingFlights = filterFlightsByCreatedMonth(filteredPendingFlights)
    filteredCompletedFlights = filterFlightsByCreatedMonth(filteredCompletedFlights)
  }

  if (filterCompletedMonth) {
    // Only apply completedMonth filter to completed flights
    filteredCompletedFlights = filterFlightsByCompletedMonth(filteredCompletedFlights)
    // When filtering by completed month, hide other sections
    filteredActiveFlights = []
    filteredPendingFlights = []
  }

  // Determine which sections should be open based on query parameter
  const activeOpen = section ? section === 'active' : true
  const pendingOpen = section ? section === 'pending' : true
  const completedOpen = section ? section === 'completed' : false

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-8">
      <FlightsListSection 
        title="Active Flights" 
        flights={filteredActiveFlights} 
        defaultOpen={activeOpen}
      />
      <FlightsListSection 
        title="Pending Flights" 
        flights={filteredPendingFlights} 
        defaultOpen={pendingOpen}
      />
      <FlightsListSection 
        title="Completed Flights" 
        flights={filteredCompletedFlights} 
        defaultOpen={completedOpen}
      />
    </div>
  )
}
