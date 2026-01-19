'use client'

import { createContext, useContext } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '@/lib/convex/client'

type AuthContextType = {
  user: { _id: string; email?: string; fullName?: string; role?: string } | null
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const user = useQuery(api["queries/profiles"].getCurrentUserProfile)

  return (
    <AuthContext.Provider value={{ 
      user: user || null, 
      loading: isLoading || (isAuthenticated && user === undefined),
      isAuthenticated: isAuthenticated && user !== null
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
