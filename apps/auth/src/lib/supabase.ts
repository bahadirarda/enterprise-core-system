import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time issues
let supabaseClient: ReturnType<typeof createClient> | null = null

const getSupabaseClient = () => {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  })

  return supabaseClient
}

// Export a getter function instead of the client directly
export const supabase = {
  get auth() {
    return getSupabaseClient().auth
  },
  from: (table: string) => getSupabaseClient().from(table),
  storage: getSupabaseClient().storage,
  functions: getSupabaseClient().functions,
  realtime: getSupabaseClient().realtime,
}

// Auth helpers
export const signUp = async (email: string, password: string, userData?: Record<string, unknown>) => {
  const client = getSupabaseClient()
  return await client.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })
}

export const signIn = async (email: string, password: string) => {
  const client = getSupabaseClient()
  return await client.auth.signInWithPassword({
    email,
    password
  })
}

export const signInWithOAuth = async (provider: 'google' | 'github') => {
  const client = getSupabaseClient()
  return await client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })
}

export const signOut = async () => {
  const client = getSupabaseClient()
  return await client.auth.signOut()
}

export const resetPassword = async (email: string) => {
  const client = getSupabaseClient()
  return await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
  })
}

export const updatePassword = async (password: string) => {
  const client = getSupabaseClient()
  return await client.auth.updateUser({ password })
}

export const getUser = async () => {
  const client = getSupabaseClient()
  return client.auth.getUser()
}

export const getSession = async () => {
  const client = getSupabaseClient()
  return client.auth.getSession()
}

// Auth state change listener
export const onAuthStateChange = (callback: (event: string, session: unknown) => void) => {
  const client = getSupabaseClient()
  return client.auth.onAuthStateChange(callback)
}