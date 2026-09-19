import { describe, expect, it } from 'vitest'
import { loginSchema } from './login.schema'

describe('loginSchema', () => {
  const credentials = { email: 'owner@example.com', password: 'Password@123' }

  it('allows normal credentials before CAPTCHA is required', () => {
    expect(loginSchema.safeParse(credentials).success).toBe(true)
  })

  it('requires an answer when a CAPTCHA challenge is present', () => {
    const result = loginSchema.safeParse({ ...credentials, captchaId: 'challenge-id' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['captchaAnswer'])
    }
  })
})
