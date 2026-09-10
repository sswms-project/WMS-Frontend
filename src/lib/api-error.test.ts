import { describe, expect, it } from 'vitest'
import { getApiErrorCode, getApiErrorMessage } from './api-error'

describe('api-error helpers', () => {
  it('reads the stable code without exposing it in the user-facing message', () => {
    const error = {
      statusCode: 409,
      message: 'Dữ liệu xem trước đã thay đổi.',
      errors: {
        code: ['IMPORT_PREVIEW_STALE'],
        selectedRowNumbers: ['Có dòng không còn hợp lệ.'],
      },
    }

    expect(getApiErrorCode(error)).toBe('IMPORT_PREVIEW_STALE')
    expect(getApiErrorMessage(error)).toBe(
      'Dữ liệu xem trước đã thay đổi. — selectedRowNumbers: Có dòng không còn hợp lệ.'
    )
  })

  it('returns no code for ordinary errors', () => {
    expect(getApiErrorCode(new Error('offline'))).toBeUndefined()
  })
})
