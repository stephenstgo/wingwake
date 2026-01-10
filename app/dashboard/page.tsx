import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, Plus, FileText, Settings, Users, ArrowRight, Check, AlertCircle } from 'lucide-react'
import { AccountMenu } from '@/components/account-menu'
import { getFerryFlightsByOwner } from '@/lib/db'
import { getUserOrganizations } from '@/lib/db/organizations'
import { getAircraft } from '@/lib/db/aircraft'
import { DashboardCharts } from '@/components/dashboard-charts'

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

  // Fetch aircraft info for flights (needed for tail number fallback)
  const flightsWithAircraft = await Promise.all(
    allFlights.map(async (flight) => {
      let aircraft = null
      if (flight.aircraft_id) {
        aircraft = await getAircraft(flight.aircraft_id)
      }
      return { ...flight, aircraft }
    })
  )

  // Group flights by status for the count cards
  const activeFlights = flightsWithAircraft.filter(f => 
    ['scheduled', 'in_progress', 'permit_issued'].includes(f.status)
  )
  const pendingFlights = flightsWithAircraft.filter(f => 
    ['draft', 'inspection_pending', 'inspection_complete', 'faa_submitted', 'faa_questions'].includes(f.status)
  )
  const completedFlights = flightsWithAircraft.filter(f => 
    ['completed'].includes(f.status)
  )

  // Get recent active flights for quick overview (limit to 2, sorted by most recently updated)
  const recentActiveFlights = activeFlights
    .sort((a, b) => {
      const aUpdated = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const bUpdated = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return bUpdated - aUpdated // Descending order (most recent first)
    })
    .slice(0, 2)

  // Prepare chart data
  // Flights by status for pie chart
  const statusCounts = flightsWithAircraft.reduce((acc, flight) => {
    const status = flight.status || 'unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    status
  }))

  // Flights over time (last 6 months)
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      date
    })
  }

  const flightsOverTime = months.map(({ month, monthKey }) => {
    const count = flightsWithAircraft.filter(flight => {
      if (!flight.created_at) return false
      const flightDate = new Date(flight.created_at)
      const flightMonthKey = `${flightDate.getFullYear()}-${String(flightDate.getMonth() + 1).padStart(2, '0')}`
      return flightMonthKey === monthKey
    }).length
    return { month, count }
  })

  // Completed flights (last 6 months)
  const completedOverTime = months.map(({ month, monthKey }) => {
    const count = completedFlights.filter(flight => {
      if (!flight.actual_arrival && !flight.updated_at) return false
      const flightDate = new Date(flight.actual_arrival || flight.updated_at)
      const flightMonthKey = `${flightDate.getFullYear()}-${String(flightDate.getMonth() + 1).padStart(2, '0')}`
      return flightMonthKey === monthKey
    }).length
    return { month, count }
  })

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
              <AccountMenu userEmail={user.email} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            {/* Action Required Alert */}
            {pendingFlights.length > 0 && (
              <div className="lg:col-span-2">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
                      <h3 className="font-semibold text-orange-900">Action Required</h3>
                      <p className="text-sm text-orange-700">
                        You have {pendingFlights.length} flight{pendingFlights.length !== 1 ? 's' : ''} with pending documents.
                      </p>
                    </div>
                    <Link
                      href="/dashboard/flights"
                      className="text-sm font-medium text-orange-600 hover:text-orange-700 shrink-0"
                    >
                      Review now →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/flights/new"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                    <Plus className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Create New Flight</h3>
                    <p className="text-sm text-gray-600">Start tracking a new ferry flight</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-sky-600 transition-colors" />
                </Link>

                <Link
                  href="/dashboard/flights"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Plane className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">View All Flights</h3>
                    <p className="text-sm text-gray-600">See all your ferry flights</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                <Link
                  href="/dashboard/account"
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Account Settings</h3>
                    <p className="text-sm text-gray-600">Manage profile and preferences</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </Link>

                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-75">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-500">Organizations</h3>
                    <p className="text-sm text-gray-400">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity / Overview */}
          <div>
            {/* Active Flights Overview */}
            {activeFlights.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Active Flights</h2>
                  <Link
                    href="/dashboard/flights"
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentActiveFlights.map((flight) => {
                    const tailNumber = flight.tail_number || flight.aircraft?.n_number || 'N/A'
                    return (
                      <Link
                        key={flight.id}
                        href={`/dashboard/flights/${flight.id}`}
                        className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-sky-300 hover:shadow-sm transition-all group"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{tailNumber}</p>
                          <p className="text-sm text-gray-600">{flight.origin} → {flight.destination}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-sky-600 transition-colors shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {flightsWithAircraft.length === 0 && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <Plane className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">No flights yet</h3>
                <p className="text-sm text-gray-600 mb-4">Get started by creating your first ferry flight.</p>
                <Link
                  href="/dashboard/flights/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Flight
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Flight Count Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/dashboard/flights?section=active"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Active Flights</h2>
                <p className="text-3xl font-bold text-sky-600">{activeFlights.length}</p>
              </div>
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-sky-600" />
              </div>
            </div>
          </Link>
          <Link
            href="/dashboard/flights?section=pending"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Pending Documents</h2>
                <p className="text-3xl font-bold text-orange-600">{pendingFlights.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Link>
          <Link
            href="/dashboard/flights?section=completed"
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Completed Flights</h2>
                <p className="text-3xl font-bold text-green-600">{completedFlights.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Charts Section */}
        {flightsWithAircraft.length > 0 && (
          <div className="mb-8">
            <DashboardCharts
              statusData={statusChartData}
              flightsOverTime={flightsOverTime}
              completedOverTime={completedOverTime}
              allFlights={flightsWithAircraft.map(f => ({ 
                created_at: f.created_at,
                actual_arrival: f.actual_arrival,
                updated_at: f.updated_at,
                status: f.status
              }))}
            />
          </div>
        )}
      </main>
    </div>
  )
}

