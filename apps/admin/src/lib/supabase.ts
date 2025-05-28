import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  settings?: any
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