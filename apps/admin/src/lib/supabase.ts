import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Mock client for build time
const createMockClient = (): SupabaseClient => {
  const mockClient = {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({
        order: () => ({
          limit: () => Promise.resolve({ data: [], error: null })
        }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        }),
        single: () => Promise.resolve({ data: null, error: null })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null })
          })
        })
      })
    })
  } as unknown as SupabaseClient;
  return mockClient;
};

// Lazy initialization to avoid build-time errors
let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  // Check if we're in build time
  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createMockClient();
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClient;
};

// Create client function for API routes
export const createSupabaseClient = () => {
  return getSupabaseClient();
}

// Default export for components - use getter to avoid build-time initialization
export const supabase = {
  get auth() {
    return getSupabaseClient().auth;
  },
  from: (table: string) => getSupabaseClient().from(table),
  storage: getSupabaseClient().storage,
  functions: getSupabaseClient().functions,
  realtime: getSupabaseClient().realtime,
};

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

// Eğer bir yerde sabit port ile yönlendirme varsa:
// örn: fetch(`http://localhost:8080/api/...`) yerine
// fetch(`http://localhost:${process.env.NEXT_PUBLIC_PORT}/api/...`)
// veya import ports from '../../../ports.js' ile kullanılabilir