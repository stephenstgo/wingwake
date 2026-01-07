import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Test endpoint to check RLS policies
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const tests = {
    canViewOwnMemberships: false,
    canInsertOwnMemberships: false,
    hasProfile: false,
  }

  // Test 1: Can view own memberships
  const { error: viewError } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  tests.canViewOwnMemberships = !viewError || viewError.code === 'PGRST116'

  // Test 2: Can insert own membership (test with a dummy org that we'll delete)
  const { data: testOrg } = await supabase
    .from('organizations')
    .insert({ name: 'RLS Test Org', type: 'llc' })
    .select()
    .single()

  if (testOrg) {
    const { error: insertError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: testOrg.id,
        user_id: user.id,
        role: 'owner'
      })

    tests.canInsertOwnMemberships = !insertError

    // Cleanup
    await supabase.from('organization_members').delete().eq('organization_id', testOrg.id)
    await supabase.from('organizations').delete().eq('id', testOrg.id)
  }

  // Test 3: Has profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  tests.hasProfile = !!profile

  const recommendations = []
  
  if (!tests.canViewOwnMemberships) {
    recommendations.push({
      issue: 'Cannot view own memberships',
      fix: `DROP POLICY IF EXISTS "Users can view own memberships" ON organization_members;
CREATE POLICY "Users can view own memberships" ON organization_members FOR SELECT TO authenticated USING (user_id = auth.uid());`
    })
  }
  
  if (!tests.canInsertOwnMemberships) {
    recommendations.push({
      issue: 'Cannot insert own memberships',
      fix: `DROP POLICY IF EXISTS "Users can insert own memberships" ON organization_members;
CREATE POLICY "Users can insert own memberships" ON organization_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());`
    })
  }
  
  if (!tests.hasProfile) {
    recommendations.push({
      issue: 'User profile does not exist',
      fix: `INSERT INTO profiles (id, email, role) VALUES ('${user.id}', '${user.email || 'user@example.com'}', 'owner') ON CONFLICT (id) DO NOTHING;`
    })
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    tests,
    recommendations,
    allPassed: tests.canViewOwnMemberships && tests.canInsertOwnMemberships && tests.hasProfile
  })
}

