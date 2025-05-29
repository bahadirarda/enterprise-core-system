export const dynamic = "force-dynamic";
import { notFound } from 'next/navigation'
import { getCurrentEmployee } from '@/lib/supabase'
import { HRMSProfile } from '@/components/profile/hrms-profile'

export default async function ProfilePage() {
  try {
    const employee = await getCurrentEmployee()
    
    if (!employee) {
      notFound()
      return
    }

    return <HRMSProfile employee={employee} />
  } catch (error) {
    console.error('Error loading employee:', error)
    notFound()
    return
  }
} 