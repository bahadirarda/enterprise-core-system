import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/lib/supabase'
import { HRMSProfile } from '@/components/profile/hrms-profile'

export default async function ProfilePage() {
  try {
    const employee = await getCurrentEmployee()
    
    if (!employee) {
      redirect(process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000')
      return
    }

    return <HRMSProfile employee={employee} />
  } catch (error) {
    console.error('Error loading employee:', error)
    redirect(process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3000')
  }
} 