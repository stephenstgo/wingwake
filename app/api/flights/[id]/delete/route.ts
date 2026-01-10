import { createClient } from '@/lib/supabase/server'
import { deleteFerryFlight, getFerryFlight } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'User not authenticated'
      }, { status: 401 })
    }

    const { id } = await params
    
    // First, verify the flight exists and user has permission
    const flight = await getFerryFlight(id)
    
    if (!flight) {
      return NextResponse.json({ 
        error: 'Not Found',
        details: 'Flight not found'
      }, { status: 404 })
    }

    // Delete the flight
    const success = await deleteFerryFlight(id)
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to delete flight',
        details: 'An error occurred while deleting the flight'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Flight deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting flight:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      error: 'Failed to delete flight',
      details: errorMessage
    }, { status: 500 })
  }
}
