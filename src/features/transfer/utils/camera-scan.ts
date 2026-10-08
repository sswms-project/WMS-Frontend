export interface CameraScanHandle {
  readonly stop: () => void
}

export type CameraScanFailure = 'insecure' | 'denied' | 'no-camera' | 'unknown'

/** Camera chỉ dùng được trên HTTPS hoặc localhost và khi thiết bị có camera. */
export function isCameraScanSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  )
}

export function describeCameraFailure(error: unknown): CameraScanFailure {
  if (typeof window !== 'undefined' && !window.isSecureContext) return 'insecure'
  const name = error instanceof Error ? error.name : ''
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied'
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'no-camera'
  return 'unknown'
}

export const CAMERA_FAILURE_MESSAGES: Record<CameraScanFailure, string> = {
  insecure: 'Camera chỉ hoạt động khi mở trang bằng HTTPS.',
  denied: 'Bạn chưa cho phép dùng camera. Hãy cấp quyền camera cho trang này rồi thử lại.',
  'no-camera': 'Không tìm thấy camera trên thiết bị này.',
  unknown: 'Không mở được camera. Hãy thử lại hoặc nhập mã bằng tay.',
}

/**
 * Bật camera sau, đọc mã vạch/QR liên tục và gọi onCode cho lần đọc đầu tiên. Thư viện giải mã chỉ tải khi
 * người dùng bấm quét bằng camera nên không làm nặng màn hình lấy/nhận hàng.
 */
export async function startCameraScan(
  video: HTMLVideoElement,
  onCode: (code: string) => void,
  onError: (failure: CameraScanFailure) => void
): Promise<CameraScanHandle> {
  let stopped = false
  let controls: { stop: () => void } | undefined
  const stop = () => {
    stopped = true
    controls?.stop()
  }
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const reader = new BrowserMultiFormatReader()
    controls = await reader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' } } },
      video,
      (result) => {
        if (stopped || !result) return
        stopped = true
        controls?.stop()
        onCode(result.getText().trim())
      }
    )
    if (stopped) controls.stop()
  } catch (error) {
    if (!stopped) onError(describeCameraFailure(error))
  }
  return { stop }
}
