import { getApiErrorMessage, isApiErrorResponse } from '@/lib/api-error'

export type TransferErrorKind = 'conflict' | 'unknown-result' | 'rejected'

const NETWORK_FAILURE_PATTERN =
  /network error|timeout of \d+ms exceeded|econnaborted|failed to fetch/i

export interface TransferErrorDescription {
  readonly kind: TransferErrorKind
  readonly message: string
}

/**
 * Phân loại lỗi ghi: 409 nghĩa là dữ liệu đã đổi nên phải tải lại; lỗi mạng nghĩa là chưa biết server đã
 * ghi hay chưa nên không được báo thành công giả và không được tự thao tác lại trước khi tải lại.
 */
export function describeTransferError(error: unknown, fallback: string): TransferErrorDescription {
  if (!isApiErrorResponse(error)) {
    return { kind: 'rejected', message: getApiErrorMessage(error, fallback) }
  }
  if (error.statusCode === 409) {
    const message = error.message.trim()
    const sentence = message.charAt(0).toLocaleUpperCase('vi') + message.slice(1)
    return {
      kind: 'conflict',
      message: /tải lại/i.test(sentence)
        ? sentence
        : `${sentence} Hãy tải lại dữ liệu mới nhất rồi thao tác lại.`,
    }
  }
  if (NETWORK_FAILURE_PATTERN.test(error.message)) {
    return {
      kind: 'unknown-result',
      message:
        'Chưa xác định được kết quả do mất kết nối. Hãy tải lại dữ liệu để kiểm tra trước khi thao tác lại.',
    }
  }
  return { kind: 'rejected', message: getApiErrorMessage(error, fallback) }
}
