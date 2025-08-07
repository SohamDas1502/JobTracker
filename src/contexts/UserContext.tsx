'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: string
}

interface UserContextType {
  profile: UserProfile | null
  loading: boolean
  updateProfile: (newProfile: UserProfile) => void
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    if (!session?.user?.id) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile)
  }

  const refreshProfile = async () => {
    setLoading(true)
    await fetchProfile()
  }

  useEffect(() => {
    if (status === 'loading') return
    fetchProfile()
  }, [session?.user?.id, status])

  return (
    <UserContext.Provider value={{ profile, loading, updateProfile, refreshProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
