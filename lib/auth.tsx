'use client'

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {usePathname, useRouter} from 'next/navigation'
import type {AuthUser} from '@/lib/api'
import {getCurrentUser, loginAccount, logoutAccount, registerAccount} from '@/lib/api'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthUser>
  signUp: (email: string, password: string, passwordConfirm: string) => Promise<AuthUser>
  signOut: () => Promise<void>
  refresh: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    return currentUser
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const currentUser = await loginAccount(email, password)
    setUser(currentUser)
    return currentUser
  }, [])

  const signUp = useCallback(async (email: string, password: string, passwordConfirm: string) => {
    const currentUser = await registerAccount(email, password, passwordConfirm)
    setUser(currentUser)
    return currentUser
  }, [])

  const signOut = useCallback(async () => {
    await logoutAccount()
    setUser(null)
  }, [])

  useEffect(() => {
    refresh().catch(() => setUser(null)).finally(() => setLoading(false))
  }, [refresh])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    refresh,
    signIn,
    signUp,
    signOut,
  }), [loading, refresh, signIn, signOut, signUp, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export function RequireAuth({children, operator = false}: {children: React.ReactNode; operator?: boolean}) {
  const {user, loading} = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    else if (operator && !user.is_platform_operator) router.replace('/dashboard')
  }, [loading, operator, pathname, router, user])

  if (loading || !user || (operator && !user.is_platform_operator)) {
    return <main className="auth-loading" aria-live="polite">Loading your workspace…</main>
  }
  return children
}
