import { beforeEach, describe, expect, it } from 'vitest'
import { safeReturnUrl, saveAuthReturnUrl, takeAuthReturnUrl } from './auth-return-url'

describe('auth return URL', () => {
  beforeEach(() => sessionStorage.clear())

  it.each(['https://evil.example', '//evil.example', '/\\evil.example'])(
    'rejects unsafe URL %s',
    (url) => {
      expect(safeReturnUrl(url)).toBeNull()
    }
  )

  it('preserves a local invitation URL once and then clears it', () => {
    const invitationUrl = '/invitations/accept?token=abc123'

    saveAuthReturnUrl(invitationUrl)

    expect(takeAuthReturnUrl()).toBe(invitationUrl)
    expect(takeAuthReturnUrl()).toBeNull()
  })
})
