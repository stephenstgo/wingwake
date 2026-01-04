import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plane, LogOut } from 'lucide-react'
import { LogoutButton } from '@/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
              <span className="text-gray-700">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-6">Welcome to your WingWake dashboard!</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Active Flights</h2>
              <p className="text-3xl font-bold text-sky-600">0</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Pending Documents</h2>
              <p className="text-3xl font-bold text-orange-600">0</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Completed Flights</h2>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

