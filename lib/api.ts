export type AuthUser = {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string | null
  tenantId: string | null
  tenantName: string | null
  is_platform_operator: boolean
}

type ApiErrorBody = {
  error?: {
    message?: unknown
  }
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1').replace(/\/$/, '')

function firstMessage(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstMessage(item)
      if (message) return message
    }
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      const message = firstMessage(item)
      if (message) return message
    }
  }
  return null
}

async function errorMessage(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorBody
    return firstMessage(body.error?.message) || 'Something went wrong. Please try again.'
  } catch {
    return 'Something went wrong. Please try again.'
  }
}

async function csrfToken() {
  const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(await errorMessage(response))
  const body = (await response.json()) as {csrfToken: string}
  return body.csrfToken
}

async function authMutation(path: string, body?: Record<string, string>) {
  const token = await csrfToken()
  const response = await fetch(`${API_BASE_URL}/auth/${path}/`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': token,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw new Error(await errorMessage(response))
  if (response.status === 204) return null
  return (await response.json()) as AuthUser
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/auth/me/`, {
    credentials: 'include',
    cache: 'no-store',
  })
  if (response.status === 401 || response.status === 403) return null
  if (!response.ok) throw new Error(await errorMessage(response))
  return (await response.json()) as AuthUser
}

export function loginAccount(email: string, password: string) {
  return authMutation('login', {email, password}) as Promise<AuthUser>
}

export function registerAccount(email: string, password: string, passwordConfirm: string) {
  return authMutation('register', {email, password, password_confirm: passwordConfirm}) as Promise<AuthUser>
}

export async function logoutAccount() {
  await authMutation('logout')
}
