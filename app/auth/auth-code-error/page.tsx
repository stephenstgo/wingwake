import Link from 'next/link'
import { Plane } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Plane className="w-10 h-10 text-sky-600" />
          <span className="text-2xl text-gray-900 font-semibold ml-2">WingWake</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          There was an error authenticating your account. This could be due to an expired or invalid link.
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
          >
            Go to Login
          </Link>
          <Link
            href="/signup"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  )
}


