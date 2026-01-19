'use client'

import { useState, useEffect } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useMutation, useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { Plane } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/convex/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuthActions()
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth()
  const syncProfile = useMutation(api["mutations/profiles"].syncAuthProfile)

  // Sync profile when auth becomes ready (after sign up)
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      // Sign up with password provider
      const result = await signIn('password', {
        flow: 'signUp',
        email,
        password,
        name: fullName || undefined,
      })

      if (!result) {
        throw new Error('Failed to create account')
      }

      // Redirect immediately - profile sync will happen automatically
      // when the dashboard page loads and checks for user profile
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'An error occurred during signup')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to get started with WingWake</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name (Optional)
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
              placeholder="John Doe"
            />
          </div>

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
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 bg-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-sky-600 hover:text-sky-700 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
