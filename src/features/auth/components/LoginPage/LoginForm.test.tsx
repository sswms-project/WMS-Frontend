import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

const baseProps = {
  onSubmit: vi.fn().mockResolvedValue(undefined),
  isLoading: false,
  captcha: null,
  isCaptchaLoading: false,
  authNotice: null,
  requiresVerification: false,
  isResending: false,
  lockSeconds: 0,
  onRefreshCaptcha: vi.fn(),
  onResendVerification: vi.fn(),
}

describe('LoginForm authentication states', () => {
  it('renders the server CAPTCHA only when a challenge is provided', () => {
    const { rerender } = render(<LoginForm {...baseProps} />)

    expect(screen.queryByLabelText('Kết quả CAPTCHA')).not.toBeInTheDocument()

    rerender(
      <LoginForm
        {...baseProps}
        captcha={{
          captchaId: 'challenge-id',
          imageDataUrl: 'data:image/svg+xml;base64,PHN2Zy8+',
          expiresInSeconds: 180,
        }}
      />
    )

    expect(screen.getByLabelText('Kết quả CAPTCHA')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /CAPTCHA/ })).toBeInTheDocument()
  })

  it('shows account-state guidance and disables login during a temporary lock', () => {
    render(<LoginForm {...baseProps} authNotice="Tổ chức đang bị tạm ngưng." lockSeconds={65} />)

    expect(screen.getByText('Tổ chức đang bị tạm ngưng.')).toBeInTheDocument()
    expect(screen.getByText(/Thử lại sau 1:05/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeDisabled()
  })
})
