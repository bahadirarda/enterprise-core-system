import { useState, useEffect } from 'react'
import { supabase, Company, AdminUser, AdminStats } from '@/lib/supabase'

type RecentActivity = {
  id: number;
  text: string;
  time: string;
  type: 'success' | 'info';
};

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch company count
      const { count: companyCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })

      // Fetch user count 
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Calculate today's signups
      const today = new Date().toISOString().split('T')[0]
      const { count: todaySignups } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)

      setStats({
        totalCompanies: companyCount || 0,
        totalUsers: userCount || 0,
        totalRevenue: (companyCount || 0) * 50000, // Mock revenue calculation
        activeSessions: Math.floor(Math.random() * 100) + 50, // Mock active sessions
        todaySignups: todaySignups || 0,
        supportTickets: Math.floor(Math.random() * 20) + 5 // Mock support tickets
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      
      // Fetch organizations and their user counts
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          domain,
          created_at,
          updated_at,
          settings
        `)

      if (orgError) throw orgError

      // For each organization, get user count
      const companiesWithCounts = await Promise.all(
        (orgs || []).map(async (org) => {
          const { count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)

          const userCount = count || 0
          const plan: 'Basic' | 'Professional' | 'Enterprise' = 
            userCount > 50 ? 'Enterprise' : userCount > 10 ? 'Professional' : 'Basic'

          return {
            id: org.id,
            name: org.name,
            domain: org.domain || `${org.name.toLowerCase().replace(/\s+/g, '')}.com`,
            plan,
            status: 'active' as const,
            user_count: userCount,
            revenue: userCount * 1200, // Mock revenue per user
            created_at: org.created_at,
            updated_at: org.updated_at,
            settings: org.settings
          } as Company
        })
      )

      setCompanies(companiesWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  return { companies, loading, error, refetch: fetchCompanies }
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          organization_id,
          role,
          created_at,
          updated_at,
          organizations!inner(
            id,
            name
          )
        `)
        .limit(50)

      if (profileError) throw profileError

      const usersWithStatus = (profiles || []).map(profile => {
        const organization = Array.isArray(profile.organizations) 
          ? profile.organizations[0] 
          : profile.organizations

        const status: 'online' | 'offline' = Math.random() > 0.7 ? 'online' : 'offline'

        return {
          id: profile.id,
          email: profile.email,
          company_id: profile.organization_id,
          role: profile.role || 'user',
          last_login: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status,
          company: {
            id: organization.id,
            name: organization.name,
            domain: `${organization.name.toLowerCase().replace(/\s+/g, '')}.com`,
            plan: 'Professional' as const,
            status: 'active' as const,
            user_count: 0,
            revenue: 0,
            created_at: '',
            updated_at: ''
          }
        } as AdminUser
      })

      setUsers(usersWithStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return { users, loading, error, refetch: fetchUsers }
}

export function useRecentActivities() {
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        
        // Fetch recent organizations
        const { data: recentOrgs } = await supabase
          .from('organizations')
          .select('name, created_at')
          .order('created_at', { ascending: false })
          .limit(2)

        // Fetch recent users
        const { data: recentUsers } = await supabase
          .from('user_profiles')
          .select('email, created_at')
          .order('created_at', { ascending: false })
          .limit(2)

        const activities: RecentActivity[] = [
          ...(recentOrgs || []).map(org => ({
            id: Math.random(),
            text: `Yeni şirket eklendi: ${org.name}`,
            time: formatTimeAgo(org.created_at),
            type: 'success' as const
          })),
          ...(recentUsers || []).map(user => ({
            id: Math.random(),
            text: `Yeni kullanıcı kaydı: ${user.email}`,
            time: formatTimeAgo(user.created_at),
            type: 'info' as const
          }))
        ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4)

        setActivities(activities)
      } catch (err) {
        console.error('Error fetching activities:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  return { activities, loading }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} saat önce`
  } else {
    return `${Math.floor(diffInMinutes / 1440)} gün önce`
  }
} 