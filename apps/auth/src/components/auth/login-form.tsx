'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { signIn, signInWithOAuth, supabase } from '@/lib/supabase'
import { sharedAuthManager, SharedSession } from '@/lib/shared-auth'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: authData, error: authError } = await signIn(data.email, data.password)

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user && authData.session) {
        console.log('🔐 Authentication successful, checking user profile...')
        
        // Kullanıcının profil bilgilerini al
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, organization_id')
          .eq('email', authData.user.email)
          .single()

        if (profileError) {
          console.error('❌ Profile lookup error:', profileError)
          setError('Kullanıcı profil bilgileri bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.')
          return
        }

        if (!userProfile) {
          console.error('❌ No user profile found for email:', authData.user.email)
          setError('Bu email adresi ile kayıtlı bir kullanıcı profili bulunamadı.')
          return
        }

        console.log('✅ User profile found:', userProfile)

        // Create shared session with 60-minute expiry
        const sharedSession: SharedSession = {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          user: authData.user,
          expires_at: Date.now() + (60 * 60 * 1000), // 60 minutes
          created_at: Date.now()
        }

        // Set shared session for all apps
        sharedAuthManager.setSharedSession(sharedSession)
        
        console.log('💾 Shared session set:', sharedSession)
        console.log('🔍 localStorage check:', localStorage.getItem('hrms_shared_session'))
        console.log('🔍 localStorage activity check:', localStorage.getItem('hrms_last_activity'))
        
        // Verify session was saved properly
        const verifySession = sharedAuthManager.getSharedSession()
        console.log('✅ Session verification:', verifySession ? 'SUCCESS' : 'FAILED')
        if (verifySession) {
          console.log('✅ Verified session expires at:', new Date(verifySession.expires_at).toLocaleString())
        }

        // Role-based redirect with session token in URL
        const redirectUrl = getRedirectUrl(userProfile.role)
        const tokenParam = encodeURIComponent(JSON.stringify(sharedSession))
        const fullRedirectUrl = `${redirectUrl}?session=${tokenParam}`
        
        console.log('🎯 Redirecting based on role:', userProfile.role, 'to:', fullRedirectUrl)
        
        // Add a small delay to ensure localStorage is written
        setTimeout(() => {
          console.log('🚀 Starting redirect to:', fullRedirectUrl)
          window.location.href = fullRedirectUrl
        }, 500) // Increase delay to 500ms
      }
    } catch (error) {
      setError('Giriş sırasında bir hata oluştu')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await signInWithOAuth(provider)
      
      if (error) {
        setError(error.message)
      }
    } catch (error) {
      setError('OAuth giriş sırasında bir hata oluştu')
      console.error('OAuth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRedirectUrl = (role?: string) => {
    switch (role) {
      case 'admin':
        return process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3002'
      case 'hr':
        return process.env.NEXT_PUBLIC_HRMS_URL || 'http://localhost:3001'
      case 'employee':
        return process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3002'
      default:
        return process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3002'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">HRMS Giriş</CardTitle>
          <CardDescription className="text-center">
            Hesabınıza giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="email@example.com"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ya da
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center">
            <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
              Şifremi unuttum
            </Link>
          </div>
          <div className="text-sm text-center text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Kayıt olun
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 