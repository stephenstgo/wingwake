'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UpdateProfile } from '@/lib/types/database'

/**
 * Get the current user's profile
 */
export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { profile }
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(updates: UpdateProfile) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/account')
  return { profile }
}

/**
 * Update the user's password
 */
export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'Current password is incorrect' }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true }
}
