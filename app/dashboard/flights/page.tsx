import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, Plus } from 'lucide-react'
import { AccountMenu } from '@/components/account-menu'
import { getFerryFlightsByOwner } from '@/lib/db'
import { getUserFerryFlights } from '@/lib/db/ferry-flights'
import { getUserOrganizations } from '@/lib/db/organizations'
import { getAircraft } from '@/lib/db/aircraft'
import { FlightsListWrapper } from '@/components/flights-list-wrapper'
import { FlightsFilterIndicator } from '@/components/flights-filter-indicator'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; status?: string; createdMonth?: string; completedMonth?: string }>
}) {
  const params = await searchParams
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
  
  // Fetch flights by organization owner_id
  const allFlights = []
  for (const orgId of organizationIds) {
    const flights = await getFerryFlightsByOwner(orgId)
    allFlights.push(...flights)
  }
  
  // Also fetch flights created by the user (RLS will handle filtering)
  // This ensures flights with owner_id = null or flights in orgs user doesn't belong to
  // but were created by the user are still visible
  const userCreatedFlights = await getUserFerryFlights(user.id)
  
  // Merge and deduplicate flights by ID
  const flightMap = new Map()
  allFlights.forEach(flight => flightMap.set(flight.id, flight))
  userCreatedFlights.forEach(flight => flightMap.set(flight.id, flight))
  const uniqueFlights = Array.from(flightMap.values())

  // Fetch aircraft info for all flights
  // getAircraft handles errors gracefully and returns null if aircraft not found or not accessible
  const flightsWithAircraft = await Promise.all(
    uniqueFlights.map(async (flight) => {
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
    ['draft', 'inspection_pending', 'inspection_complete', 'faa_submitted', 'faa_questions', 'denied'].includes(f.status)
  )
  const completedFlights = flightsWithAircraft.filter(f => 
    ['completed', 'aborted'].includes(f.status)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <Plane className="w-8 h-8 text-sky-600 mr-2" />
                <span className="text-xl text-gray-900 font-semibold">WingWake</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/flights/new"
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                New Flight
              </Link>
              <AccountMenu userEmail={user.email} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Flights</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Active Flights</h2>
                <p className="text-3xl font-bold text-sky-600">{activeFlights.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Pending Documents</h2>
                <p className="text-3xl font-bold text-orange-600">{pendingFlights.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Completed Flights</h2>
                <p className="text-3xl font-bold text-green-600">{completedFlights.length}</p>
              </div>
            </div>
          </div>
        </div>

        {flightsWithAircraft.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
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
        ) : (
          <>
            <FlightsFilterIndicator
              status={params.status}
              createdMonth={params.createdMonth}
              completedMonth={params.completedMonth}
              section={params.section}
            />
            <FlightsListWrapper
              activeFlights={activeFlights}
              pendingFlights={pendingFlights}
              completedFlights={completedFlights}
              filterStatus={params.status}
              filterCreatedMonth={params.createdMonth}
              filterCompletedMonth={params.completedMonth}
            />
          </>
        )}
      </main>
    </div>
  )
}
