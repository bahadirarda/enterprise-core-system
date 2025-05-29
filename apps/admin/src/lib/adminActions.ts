import { supabase, Company } from './supabase'

export interface CreateCompanyData {
  name: string
  domain: string
  plan: 'Basic' | 'Professional' | 'Enterprise'
  settings?: Record<string, unknown>
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string
}

// Company CRUD Operations
export const adminActions = {
  // Create new company
  async createCompany(data: CreateCompanyData): Promise<{ success: boolean; data?: Company; error?: string }> {
    try {
      const { data: company, error } = await supabase
        .from('organizations')
        .insert([{
          name: data.name,
          domain: data.domain,
          settings: data.settings || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      const companyData: Company = {
        id: company.id,
        name: company.name,
        domain: company.domain,
        plan: data.plan,
        status: 'active',
        user_count: 0,
        revenue: 0,
        created_at: company.created_at,
        updated_at: company.updated_at,
        settings: company.settings
      }

      return { success: true, data: companyData }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  },

  // Update company
  async updateCompany(data: UpdateCompanyData): Promise<{ success: boolean; data?: Company; error?: string }> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString()
      }

      if (data.name) updateData.name = data.name
      if (data.domain) updateData.domain = data.domain
      if (data.settings) updateData.settings = data.settings

      const { data: company, error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw error

      // Get user count for the updated company
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', company.id)

      const companyData: Company = {
        id: company.id,
        name: company.name,
        domain: company.domain,
        plan: data.plan || ((count || 0) > 50 ? 'Enterprise' : (count || 0) > 10 ? 'Professional' : 'Basic'),
        status: 'active',
        user_count: count || 0,
        revenue: (count || 0) * 1200,
        created_at: company.created_at,
        updated_at: company.updated_at,
        settings: company.settings
      }

      return { success: true, data: companyData }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  },

  // Delete company
  async deleteCompany(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, check if company has users
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', id)

      if (count && count > 0) {
        return { success: false, error: 'Bu şirketi silemezsiniz çünkü aktif kullanıcıları var.' }
      }

      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  },

  // Get company details
  async getCompanyDetails(id: string): Promise<{ success: boolean; data?: Company; error?: string }> {
    try {
      const { data: company, error: companyError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()

      if (companyError) throw companyError

      // Get user count
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', id)

      const companyData: Company = {
        id: company.id,
        name: company.name,
        domain: company.domain || `${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        plan: (count || 0) > 50 ? 'Enterprise' : (count || 0) > 10 ? 'Professional' : 'Basic',
        status: 'active',
        user_count: count || 0,
        revenue: (count || 0) * 1200,
        created_at: company.created_at,
        updated_at: company.updated_at,
        settings: company.settings
      }

      return { success: true, data: companyData }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  },

  // User Management Actions
  async updateUserRole(userId: string, newRole: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  },

  async deactivateUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, you might want to update a status field
      // For now, we'll just update the role to 'inactive'
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  },

  // System Stats
  async getSystemHealth(): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    try {
      // Check database connectivity
      const { error } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)

      if (error) throw error

      // Mock system health data
      const healthData = {
        database: 'healthy',
        apiResponse: 'healthy',
        memoryUsage: Math.floor(Math.random() * 50) + 30,
        cpuUsage: Math.floor(Math.random() * 30) + 10,
        uptime: '99.9%',
        lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }

      return { success: true, data: healthData }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  }
} 