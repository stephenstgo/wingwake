import { createClient } from '@/lib/supabase/server'
import { seedExampleFlights } from '@/lib/scripts/seed-example-flights'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ 
        error: 'Authentication error',
        details: authError.message || 'Failed to get user'
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'User not found'
      }, { status: 401 })
    }

    // Verify user has a profile (create if missing)
    let profile
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        // Check if it's a recursion error
        if (profileError.message?.includes('infinite recursion') || profileError.code === '42P17') {
          console.error('RLS recursion detected in profiles. Run migration 008_fix_profiles_rls.sql')
          return NextResponse.json({ 
            error: 'RLS Policy Error',
            details: 'Infinite recursion detected in profiles policy. Please run migration 008_fix_profiles_rls.sql in Supabase SQL Editor to fix this.',
            code: profileError.code
          }, { status: 400 })
        }
        console.error('Profile error:', profileError)
        return NextResponse.json({ 
          error: 'Profile error',
          details: `Error checking profile: ${profileError.message || profileError.code || 'Unknown error'}`,
          code: profileError.code
        }, { status: 400 })
      }

      profile = profileData

      if (!profile) {
        // Profile doesn't exist - create it
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            role: 'owner'
          })
        
        if (createProfileError) {
          console.error('Error creating profile:', createProfileError)
          return NextResponse.json({ 
            error: 'Profile creation error',
            details: `Failed to create profile: ${createProfileError.message || createProfileError.code || 'Unknown error'}`,
            code: createProfileError.code
          }, { status: 400 })
        }
      }
    } catch (error) {
      console.error('Unexpected error checking profile:', error)
      return NextResponse.json({ 
        error: 'Profile check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 })
    }

    const result = await seedExampleFlights(user.id)
    return NextResponse.json({ 
      success: true, 
      message: `Created ${result.organizations} organizations, ${result.aircraft} aircraft, and ${result.flights} flights`,
      ...result 
    })
  } catch (error) {
    console.error('Error seeding data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const errorName = error instanceof Error ? error.name : 'Error'
    
    // Log full error details for debugging
    console.error('Full error details:', {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      error: error
    })
    
    return NextResponse.json({ 
      error: 'Failed to seed data',
      details: errorMessage,
      message: errorMessage,
      name: errorName,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}

