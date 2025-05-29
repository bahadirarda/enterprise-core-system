'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dashboard } from '@/components/dashboard/dashboard'
import { sharedAuthManager } from '@/lib/shared-auth'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

interface Employee {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'hr_manager' | 'hr_specialist' | 'department_manager' | 'employee' | 'authenticated'
  position?: { id: string; title: string } // id zorunlu, description kaldırıldı
  department?: { id: string; name: string } // id zorunlu
  status: string
  full_name?: string
  employee_id?: string
}

interface AuthUser {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

function HRMSContent() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const checkAuthentication = useCallback(async () => {
    try {
      // 1. Session parametresi var mı?
      const sessionParam = searchParams.get('session')
      if (sessionParam) {
        try {
          const sessionData = JSON.parse(decodeURIComponent(sessionParam))
          sharedAuthManager.setSharedSession(sessionData)
          const url = new URL(window.location.href)
          url.searchParams.delete('session')
          window.history.replaceState({}, '', url.toString())
          setUser(sessionData.user)
          setAccessToken(sessionData.access_token)
          if (sharedAuthManager.updateActivity) {
            sharedAuthManager.updateActivity()
          }
          setIsLoading(false)
          return
        } catch (parseError) {
          console.error('HRMS: Error parsing session parameter:', parseError)
        }
      }
      // 2. LocalStorage'da session var mı?
      const existingSession = sharedAuthManager.getSharedSession && sharedAuthManager.getSharedSession()
      if (existingSession && existingSession.user) {
        setUser(existingSession.user)
        setAccessToken(existingSession.access_token)
        if (sharedAuthManager.updateActivity) {
          sharedAuthManager.updateActivity()
        }
        setIsLoading(false)
        return
      }
      // 3. Fallback: Doğrudan authentication kontrolü
      if (sharedAuthManager.checkAuthStatus) {
        const { isAuthenticated, user: authUser } = await sharedAuthManager.checkAuthStatus()
        if (!isAuthenticated || !authUser) {
          window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
          return
        }
        setUser(authUser)
        // access_token yoksa Supabase auth'dan al
        const { data: { session } } = await supabase.auth.getSession()
        setAccessToken(session?.access_token || null)
        if (sharedAuthManager.updateActivity) {
          sharedAuthManager.updateActivity()
        }
        setIsLoading(false)
        return
      }
      // Eğer sharedAuthManager yoksa fallback olarak Supabase auth'u kullan
      const { data: { user: supaUser } } = await supabase.auth.getUser()
      const { data: { session: supaSession } } = await supabase.auth.getSession()
      if (!supaUser) {
        window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
        return
      }
      setUser(supaUser)
      setAccessToken(supaSession?.access_token || null)
      setIsLoading(false)
    } catch {
      window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
    } finally {
      setIsLoading(false)
    }
  }, [searchParams])

  // Kullanıcı geldikten sonra Supabase'den employee/profile/position çek
  useEffect(() => {
    checkAuthentication()
  }, [checkAuthentication])

  useEffect(() => {
    if (!user || !accessToken) return
    (async () => {
      try {
        // Supabase client'ı access_token ile başlat
        const supa = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          }
        )
        
        // Önce user_profiles'tan role ve tam bilgileri çek
        const { data: profile, error: profileError } = await supa
          .from('user_profiles')
          .select('role, full_name, email')
          .eq('id', user.id)
          .single()
          
        console.log('Profile data:', profile)
        console.log('Profile error:', profileError)
        
        if (!profile) {
          console.error('No user profile found for user:', user.id)
          window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
          return
        }
        
        // Employees tablosundan employee bilgilerini çek
        const { data: emp, error: empError } = await supa
          .from('employees')
          .select(`
            id, email, first_name, last_name, status, position_id, employee_id,
            position:positions(id, title, description),
            department:departments(id, name)
          `)
          .eq('user_id', user.id)
          .single()
          
        console.log('Employee data:', emp)
        console.log('Employee error:', empError)
        
        if (!emp) {
          console.error('No employee record found for user:', user.id)
          // Employee kaydı yoksa fallback employee objesi oluştur
          setEmployee({
            id: user.id,
            email: user.email || profile.email || '',
            first_name: user.user_metadata?.first_name as string || 'Admin',
            last_name: user.user_metadata?.last_name as string || 'User',
            role: profile.role as Employee['role'], // user_profiles'dan gelen role
            position: { id: 'default-pos', title: 'System Administrator' }, // Default ID ekledik
            department: { id: 'default-dept', name: 'IT' }, // Default ID ekledik
            status: 'active',
            full_name: profile.full_name
          })
          return
        }
        
        // Department verisini güvenli bir şekilde işle
        const department = emp.department?.[0]
        const position = emp.position?.[0]
        
        const safeEmployee: Employee = {
          id: emp.id,
          email: emp.email || '',
          first_name: emp.first_name || '',
          last_name: emp.last_name || '',
          role: profile.role as Employee['role'], // user_profiles'dan gelen role kullan
          position: position ? {
            id: position.id || `pos-${emp.id}`, // ID yoksa fallback ID oluştur
            title: position.title
          } : { id: 'employee-pos', title: 'Employee' }, // Position yoksa default değer
          department: department ? {
            id: department.id || `dept-${emp.id}`, // ID yoksa fallback ID oluştur
            name: department.name
          } : { id: 'general-dept', name: 'General' }, // Department yoksa default değer
          status: emp.status || 'active',
          full_name: profile.full_name,
          employee_id: emp.employee_id
        }
        
        setEmployee(safeEmployee)
        
        console.log('Final employee object set:', {
          role: profile.role,
          position: safeEmployee.position,
          name: `${emp?.first_name || 'Admin'} ${emp?.last_name || 'User'}`,
          department: safeEmployee.department
        })
        
      } catch (fetchError) {
        console.error('Error fetching employee data:', fetchError)
        window.location.href = process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000'
      }
    })()
  }, [user, accessToken])

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
  if (!employee) return null
  return <Dashboard employee={employee} />
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" /><p className="text-gray-600">HRMS yükleniyor...</p></div></div>}>
      <HRMSContent />
    </Suspense>
  )
}