'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Dashboard } from '@/components/dashboard/dashboard'
import { sharedAuthManager } from '@/lib/shared-auth'
import { Loader2 } from 'lucide-react'

interface User {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  user_metadata?: Record<string, unknown>
}

function HRMSContent() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

  const checkAuthentication = useCallback(async () => {
    try {
      console.log('HRMS: Checking authentication...')
      
      // First check URL parameter for session token
      const sessionParam = searchParams.get('session')
      if (sessionParam) {
        try {
          const sessionData = JSON.parse(decodeURIComponent(sessionParam))
          console.log('HRMS: Found session in URL parameter:', sessionData)
          
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
          console.error('HRMS: Error parsing session parameter:', error)
        }
      }
      
      console.log('HRMS: localStorage session:', localStorage.getItem('hrms_shared_session'))
      
      const { isAuthenticated, user: authUser } = await sharedAuthManager.checkAuthStatus()
      
      console.log('HRMS: Auth result:', { isAuthenticated, user: authUser })
      
      if (!isAuthenticated) {
        console.log('HRMS: Not authenticated, redirecting to auth provider')
        // Redirect to auth provider
        window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
        return
      }

      console.log('HRMS: Authenticated successfully, setting user')
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
          <p className="text-gray-600">HRMS yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  // Convert User to Employee with required email field
  const employee = {
    ...user,
    email: user.email || '', // Fallback to empty string if email is undefined
    role: 'employee' as const // Default role
  }

  return <Dashboard employee={employee} />
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" /><p className="text-gray-600">HRMS yükleniyor...</p></div></div>}>
      <HRMSContent />
    </Suspense>
  )
}
