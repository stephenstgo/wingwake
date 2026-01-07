import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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
    
    // Test if we can query auth.uid() in the database
    // This will tell us if the JWT is being passed correctly
    const { data: uidTest, error: uidError } = await supabase
      .rpc('get_user_id')
    
    // Try a simple query that requires authentication
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      userEmail: user.email,
      authUidTest: uidTest,
      authUidError: uidError?.message,
      profileData: profileData,
      profileError: profileError?.message,
      canAccessProfile: !!profileData && !profileError
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


