import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: authError?.message 
      }, { status: 401 })
    }
    
    // Test auth.uid() in database context
    const { data: uidTest, error: uidError } = await supabase.rpc('get_user_id')
    
    // Test SELECT (this works)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user.id)
      .single()
    
    // Test INSERT into organizations (this fails)
    const testOrgName = `Test Org ${Date.now()}`
    
    // First, test if we can check auth.uid() in the INSERT context
    // by using a function that runs in the same context
    const { data: uidInInsertContext, error: uidError2 } = await supabase
      .rpc('get_user_id')
    
    // Try INSERT without SELECT first
    const { error: insertErrorNoSelect } = await supabase
      .from('organizations')
      .insert({
        name: testOrgName + '_no_select',
        type: 'llc'
      })
    
    // Then try with SELECT
    const { data: insertData, error: insertError } = await supabase
      .from('organizations')
      .insert({
        name: testOrgName,
        type: 'llc'
      })
      .select('id')
      .single()
    
    // If insert succeeded, clean up
    if (insertData?.id) {
      await supabase
        .from('organizations')
        .delete()
        .eq('id', insertData.id)
    }
    
    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      userEmail: user.email,
      authUidTest: uidTest,
      authUidError: uidError?.message,
      authUidInInsertContext: uidInInsertContext,
      authUidErrorInInsertContext: uidError2?.message,
      profileData: profileData,
      profileError: profileError?.message,
      canAccessProfile: !!profileData && !profileError,
      insertSucceeded: !!insertData && !insertError,
      insertData: insertData,
      insertError: insertError ? {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      } : null,
      insertErrorNoSelect: insertErrorNoSelect ? {
        code: insertErrorNoSelect.code,
        message: insertErrorNoSelect.message,
        details: insertErrorNoSelect.details,
        hint: insertErrorNoSelect.hint,
      } : null,
      insertWithoutSelectSucceeded: !insertErrorNoSelect,
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

