'use client'

import { Suspense, lazy } from 'react'
import { AuthLoading } from '@/components/auth/loading'

// Lazy load the LoginForm component to prevent environment variable access during SSR
const LoginForm = lazy(() => import('@/components/auth/login-form').then(mod => ({ default: mod.LoginForm })))

export default function HomePage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginForm />
    </Suspense>
  )
}
