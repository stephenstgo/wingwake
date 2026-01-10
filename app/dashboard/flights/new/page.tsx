import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plane } from 'lucide-react'
import Link from 'next/link'
import { AccountMenu } from '@/components/account-menu'
import { CreateFerryFlightForm } from '@/components/create-ferry-flight-form'
import { getUserOrganizations } from '@/lib/db/organizations'
import { getAircraftByOwner } from '@/lib/db/aircraft'

export default async function NewFerryFlightPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organizations and aircraft
  const organizations = await getUserOrganizations(user.id)
  const allAircraft = []
  
  // If user has no organizations, they can still create a flight (owner_id can be null)
  if (organizations.length > 0) {
    for (const org of organizations) {
      const aircraft = await getAircraftByOwner(org.id)
      allAircraft.push(...aircraft)
    }
  }

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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Ferry Flight</h1>
          <p className="text-gray-600">Start tracking a new ferry flight case</p>
        </div>

        <CreateFerryFlightForm 
          organizations={organizations}
          aircraft={allAircraft}
        />
      </main>
    </div>
  )
}

