import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface Database {
  public: {
    Tables: {
      // Employee management
      employees: {
        Row: {
          id: string
          employee_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          hire_date: string
          department_id: string | null
          position_id: string | null
          salary: number | null
          status: 'active' | 'inactive' | 'terminated'
          manager_id: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          hire_date: string
          department_id?: string | null
          position_id?: string | null
          salary?: number | null
          status?: 'active' | 'inactive' | 'terminated'
          manager_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          hire_date?: string
          department_id?: string | null
          position_id?: string | null
          salary?: number | null
          status?: 'active' | 'inactive' | 'terminated'
          manager_id?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // Departments
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          manager_id: string | null
          budget: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          manager_id?: string | null
          budget?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          manager_id?: string | null
          budget?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // Positions
      positions: {
        Row: {
          id: string
          title: string
          description: string | null
          department_id: string | null
          min_salary: number | null
          max_salary: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          department_id?: string | null
          min_salary?: number | null
          max_salary?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          department_id?: string | null
          min_salary?: number | null
          max_salary?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // Payroll
      payroll: {
        Row: {
          id: string
          employee_id: string
          pay_period_start: string
          pay_period_end: string
          base_salary: number
          overtime_hours: number | null
          overtime_rate: number | null
          bonuses: number | null
          deductions: number | null
          gross_pay: number
          tax_amount: number
          net_pay: number
          status: 'draft' | 'approved' | 'paid'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          pay_period_start: string
          pay_period_end: string
          base_salary: number
          overtime_hours?: number | null
          overtime_rate?: number | null
          bonuses?: number | null
          deductions?: number | null
          gross_pay: number
          tax_amount: number
          net_pay: number
          status?: 'draft' | 'approved' | 'paid'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          pay_period_start?: string
          pay_period_end?: string
          base_salary?: number
          overtime_hours?: number | null
          overtime_rate?: number | null
          bonuses?: number | null
          deductions?: number | null
          gross_pay?: number
          tax_amount?: number
          net_pay?: number
          status?: 'draft' | 'approved' | 'paid'
          created_at?: string
          updated_at?: string
        }
      }
      
      // Leave requests
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          leave_type: 'annual' | 'sick' | 'maternity' | 'personal' | 'other'
          start_date: string
          end_date: string
          days_requested: number
          reason: string | null
          status: 'pending' | 'approved' | 'rejected'
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          leave_type: 'annual' | 'sick' | 'maternity' | 'personal' | 'other'
          start_date: string
          end_date: string
          days_requested: number
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          leave_type?: 'annual' | 'sick' | 'maternity' | 'personal' | 'other'
          start_date?: string
          end_date?: string
          days_requested?: number
          reason?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // Performance reviews
      performance_reviews: {
        Row: {
          id: string
          employee_id: string
          reviewer_id: string
          review_period_start: string
          review_period_end: string
          goals: string | null
          achievements: string | null
          areas_for_improvement: string | null
          overall_rating: number | null
          status: 'draft' | 'completed' | 'approved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          reviewer_id: string
          review_period_start: string
          review_period_end: string
          goals?: string | null
          achievements?: string | null
          areas_for_improvement?: string | null
          overall_rating?: number | null
          status?: 'draft' | 'completed' | 'approved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          reviewer_id?: string
          review_period_start?: string
          review_period_end?: string
          goals?: string | null
          achievements?: string | null
          areas_for_improvement?: string | null
          overall_rating?: number | null
          status?: 'draft' | 'completed' | 'approved'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Create client instance
export const createSupabaseClient = (url: string, anonKey: string): SupabaseClient<Database> => {
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

// Auth helpers
export const signUp = async (
  client: SupabaseClient<Database>,
  email: string,
  password: string,
  userData?: Record<string, any>
) => {
  return await client.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
}

export const signIn = async (
  client: SupabaseClient<Database>,
  email: string,
  password: string
) => {
  return await client.auth.signInWithPassword({
    email,
    password
  })
}

export const signOut = async (client: SupabaseClient<Database>) => {
  return await client.auth.signOut()
}

export const getCurrentUser = (client: SupabaseClient<Database>) => {
  return client.auth.getUser()
}

export const getSession = (client: SupabaseClient<Database>) => {
  return client.auth.getSession()
}

// Database helpers
export const getEmployees = async (client: SupabaseClient<Database>) => {
  return await client
    .from('employees')
    .select(`
      *,
      department:departments(*),
      position:positions(*),
      manager:employees!manager_id(id, first_name, last_name)
    `)
    .order('created_at', { ascending: false })
}

export const getDepartments = async (client: SupabaseClient<Database>) => {
  return await client
    .from('departments')
    .select(`
      *,
      manager:employees!manager_id(id, first_name, last_name)
    `)
    .order('name', { ascending: true })
}

export const getPayrollByEmployee = async (
  client: SupabaseClient<Database>,
  employeeId: string
) => {
  return await client
    .from('payroll')
    .select(`
      *,
      employee:employees(*)
    `)
    .eq('employee_id', employeeId)
    .order('pay_period_start', { ascending: false })
}

export const getLeaveRequests = async (
  client: SupabaseClient<Database>,
  employeeId?: string
) => {
  let query = client
    .from('leave_requests')
    .select(`
      *,
      employee:employees(id, first_name, last_name),
      approver:employees!approved_by(id, first_name, last_name)
    `)
  
  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  }
  
  return await query.order('created_at', { ascending: false })
}

export * from '@supabase/supabase-js' 