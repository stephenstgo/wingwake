import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plane, ArrowLeft } from 'lucide-react'
import { AccountMenu } from '@/components/account-menu'
import { getUserOrganizations } from '@/lib/db/organizations'
import { AircraftForm } from '@/components/aircraft-form'
import { Card } from '@/components/ui/card'

export default async function NewAircraftPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const organizations = await getUserOrganizations(user.id)

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
            </div>
            <div className="flex items-center gap-4">
              <AccountMenu userEmail={user.email} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/aircraft"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Aircraft
        </Link>

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Aircraft</h1>
          <AircraftForm
            organizations={organizations}
          />
        </Card>
      </main>
    </div>
  )
}
