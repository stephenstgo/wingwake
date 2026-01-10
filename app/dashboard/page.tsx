import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, Plus } from 'lucide-react'
import { AccountMenu } from '@/components/account-menu'
import { getFerryFlightsByOwner } from '@/lib/db'
import { getUserOrganizations } from '@/lib/db/organizations'
import { getAircraft } from '@/lib/db/aircraft'
import { StatusBadge } from '@/components/status-badge'
import type { FerryFlightStatus } from '@/lib/types/database'
import { processPhases, getCurrentPhaseIndex } from '@/lib/data/phase-definitions'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organizations and fetch real ferry flights
  const organizations = await getUserOrganizations(user.id)
  const organizationIds = organizations.map((org: any) => org.id).filter(Boolean)
  
  const allFlights = []
  for (const orgId of organizationIds) {
    const flights = await getFerryFlightsByOwner(orgId)
    allFlights.push(...flights)
  }

  // Fetch aircraft info for all flights
  const flightsWithAircraft = await Promise.all(
    allFlights.map(async (flight) => {
      let aircraft = null
      if (flight.aircraft_id) {
        aircraft = await getAircraft(flight.aircraft_id)
      }
      return { ...flight, aircraft }
    })
  )

  // Group flights by status
  const activeFlights = flightsWithAircraft.filter(f => 
    ['scheduled', 'in_progress', 'permit_issued'].includes(f.status)
  )
  const pendingFlights = flightsWithAircraft.filter(f => 
    ['draft', 'inspection_pending', 'inspection_complete', 'faa_submitted', 'faa_questions'].includes(f.status)
  )
  const completedFlights = flightsWithAircraft.filter(f => 
    ['completed'].includes(f.status)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Plane className="w-8 h-8 text-sky-600 mr-2" />
              <span className="text-xl text-gray-900 font-semibold">WingWake</span>
            </div>
            <div className="flex items-center gap-4">
              <AccountMenu userEmail={user.email} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome to your WingWake dashboard!</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Active Flights</h2>
              <p className="text-3xl font-bold text-sky-600">{activeFlights.length}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Pending Documents</h2>
              <p className="text-3xl font-bold text-orange-600">{pendingFlights.length}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Completed Flights</h2>
              <p className="text-3xl font-bold text-green-600">{completedFlights.length}</p>
            </div>
          </div>

          {/* Active Flights */}
          {activeFlights.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Active Flights</h2>
                <Link 
                  href="/dashboard/flights/new"
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Flight
                </Link>
              </div>
              <div className="space-y-4">
                {activeFlights.map((flight) => {
                  const tailNumber = flight.tail_number || flight.aircraft?.n_number || 'N/A'
                  const aircraftModel = flight.aircraft?.model || ''
                  const currentPhaseIndex = getCurrentPhaseIndex(flight.status as FerryFlightStatus)
                  
                  return (
                    <Link
                      key={flight.id}
                      href={`/dashboard/flights/${flight.id}`}
                      className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {tailNumber}
                            </h3>
                            {aircraftModel && (
                              <span className="text-sm text-gray-500">• {aircraftModel}</span>
                            )}
                            <StatusBadge status={flight.status as any} />
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {flight.origin} → {flight.destination}
                          </p>
                          {/* Timeline Progress Indicator */}
                          <div className="relative mt-4">
                            <div className="flex items-center">
                              {processPhases.map((phase, index) => {
                                const isCompleted = index < currentPhaseIndex
                                const isCurrent = index === currentPhaseIndex
                                const isUpcoming = index > currentPhaseIndex
                                // Line segment before this phase should be green if we've reached at least phase 'index'
                                // The segment before phase 'index' is green if we're in phase 'index' or beyond
                                // This means: index <= currentPhaseIndex (when index > 0)
                                const prevPhaseCompleted = index > 0 && index <= currentPhaseIndex
                                
                                return (
                                  <div key={phase.id} className={`flex items-center ${index === 0 ? 'shrink-0' : 'flex-1'}`}>
                                    {/* Progress line segment before dot */}
                                    {/* For first phase (index 0), no segment. For others, segment is green if previous phase is completed */}
                                    {index > 0 && (
                                      <div 
                                        className={`flex-1 h-1.5 rounded-full ${
                                          prevPhaseCompleted ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                        style={{ minWidth: '30px', flex: '1 1 0%' }}
                                      />
                                    )}
                                    {/* Phase dot at end of segment */}
                                    <div className={`relative shrink-0 w-3 h-3 rounded-full ${
                                      isCompleted ? 'bg-green-500' : 
                                      isCurrent ? 'bg-sky-500 ring-2 ring-sky-300 ring-offset-2' : 
                                      'bg-gray-300'
                                    }`}>
                                      {isCurrent && (
                                        <div className="absolute inset-0 bg-sky-500 rounded-full animate-pulse" />
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            {/* Current phase label */}
                            <div className="mt-2">
                              <span className="text-xs font-medium text-sky-600">
                                {processPhases[currentPhaseIndex].label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pending Flights */}
          {pendingFlights.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Flights</h2>
              <div className="space-y-4">
                {pendingFlights.map((flight) => {
                  const tailNumber = flight.tail_number || flight.aircraft?.n_number || 'N/A'
                  const aircraftModel = flight.aircraft?.model || ''
                  const currentPhaseIndex = getCurrentPhaseIndex(flight.status as FerryFlightStatus)
                  
                  return (
                    <Link
                      key={flight.id}
                      href={`/dashboard/flights/${flight.id}`}
                      className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {tailNumber}
                            </h3>
                            {aircraftModel && (
                              <span className="text-sm text-gray-500">• {aircraftModel}</span>
                            )}
                            <StatusBadge status={flight.status as any} />
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {flight.origin} → {flight.destination}
                          </p>
                          {/* Timeline Progress Indicator */}
                          <div className="relative mt-4">
                            <div className="flex items-center">
                              {processPhases.map((phase, index) => {
                                const isCompleted = index < currentPhaseIndex
                                const isCurrent = index === currentPhaseIndex
                                // Line segment before this phase should be green if we've reached at least phase 'index'
                                const prevPhaseCompleted = index > 0 && index <= currentPhaseIndex
                                
                                return (
                                  <div key={phase.id} className={`flex items-center ${index === 0 ? 'shrink-0' : 'flex-1'}`}>
                                    {/* Progress line segment before dot */}
                                    {index > 0 && (
                                      <div 
                                        className={`flex-1 h-1.5 rounded-full transition-colors ${
                                          prevPhaseCompleted ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                        style={{ minWidth: '20px', flex: '1 1 0%' }}
                                      />
                                    )}
                                    {/* Phase dot at end of segment */}
                                    <div className={`relative shrink-0 w-4 h-4 rounded-full transition-colors ${
                                      isCompleted ? 'bg-green-500' : 
                                      isCurrent ? 'bg-sky-500 ring-2 ring-sky-300 ring-offset-1' : 
                                      'bg-gray-300'
                                    }`}>
                                      {isCurrent && (
                                        <div className="absolute inset-0 bg-sky-500 rounded-full animate-pulse" />
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            {/* Current phase label */}
                            <div className="mt-2">
                              <span className="text-xs font-medium text-sky-600">
                                {processPhases[currentPhaseIndex].label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Completed Flights */}
          {completedFlights.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Completed Flights</h2>
              <div className="space-y-4">
                {completedFlights.map((flight) => {
                  const tailNumber = flight.tail_number || flight.aircraft?.n_number || 'N/A'
                  const aircraftModel = flight.aircraft?.model || ''
                  const currentPhaseIndex = getCurrentPhaseIndex(flight.status as FerryFlightStatus)
                  
                  return (
                    <Link
                      key={flight.id}
                      href={`/dashboard/flights/${flight.id}`}
                      className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {tailNumber}
                            </h3>
                            {aircraftModel && (
                              <span className="text-sm text-gray-500">• {aircraftModel}</span>
                            )}
                            <StatusBadge status={flight.status as any} />
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {flight.origin} → {flight.destination}
                          </p>
                          {/* Timeline Progress Indicator */}
                          <div className="relative mt-4">
                            <div className="flex items-center">
                              {processPhases.map((phase, index) => {
                                const isCompleted = index <= currentPhaseIndex
                                // Line segment before this phase should be green if we've reached at least phase 'index'
                                const isSegmentCompleted = index > 0 && index <= currentPhaseIndex
                                
                                return (
                                  <div key={phase.id} className={`flex items-center ${index === 0 ? 'shrink-0' : 'flex-1'}`}>
                                    {/* Progress line segment before dot */}
                                    {index > 0 && (
                                      <div 
                                        className={`flex-1 h-1.5 rounded-full transition-colors ${
                                          isSegmentCompleted ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                        style={{ minWidth: '20px', flex: '1 1 0%' }}
                                      />
                                    )}
                                    {/* Phase dot at end of segment */}
                                    <div className={`relative shrink-0 w-4 h-4 rounded-full transition-colors ${
                                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                                    }`} />
                                  </div>
                                )
                              })}
                            </div>
                            {/* Current phase label and completion date */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-medium text-green-600">
                                {processPhases[currentPhaseIndex].label}
                              </span>
                              {flight.actual_arrival && (
                                <span className="text-xs text-gray-500">
                                  {new Date(flight.actual_arrival).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {flightsWithAircraft.length === 0 && (
            <div className="mt-8">
              <div className="border border-gray-200 rounded-lg p-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No ferry flights yet</h2>
                <p className="text-gray-600 mb-6">Get started by creating your first ferry flight case.</p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/dashboard/flights/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Ferry Flight
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

