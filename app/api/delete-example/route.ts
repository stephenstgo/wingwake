import { createClient } from '@/lib/supabase/server'
import { deleteExampleFlights } from '@/lib/scripts/delete-example-flights'
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

    const result = await deleteExampleFlights(user.id)
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${result.flights} flights, ${result.aircraft} aircraft, and ${result.organizations} organizations`,
      ...result 
    })
  } catch (error) {
    console.error('Error deleting data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json({ 
      error: 'Failed to delete data',
      details: errorMessage,
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}


