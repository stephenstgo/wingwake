'use client'

import { useEffect } from 'react'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { api } from '@/lib/convex/client'

/**
 * Client component that ensures user profile is synced when authenticated
 * This handles the case where profile doesn't exist yet after sign in/sign up
 */
export function ProfileSync() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const profile = useQuery(api["queries/profiles"].getCurrentUserProfile)
  const syncProfile = useMutation(api["mutations/profiles"].syncAuthProfile)

  useEffect(() => {
    // Only sync if:
    // 1. Auth is ready (not loading)
    // 2. User is authenticated
    // 3. Profile query has completed (not undefined, could be null)
    // 4. Profile doesn't exist (null)
    if (!isLoading && isAuthenticated && profile === null) {
      // Add a small delay to ensure auth token is fully propagated
      const timer = setTimeout(async () => {
        try {
          const profileId = await syncProfile({})
          if (profileId) {
            console.log('Profile synced successfully:', profileId)
          } else {
            // Profile sync returned null - auth not ready yet, will retry
            console.log('Profile sync deferred - auth not ready')
          }
        } catch (error) {
          console.warn('Profile sync error (will retry):', error)
        }
      }, 500) // Wait 500ms for auth token to propagate

      return () => clearTimeout(timer)
    }
  }, [isLoading, isAuthenticated, profile, syncProfile])

  // This component doesn't render anything
  return null
}
