import type { Route } from 'next'

const key = 'auth_return_url'

export function safeReturnUrl(value?: string | null): Route | null {
  if (!value?.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  return value as Route
}

export function saveAuthReturnUrl(value?: string | null) {
  const safeValue = safeReturnUrl(value)
  if (safeValue) sessionStorage.setItem(key, safeValue)
  else sessionStorage.removeItem(key)
}

export function takeAuthReturnUrl(): Route | null {
  const value = safeReturnUrl(sessionStorage.getItem(key))
  sessionStorage.removeItem(key)
  return value
}
