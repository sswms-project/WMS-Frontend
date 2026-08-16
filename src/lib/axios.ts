import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_ENDPOINTS } from '@/routes/api-endpoints'
import { APP_ROUTES } from '@/routes/app-routes'
import type { ApiErrorResponse, ApiResponse } from '@/types/api'

type PendingRequest = {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

interface RefreshSessionResponse {
  accessToken: string | null
  refreshToken: string | null
}

const normalizeApiBaseUrl = (baseUrl: string) => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')

  return normalizedBaseUrl.endsWith('/api') ? normalizedBaseUrl : `${normalizedBaseUrl}/api`
}

const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:7070'
)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeApiError = (error: AxiosError): ApiErrorResponse => {
  const data = error.response?.data
  const statusCode =
    isRecord(data) && typeof data.statusCode === 'number'
      ? data.statusCode
      : (error.response?.status ?? 500)
  const message =
    isRecord(data) && typeof data.message === 'string' && data.message.trim().length > 0
      ? data.message
      : error.message || 'Something went wrong. Please try again.'
  const errors =
    isRecord(data) && isRecord(data.errors) ? (data.errors as Record<string, string[]>) : undefined

  return {
    statusCode,
    message,
    ...(errors ? { errors } : {}),
  }
}

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-id': 'demo-tenant',
  },
})

// ── Token helpers ──────────────────────────────────────────────

const isClient = typeof window !== 'undefined'

const getAccessToken = (): string | null => (isClient ? localStorage.getItem('access_token') : null)

const getRefreshToken = (): string | null =>
  isClient ? localStorage.getItem('refresh_token') : null

const setTokens = (accessToken: string, refreshToken: string): void => {
  if (!isClient) return
  localStorage.setItem('access_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
  document.cookie = `access_token=${accessToken}; path=/; SameSite=Strict`
}

const clearTokens = (): void => {
  if (!isClient) return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  document.cookie = 'access_token=; path=/; max-age=0'
}

const redirectToLogin = (): void => {
  clearTokens()
  window.location.href = APP_ROUTES.auth.login
}

// ── Pre-authentication endpoints — never trigger refresh-token retry ───
// A stale refresh_token (lives 14 days) left over in localStorage from a
// previous session must not be silently used to "resurrect" an unrelated
// session when login/verify-2fa itself returns 401. refreshToken already
// bypasses this interceptor (uses the raw `axios` instance, not
// `axiosClient`) — listed here defensively in case that ever changes.
const AUTH_401_PASSTHROUGH_ENDPOINTS: string[] = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.verify2fa,
  API_ENDPOINTS.auth.refreshToken,
  API_ENDPOINTS.auth.logout,
]

export const shouldRedirectToUnauthorized = (url?: string): boolean =>
  url !== API_ENDPOINTS.subscription.me

// ── Token refresh with queuing ─────────────────────────────────

let isRefreshing = false
let pendingRequests: PendingRequest[] = []

const refreshAccessToken = async (): Promise<string> => {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  if (!accessToken || !refreshToken) throw new Error('Missing session token')

  const response = await axios.post<ApiResponse<RefreshSessionResponse>>(
    `${API_BASE_URL}${API_ENDPOINTS.auth.refreshToken}`,
    { accessToken, refreshToken }
  )
  const refreshedSession = response.data.data

  if (!refreshedSession.accessToken || !refreshedSession.refreshToken) {
    throw new Error('Refresh response is missing session tokens')
  }

  setTokens(refreshedSession.accessToken, refreshedSession.refreshToken)
  return refreshedSession.accessToken
}

const handleTokenRefresh = async (): Promise<string> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({ resolve, reject })
    })
  }

  isRefreshing = true
  try {
    const newToken = await refreshAccessToken()
    pendingRequests.forEach((req) => req.resolve(newToken))
    return newToken
  } catch (error) {
    pendingRequests.forEach((req) => req.reject(error))
    redirectToLogin()
    throw error
  } finally {
    pendingRequests = []
    isRefreshing = false
  }
}

// ── Request interceptor ────────────────────────────────────────

axiosClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor ───────────────────────────────────────

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const isPassthroughEndpoint = AUTH_401_PASSTHROUGH_ENDPOINTS.some(
      (endpoint) => originalRequest?.url === endpoint
    )

    if (
      error.response?.status === 401 &&
      !isPassthroughEndpoint &&
      !originalRequest?._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true
      try {
        const newToken = await handleTokenRefresh()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosClient(originalRequest)
      } catch {
        return Promise.reject(error)
      }
    }

    if (
      error.response?.status === 403 &&
      isClient &&
      shouldRedirectToUnauthorized(originalRequest?.url)
    ) {
      window.location.href = APP_ROUTES.unauthorized
    }

    const apiError = normalizeApiError(error)

    return Promise.reject(apiError)
  }
)
