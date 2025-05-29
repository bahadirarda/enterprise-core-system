import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create client function for API routes
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Default export for components
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export createClient for backward compatibility
export { createSupabaseClient as createClient }

// Admin-specific types
export interface Company {
  id: string
  name: string
  domain: string
  plan: 'Basic' | 'Professional' | 'Enterprise'
  status: 'active' | 'inactive' | 'trial'
  user_count: number
  revenue: number
  created_at: string
  updated_at: string
  settings?: Record<string, unknown>
}

export interface AdminUser {
  id: string
  email: string
  company_id: string
  role: string
  last_login: string
  status: 'online' | 'offline'
  company?: Company
}

export interface AdminStats {
  totalCompanies: number
  totalUsers: number
  totalRevenue: number
  activeSessions: number
  todaySignups: number
  supportTickets: number
} 