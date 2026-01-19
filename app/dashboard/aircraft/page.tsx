import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, Plus } from 'lucide-react'
import { AccountMenu } from '@/components/account-menu'
import { getAllAircraftForUser } from '@/lib/db/aircraft'
import { getUserOrganizations } from '@/lib/db/organizations'
import { AircraftList } from '@/components/aircraft-list'
import { convexClient, api } from '@/lib/convex/server'

export default async function AircraftPage() {
  // Get current user profile from Convex
  const profile = await convexClient.query(api["queries/profiles"].getCurrentUserProfile, {});

  if (!profile) {
    redirect('/login')
  }

  const aircraft = await getAllAircraftForUser()
  const organizations = await getUserOrganizations(profile._id)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center">
                <Plane className="w-8 h-8 text-sky-600 mr-2" />
                <span className="text-xl text-gray-900 font-semibold">WingWake</span>
              </Link>
              <Link
                href="/dashboard/flights"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Flights
              </Link>
              <Link
                href="/dashboard/aircraft"
                className="text-gray-900 font-medium"
              >
                Aircraft
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <AccountMenu />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aircraft</h1>
            <p className="text-gray-600 mt-1">Manage your aircraft registry</p>
          </div>
          <Link
            href="/dashboard/aircraft/new"
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Aircraft
          </Link>
        </div>

        <AircraftList initialAircraft={aircraft} organizations={organizations} />
      </main>
    </div>
  )
}
