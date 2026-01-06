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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Active Flights</h2>
              <p className="text-3xl font-bold text-sky-600">4</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Pending Documents</h2>
              <p className="text-3xl font-bold text-orange-600">3</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Completed Flights</h2>
              <p className="text-3xl font-bold text-green-600">2</p>
            </div>
          </div>

          {/* Active Flights */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Flights</h2>
            <div className="space-y-4">
              <a 
                href="/dashboard/flight/demo"
                className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Demo Ferry Flight</h3>
                    <p className="text-sm text-gray-600">N12345 • KORD → KLAX</p>
                    <p className="text-xs text-gray-500 mt-1">Cessna 172N • Status: In Progress</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </a>

              <a 
                href="/dashboard/flight/training"
                className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Training Flight</h3>
                    <p className="text-sm text-gray-600">N67890 • KSEA → KPDX</p>
                    <p className="text-xs text-gray-500 mt-1">Piper PA-28-181 • Status: In Progress</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </a>

              <a 
                href="/dashboard/flight/export"
                className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Export Flight</h3>
                    <p className="text-sm text-gray-600">N11111 • KIAH → CYYZ</p>
                    <p className="text-xs text-gray-500 mt-1">Cessna 182T • Status: In Progress</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </a>

              <a 
                href="/dashboard/flight/storage"
                className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Storage Relocation</h3>
                    <p className="text-sm text-gray-600">N22222 • KATL → KPHX</p>
                    <p className="text-xs text-gray-500 mt-1">Beechcraft Baron 58 • Status: In Progress</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Pending Flights */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Flights</h2>
            <div className="space-y-4">
              <a 
                href="/dashboard/flight/maintenance"
                className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Maintenance Ferry</h3>
                    <p className="text-sm text-gray-600">N24680 • KJFK → KMIA</p>
                    <p className="text-xs text-gray-500 mt-1">Beechcraft Bonanza A36 • Status: Pending Documents</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      Pending
                    </span>
                  </div>
                </div>
              </a>

              <a 
                href="/dashboard/flight/delivery"
                className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Delivery Flight</h3>
                    <p className="text-sm text-gray-600">N13579 • KDFW → KPHX</p>
                    <p className="text-xs text-gray-500 mt-1">Mooney M20J • Status: Pending Documents</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      Pending
                    </span>
                  </div>
                </div>
              </a>

              <a 
                href="/dashboard/flight/weighing"
                className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Weighing Flight</h3>
                    <p className="text-sm text-gray-600">N33333 • KDTW → KORD</p>
                    <p className="text-xs text-gray-500 mt-1">Piper PA-32R • Status: Pending Documents</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      Pending
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Completed Flights */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Completed Flights</h2>
            <div className="space-y-4">
              <a 
                href="/dashboard/flight/repositioning"
                className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Repositioning Flight</h3>
                    <p className="text-sm text-gray-600">N98765 • KDEN → KSLC</p>
                    <p className="text-xs text-gray-500 mt-1">Cirrus SR22 • Status: Completed</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Completed
                    </span>
                  </div>
                </div>
              </a>

              <a 
                href="/dashboard/flight/inspection"
                className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Inspection Ferry</h3>
                    <p className="text-sm text-gray-600">N54321 • KBOS → KBWI</p>
                    <p className="text-xs text-gray-500 mt-1">Diamond DA40 • Status: Completed</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Completed
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

