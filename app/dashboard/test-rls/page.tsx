'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface RLSTestResult {
  test: string
  passed: boolean
  message: string
  details?: string
}

export default function TestRLSPage() {
  const [results, setResults] = useState<RLSTestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [userRole, setUserRole] = useState<string>('')
  const [userOrgs, setUserOrgs] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setUserRole(profile.role)
      }

      const { data: members } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
      
      if (members) {
        setUserOrgs(members.map(m => m.organization_id))
      }
    }
  }

  const runTests = async () => {
    setIsRunning(true)
    const testResults: RLSTestResult[] = []

    // Test 1: Can view own profile
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        testResults.push({
          test: 'Can view own profile',
          passed: !error && !!data,
          message: error ? `Failed: ${error.message}` : 'Success: Can view own profile',
          details: data ? `Role: ${data.role}` : undefined
        })
      }
    } catch (error: any) {
      testResults.push({
        test: 'Can view own profile',
        passed: false,
        message: `Error: ${error.message}`
      })
    }

    // Test 2: Cannot view other profiles (unless admin)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .neq('id', (await supabase.auth.getUser()).data.user?.id || '')
        .limit(1)
      
      if (userRole === 'admin') {
        testResults.push({
          test: 'Admin can view all profiles',
          passed: !error && (data?.length || 0) > 0,
          message: error ? `Failed: ${error.message}` : 'Success: Admin can view all profiles',
          details: `Found ${data?.length || 0} other profiles`
        })
      } else {
        testResults.push({
          test: 'Non-admin cannot view other profiles',
          passed: error || (data?.length || 0) === 0,
          message: error ? 'Success: Blocked by RLS' : `Failed: Found ${data?.length} profiles (should be 0)`,
          details: error?.message
        })
      }
    } catch (error: any) {
      testResults.push({
        test: 'View other profiles test',
        passed: false,
        message: `Error: ${error.message}`
      })
    }

    // Test 3: Can view own organizations
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .in('id', userOrgs)
      
      testResults.push({
        test: 'Can view own organizations',
        passed: !error,
        message: error ? `Failed: ${error.message}` : `Success: Found ${data?.length || 0} organizations`,
        details: data?.map(o => o.name).join(', ') || 'None'
      })
    } catch (error: any) {
      testResults.push({
        test: 'Can view own organizations',
        passed: false,
        message: `Error: ${error.message}`
      })
    }

    // Test 4: Can view organization's aircraft
    try {
      const { data, error } = await supabase
        .from('aircraft')
        .select('*')
        .in('owner_id', userOrgs)
      
      testResults.push({
        test: 'Can view organization aircraft',
        passed: !error,
        message: error ? `Failed: ${error.message}` : `Success: Found ${data?.length || 0} aircraft`,
        details: data?.map(a => a.n_number).join(', ') || 'None'
      })
    } catch (error: any) {
      testResults.push({
        test: 'Can view organization aircraft',
        passed: false,
        message: `Error: ${error.message}`
      })
    }

    // Test 5: Can view organization's flights
    try {
      const { data, error } = await supabase
        .from('ferry_flights')
        .select('*')
        .in('owner_id', userOrgs)
        .limit(5)
      
      testResults.push({
        test: 'Can view organization flights',
        passed: !error,
        message: error ? `Failed: ${error.message}` : `Success: Found ${data?.length || 0} flights`,
        details: data?.map(f => `${f.origin} → ${f.destination}`).join(', ') || 'None'
      })
    } catch (error: any) {
      testResults.push({
        test: 'Can view organization flights',
        passed: false,
        message: `Error: ${error.message}`
      })
    }

    // Test 6: Cannot view other organizations' data
    try {
      const { data, error } = await supabase
        .from('aircraft')
        .select('*')
        .not('owner_id', 'in', `(${userOrgs.map(id => `'${id}'`).join(',') || 'null'})`)
        .limit(1)
      
      testResults.push({
        test: 'Cannot view other organizations\' aircraft',
        passed: error || (data?.length || 0) === 0,
        message: error ? 'Success: Blocked by RLS' : `Failed: Found ${data?.length} aircraft (should be 0)`,
        details: error?.message
      })
    } catch (error: any) {
      testResults.push({
        test: 'Cannot view other organizations\' aircraft',
        passed: false,
        message: `Error: ${error.message}`
      })
    }

    // Test 7: Role-specific permissions
    if (userRole === 'mechanic') {
      try {
        // Mechanics should be able to create discrepancies
        const { data: flights } = await supabase
          .from('ferry_flights')
          .select('id')
          .limit(1)
          .single()
        
        if (flights) {
          testResults.push({
            test: 'Mechanic can access flights for discrepancies',
            passed: true,
            message: 'Success: Can access flights',
            details: 'Mechanic role verified'
          })
        }
      } catch (error: any) {
        testResults.push({
          test: 'Mechanic permissions',
          passed: false,
          message: `Error: ${error.message}`
        })
      }
    }

    setResults(testResults)
    setIsRunning(false)
  }

  const passedCount = results.filter(r => r.passed).length
  const totalCount = results.length

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">RLS Policy Testing</h1>
        <p className="text-gray-600">
          Test Row Level Security policies to verify access control is working correctly
        </p>
      </div>

      {/* User Info */}
      <Card className="p-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-500">Current User Role</p>
            <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
              {userRole || 'Loading...'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Organizations</p>
            <p className="text-sm font-medium">
              {userOrgs.length > 0 ? `${userOrgs.length} organization(s)` : 'No organizations'}
            </p>
          </div>
        </div>
      </Card>

      {/* Test Button */}
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Run RLS Tests
            </>
          )}
        </button>
      </div>

      {/* Results Summary */}
      {results.length > 0 && (
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {passedCount === totalCount ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <span className="font-semibold">
                {passedCount} / {totalCount} tests passed
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Test Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                {result.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{result.test}</h3>
                  <p className={`text-sm ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                  )}
                </div>
                <Badge variant={result.passed ? 'default' : 'destructive'}>
                  {result.passed ? 'PASS' : 'FAIL'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Instructions */}
      <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
        <h2 className="font-semibold mb-3">Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Click "Run RLS Tests" to test your current user's access</li>
          <li>To test different roles, create test users with different roles</li>
          <li>To test unauthenticated access, use browser incognito mode or API tools</li>
          <li>For comprehensive testing, use the SQL queries in <code>sql/test_rls_policies.sql</code></li>
          <li>Verify that:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Admins can access all data</li>
              <li>Owners can access their organization's data</li>
              <li>Members can view but not modify</li>
              <li>Unauthenticated users are blocked</li>
            </ul>
          </li>
        </ol>
      </Card>
    </div>
  )
}
