import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'
import { APP_ROUTES } from '@/routes/app-routes'
import { proxy } from './proxy'

describe('proxy invitation access', () => {
  it('allows an unauthenticated recipient to open the invitation form', () => {
    const request = new NextRequest(
      `http://localhost:3000${APP_ROUTES.invitations.accept}?token=invite-token`
    )

    const response = proxy(request)

    expect(response.headers.get('location')).toBeNull()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})
