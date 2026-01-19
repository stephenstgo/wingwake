'use client'

import { useState, useEffect } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useConvexAuth } from 'convex/react'
import { Plane } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/convex/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuthActions()
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth()
  const syncProfile = useMutation(api["mutations/profiles"].syncAuthProfile)

  useEffect(() => {
    const msg = searchParams.get('message')
    if (msg) {
      setMessage(decodeURIComponent(msg))
    }
  }, [searchParams])

  // Sync profile when auth becomes ready (after sign in)
  // Add a small delay to ensure auth token is fully propagated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const timer = setTimeout(async () => {
        try {
          const profileId = await syncProfile({})
          if (!profileId) {
            // Profile sync returned null (not authenticated yet) - will retry on page load
            console.log('Profile sync deferred - will retry on page load')
          }
        } catch (error) {
          // Not critical - will retry on page load
          console.warn('Background profile sync failed:', error)
        }
      }, 1000) // Wait 1 second for auth token to propagate
      
      return () => clearTimeout(timer)
    }
  }, [authLoading, isAuthenticated, syncProfile])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn('password', {
        flow: 'signIn',
        email,
        password,
      })

      if (!result) {
        throw new Error('Failed to sign in')
      }

      // Redirect immediately - profile sync will happen automatically
      // when the dashboard page loads and checks for user profile
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Plane className="w-10 h-10 text-sky-600" />
            <span className="text-2xl text-gray-900 font-semibold ml-2">WingWake</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-sky-600 hover:text-sky-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
