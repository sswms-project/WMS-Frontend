import { z } from 'zod'
import { describe, expect, it } from 'vitest'
import { getPersonalPermissionErrorDetails } from './tenant-user-permission-error'

describe('personal permission error mapping', () => {
  it('normalizes client validation errors without exposing Zod details', () => {
    const result = z
      .string()
      .parseAsync(1)
      .catch((error: unknown) => getPersonalPermissionErrorDetails(error))

    return expect(result).resolves.toEqual({
      message: 'Dữ liệu quyền không hợp lệ. Hãy tải lại trang và thử lại.',
      targetUnavailable: false,
    })
  })

  it('maps conflict and unavailable target codes to deterministic recovery behavior', () => {
    expect(
      getPersonalPermissionErrorDetails({
        statusCode: 409,
        message: 'Conflict',
        errors: { code: ['USER_PERMISSION_STATE_CONFLICT'] },
      })
    ).toMatchObject({ recovery: 'reload', targetUnavailable: false })
    expect(
      getPersonalPermissionErrorDetails({
        statusCode: 409,
        message: 'Inactive',
        errors: { code: ['USER_NOT_ACTIVE'] },
      })
    ).toMatchObject({ targetUnavailable: true })
  })
})
