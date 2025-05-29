import { supabase } from './supabase'

// Shared authentication configuration
export const AUTH_CONFIG = {
  TOKEN_DURATION: 60 * 60 * 1000, // 60 minutes in milliseconds
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  SESSION_KEY: 'hrms_shared_session',
  ACTIVITY_KEY: 'hrms_last_activity'
}

interface User {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  user_metadata?: Record<string, unknown>
}

export interface SharedSession {
  access_token: string
  refresh_token: string
  user: User
  expires_at: number
  created_at: number
}

export class SharedAuthManager {
  private static instance: SharedAuthManager
  private sessionCheckInterval: NodeJS.Timeout | null = null

  static getInstance(): SharedAuthManager {
    if (!SharedAuthManager.instance) {
      SharedAuthManager.instance = new SharedAuthManager()
    }
    return SharedAuthManager.instance
  }

  // Set shared session across all apps
  setSharedSession(session: SharedSession): void {
    try {
      // Store in localStorage for cross-app sharing
      localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session))
      localStorage.setItem(AUTH_CONFIG.ACTIVITY_KEY, Date.now().toString())
      
      // Start activity monitoring
      this.startActivityMonitoring()
      
      console.log('Shared session set successfully')
    } catch (error) {
      console.error('Error setting shared session:', error)
    }
  }

  // Get shared session
  getSharedSession(): SharedSession | null {
    try {
      const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY)
      if (!sessionData) return null

      const session: SharedSession = JSON.parse(sessionData)
      
      // Check if session is expired
      if (this.isSessionExpired(session)) {
        this.clearSharedSession()
        return null
      }

      return session
    } catch (error) {
      console.error('Error getting shared session:', error)
      return null
    }
  }

  // Check if session is expired
  isSessionExpired(session: SharedSession): boolean {
    const now = Date.now()
    return now > session.expires_at
  }

  // Check if session needs refresh (5 minutes before expiry)
  needsRefresh(session: SharedSession): boolean {
    const now = Date.now()
    return now > (session.expires_at - AUTH_CONFIG.REFRESH_THRESHOLD)
  }

  // Update activity timestamp
  updateActivity(): void {
    localStorage.setItem(AUTH_CONFIG.ACTIVITY_KEY, Date.now().toString())
  }

  // Get last activity timestamp
  getLastActivity(): number {
    const activity = localStorage.getItem(AUTH_CONFIG.ACTIVITY_KEY)
    return activity ? parseInt(activity) : 0
  }

  // Check if user is active (activity within last 60 minutes)
  isUserActive(): boolean {
    const lastActivity = this.getLastActivity()
    const now = Date.now()
    return (now - lastActivity) < AUTH_CONFIG.TOKEN_DURATION
  }

  // Refresh session if needed and user is active
  async refreshSessionIfNeeded(): Promise<boolean> {
    const session = this.getSharedSession()
    if (!session) return false

    // If user is active and session needs refresh, extend it
    if (this.isUserActive() && this.needsRefresh(session)) {
      try {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: session.refresh_token
        })

        if (error) throw error

        if (data.session) {
          const newSession: SharedSession = {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.session.user,
            expires_at: Date.now() + AUTH_CONFIG.TOKEN_DURATION,
            created_at: Date.now()
          }

          this.setSharedSession(newSession)
          console.log('Session refreshed successfully')
          return true
        }
      } catch (error) {
        console.error('Error refreshing session:', error)
        this.clearSharedSession()
        return false
      }
    }

    return true
  }

  // Clear shared session
  clearSharedSession(): void {
    try {
      localStorage.removeItem(AUTH_CONFIG.SESSION_KEY)
      localStorage.removeItem(AUTH_CONFIG.ACTIVITY_KEY)
      this.stopActivityMonitoring()
      console.log('Shared session cleared')
    } catch (error) {
      console.error('Error clearing shared session:', error)
    }
  }

  // Start activity monitoring
  private startActivityMonitoring(): void {
    // Clear existing interval
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
    }

    // Check session every minute
    this.sessionCheckInterval = setInterval(() => {
      this.refreshSessionIfNeeded()
    }, 60000) // 1 minute

    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const updateActivityHandler = () => {
      this.updateActivity()
    }

    events.forEach(event => {
      document.addEventListener(event, updateActivityHandler, true)
    })
  }

  // Stop activity monitoring
  private stopActivityMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
  }

  // Check authentication status across apps
  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    const session = this.getSharedSession()
    
    if (!session) {
      return { isAuthenticated: false, user: null }
    }

    // Refresh session if needed
    const refreshed = await this.refreshSessionIfNeeded()
    
    if (!refreshed) {
      return { isAuthenticated: false, user: null }
    }

    const currentSession = this.getSharedSession()
    return { 
      isAuthenticated: true, 
      user: currentSession?.user || null 
    }
  }

  // Sign out from all apps
  async signOutFromAllApps(): Promise<void> {
    try {
      await supabase.auth.signOut()
      this.clearSharedSession()
      
      // Redirect to auth provider
      window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
}

// Export singleton instance
export const sharedAuthManager = SharedAuthManager.getInstance()

// Utility functions for components
export const useSharedAuth = () => {
  return {
    checkAuth: () => sharedAuthManager.checkAuthStatus(),
    signOut: () => sharedAuthManager.signOutFromAllApps(),
    updateActivity: () => sharedAuthManager.updateActivity(),
    getSession: () => sharedAuthManager.getSharedSession()
  }
} 