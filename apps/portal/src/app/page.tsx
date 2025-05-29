'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { PortalDashboard } from '@/components/portal/portal-dashboard'
import { sharedAuthManager } from '@/lib/shared-auth'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

  const checkAuthentication = useCallback(async () => {
    try {
      console.log('Portal: Checking authentication...')
      
      // First check URL parameter for session token
      const sessionParam = searchParams.get('session')
      if (sessionParam) {
        try {
          const sessionData = JSON.parse(decodeURIComponent(sessionParam))
          console.log('Portal: Found session in URL parameter:', sessionData)
          
          // Save to localStorage and remove from URL
          sharedAuthManager.setSharedSession(sessionData)
          
          // Clean URL
          const url = new URL(window.location.href)
          url.searchParams.delete('session')
          window.history.replaceState({}, '', url.toString())
          
          setUser(sessionData.user)
          sharedAuthManager.updateActivity()
          setIsLoading(false)
          return
        } catch (error) {
          console.error('Error parsing session parameter:', error)
        }
      }

      // Check for existing session in localStorage
      const existingSession = sharedAuthManager.getSharedSession()
      if (existingSession && existingSession.user) {
        console.log('Portal: Found existing session')
        setUser(existingSession.user)
        sharedAuthManager.updateActivity()
        setIsLoading(false)
        return
      }

      // No valid session found, get fresh authentication
      console.log('Portal: No session found, checking direct authentication...')
      const { isAuthenticated, user: authUser } = await sharedAuthManager.checkAuthStatus()
      
      if (!isAuthenticated || !authUser) {
        console.log('Portal: No authenticated user, redirecting to auth...')
        window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
        return
      }

      console.log('Portal: Authenticated successfully, setting user')
      setUser(authUser)
      
      // Start activity monitoring
      sharedAuthManager.updateActivity()
      
    } catch (error) {
      console.error('Error checking authentication:', error)
      window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    checkAuthentication()
  }, [checkAuthentication])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Kikos Portal yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return <PortalDashboard />
}
