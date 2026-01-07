import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, Plus, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'
import { getFerryFlightsByOwner, getFerryFlightsByStatus } from '@/lib/db'
import { getUserOrganizations } from '@/lib/db/organizations'

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    inspection_pending: 'bg-yellow-100 text-yellow-700',
    inspection_complete: 'bg-blue-100 text-blue-700',
    faa_submitted: 'bg-purple-100 text-purple-700',
    faa_questions: 'bg-orange-100 text-orange-700',
    permit_issued: 'bg-green-100 text-green-700',
    scheduled: 'bg-sky-100 text-sky-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    aborted: 'bg-red-100 text-red-700',
    denied: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: 'Draft',
    inspection_pending: 'Inspection Pending',
    inspection_complete: 'Inspection Complete',
    faa_submitted: 'FAA Submitted',
    faa_questions: 'FAA Questions',
    permit_issued: 'Permit Issued',
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    aborted: 'Aborted',
    denied: 'Denied',
  }
  return labels[status] || status
}

export default async function FlightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organizations
  const organizations = await getUserOrganizations(user.id)
  const organizationIds = organizations.map((org: any) => org.id).filter(Boolean)

  // Fetch all ferry flights for user's organizations
  // Also fetch flights where user is pilot or mechanic
  const allFlights = []
  
  // Flights owned by user's organizations
  for (const orgId of organizationIds) {
    const flights = await getFerryFlightsByOwner(orgId)
    allFlights.push(...flights)
  }
  
  // Also get flights where user is assigned as pilot or mechanic
  // (This will be handled by the getFerryFlight function's RLS policies)

  // Group flights by status
  const activeFlights = allFlights.filter(f => 
    ['scheduled', 'in_progress', 'permit_issued'].includes(f.status)
  )
  const pendingFlights = allFlights.filter(f => 
    ['draft', 'inspection_pending', 'inspection_complete', 'faa_submitted', 'faa_questions'].includes(f.status)
  )
  const completedFlights = allFlights.filter(f => 
    ['completed'].includes(f.status)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Plane className="w-8 h-8 text-sky-600 mr-2" />
              <Link href="/dashboard" className="text-xl text-gray-900 font-semibold">
                WingWake
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/flights/new"
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Ferry Flight
              </Link>
              <span className="text-gray-700">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ferry Flights</h1>
          <p className="text-gray-600">Manage your ferry flight cases</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Flights</p>
                <p className="text-3xl font-bold text-sky-600">{activeFlights.length}</p>
              </div>
              <Clock className="w-8 h-8 text-sky-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{pendingFlights.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedFlights.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Flights */}
        {activeFlights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Flights</h2>
            <div className="space-y-4">
              {activeFlights.map((flight) => (
                <Link
                  key={flight.id}
                  href={`/dashboard/flights/${flight.id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {flight.origin} → {flight.destination}
                        </h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(flight.status)}`}>
                          {getStatusLabel(flight.status)}
                        </span>
                      </div>
                      {flight.purpose && (
                        <p className="text-sm text-gray-600 mb-1">{flight.purpose}</p>
                      )}
                      {flight.planned_departure && (
                        <p className="text-xs text-gray-500">
                          Planned: {new Date(flight.planned_departure).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pending Flights */}
        {pendingFlights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Flights</h2>
            <div className="space-y-4">
              {pendingFlights.map((flight) => (
                <Link
                  key={flight.id}
                  href={`/dashboard/flights/${flight.id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {flight.origin} → {flight.destination}
                        </h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(flight.status)}`}>
                          {getStatusLabel(flight.status)}
                        </span>
                      </div>
                      {flight.purpose && (
                        <p className="text-sm text-gray-600 mb-1">{flight.purpose}</p>
                      )}
                      {flight.planned_departure && (
                        <p className="text-xs text-gray-500">
                          Planned: {new Date(flight.planned_departure).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed Flights */}
        {completedFlights.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Completed Flights</h2>
            <div className="space-y-4">
              {completedFlights.map((flight) => (
                <Link
                  key={flight.id}
                  href={`/dashboard/flights/${flight.id}`}
                  className="block bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {flight.origin} → {flight.destination}
                        </h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(flight.status)}`}>
                          {getStatusLabel(flight.status)}
                        </span>
                      </div>
                      {flight.purpose && (
                        <p className="text-sm text-gray-600 mb-1">{flight.purpose}</p>
                      )}
                      {flight.actual_arrival && (
                        <p className="text-xs text-gray-500">
                          Completed: {new Date(flight.actual_arrival).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {allFlights.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No ferry flights yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first ferry flight case.</p>
            <Link
              href="/dashboard/flights/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Ferry Flight
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

