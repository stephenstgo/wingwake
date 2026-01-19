'use client'

import { useState, useEffect } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '@/lib/convex/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface TestResult {
  test: string
  passed: boolean
  message: string
  details?: string
}

export default function TestRLSPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const { isLoading, isAuthenticated } = useConvexAuth()
  const profile = useQuery(api["queries/profiles"].getCurrentUserProfile)

  useEffect(() => {
    if (profile) {
      loadUserInfo()
    }
  }, [profile])

  const loadUserInfo = async () => {
    if (!profile) return;
    // User info is already loaded via useQuery
  }

  const runTests = async () => {
    setIsRunning(true)
    setResults([])

    if (!profile) {
      setResults([{
        test: 'Authentication',
        passed: false,
        message: 'Not authenticated',
        details: 'Please sign in to run tests'
      }])
      setIsRunning(false)
      return
    }

    const testResults: TestResult[] = []

    // Test 1: Can view own profile
    try {
      const ownProfile = await fetch(`/api/test-profile?profileId=${profile._id}`).then(r => r.json())
      testResults.push({
        test: 'View Own Profile',
        passed: !!ownProfile,
        message: ownProfile ? 'Can view own profile' : 'Cannot view own profile',
      })
    } catch (error) {
      testResults.push({
        test: 'View Own Profile',
        passed: false,
        message: 'Error testing profile access',
        details: error instanceof Error ? error.message : String(error)
      })
    }

    // Test 2: Can view own organizations
    try {
      const orgs = await fetch(`/api/test-organizations`).then(r => r.json())
      testResults.push({
        test: 'View Own Organizations',
        passed: Array.isArray(orgs),
        message: Array.isArray(orgs) ? `Can view ${orgs.length} organizations` : 'Cannot view organizations',
      })
    } catch (error) {
      testResults.push({
        test: 'View Own Organizations',
        passed: false,
        message: 'Error testing organization access',
        details: error instanceof Error ? error.message : String(error)
      })
    }

    setResults(testResults)
    setIsRunning(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-4">Not Authenticated</h2>
          <p className="text-gray-600 text-center mb-6">
            Please sign in to run authorization tests.
          </p>
          <p className="text-sm text-gray-500 text-center">
            Note: Convex uses query-level authorization instead of RLS policies.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-sky-600" />
            <h1 className="text-2xl font-bold">Convex Authorization Tests</h1>
          </div>
          <p className="text-gray-600 mb-4">
            This page tests Convex query authorization. Unlike Supabase RLS, Convex handles
            authorization in query/mutation logic.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              <strong>Current User:</strong> {profile.email || 'No email'} ({profile.role})
            </p>
          </div>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
        </Card>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center gap-3">
                  {result.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{result.test}</h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                    )}
                  </div>
                  <Badge variant={result.passed ? 'default' : 'destructive'}>
                    {result.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-6 mt-6 bg-yellow-50 border-yellow-200">
          <AlertCircle className="w-5 h-5 text-yellow-600 mb-2" />
          <h3 className="font-semibold text-yellow-900 mb-2">Note</h3>
          <p className="text-sm text-yellow-800">
            This page is deprecated. It was originally for testing Supabase RLS policies.
            Convex doesn't use RLS - authorization is handled in your query/mutation logic.
            Use the Convex dashboard to verify data access.
          </p>
        </Card>
      </div>
    </div>
  )
}
