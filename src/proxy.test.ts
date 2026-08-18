import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { proxy } from './proxy'

describe('proxy public routes', () => {
  it('allows an unauthenticated user to open an invitation acceptance link', () => {
    const request = new NextRequest(
      'https://sswms-fe.vercel.app/invitations/accept?token=invitation-token'
    )

    const response = proxy(request)

    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.get('location')).toBeNull()
  })

  it('still redirects an unauthenticated user away from a protected route', () => {
    const request = new NextRequest('https://sswms-fe.vercel.app/staff')

    const response = proxy(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://sswms-fe.vercel.app/auth/login')
  })
})
