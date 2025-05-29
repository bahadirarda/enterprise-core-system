import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Mock client for build time
const createMockClient = (): SupabaseClient => {
  return {
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
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
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

// Database types for better TypeScript support
export interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  hire_date: string
  salary?: number
  status: 'active' | 'inactive' | 'terminated'
  department?: {
    id: string
    name: string
  }
  position?: {
    id: string
    title: string
  }
  manager?: {
    id: string
    first_name: string
    last_name: string
  }
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: 'annual' | 'sick' | 'maternity' | 'personal' | 'other'
  start_date: string
  end_date: string
  days_requested: number
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Attendance {
  id: string
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  total_hours?: number
  status: string
}

export interface Payroll {
  id: string
  employee_id: string
  pay_period_start: string
  pay_period_end: string
  gross_pay: number
  net_pay: number
  status: 'draft' | 'approved' | 'paid'
}

// Employee data fetchers
export const getCurrentEmployee = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: employee, error } = await supabase
    .from('employees')
    .select(`
      *,
      department:departments(id, name),
      position:positions(id, title),
      manager:employees!manager_id(id, first_name, last_name)
    `)
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    console.error('Error fetching employee:', error)
    return null
  }
  
  return employee as Employee
}

export const getEmployeeLeaveRequests = async (employeeId: string) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching leave requests:', error)
    return []
  }
  
  return data as LeaveRequest[]
}

export const createLeaveRequest = async (leaveRequest: Omit<LeaveRequest, 'id' | 'status' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert(leaveRequest)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating leave request:', error)
    throw error
  }
  
  return data
}

export const getEmployeeAttendance = async (employeeId: string, startDate?: string, endDate?: string) => {
  let query = supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false })
  
  if (startDate) {
    query = query.gte('date', startDate)
  }
  
  if (endDate) {
    query = query.lte('date', endDate)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching attendance:', error)
    return []
  }
  
  return data as Attendance[]
}

export const getEmployeePayroll = async (employeeId: string) => {
  const { data, error } = await supabase
    .from('payroll')
    .select('*')
    .eq('employee_id', employeeId)
    .order('pay_period_start', { ascending: false })
  
  if (error) {
    console.error('Error fetching payroll:', error)
    return []
  }
  
  return data as Payroll[]
}

// Subscription data fetchers
export const getOrganizationSubscription = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  
  if (!userProfile) return null
  
  const { data, error } = await supabase
    .from('organization_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('organization_id', userProfile.organization_id)
    .eq('status', 'active')
    .single()
  
  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }
  
  return {
    id: data.id,
    plan_name: data.plan.name,
    plan_description: data.plan.description,
    status: data.status,
    credits_remaining: data.credits_remaining,
    credits_used: data.credits_used,
    credits_included: data.plan.credits_included,
    current_period_end: data.current_period_end,
    billing_cycle: data.billing_cycle,
    price_monthly: data.plan.price_monthly,
    price_yearly: data.plan.price_yearly,
    features: data.plan.features || []
  }
}

export const getCreditTransactions = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []
  
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()
  
  if (!userProfile) return []
  
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('organization_id', userProfile.organization_id)
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) {
    console.error('Error fetching credit transactions:', error)
    return []
  }
  
  return data || []
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
  window.location.href = process.env.NEXT_PUBLIC_APP_URL || 'http://auth.localhost:3000'
} 