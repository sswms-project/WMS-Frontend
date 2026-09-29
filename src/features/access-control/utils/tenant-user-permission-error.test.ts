import { describe, expect, it } from 'vitest'
import { getPersonalPermissionErrorDetails } from './tenant-user-permission-error'

describe('getPersonalPermissionErrorDetails', () => {
  it('không hiển thị thông báo tiếng Anh khi API từ chối quyền ghi', () => {
    const result = getPersonalPermissionErrorDetails({
      statusCode: 403,
      message: 'You do not have permission to access this resource',
    })

    expect(result).toEqual({
      message: 'Bạn chỉ có quyền xem cấu hình phân quyền và không thể lưu thay đổi.',
      targetUnavailable: false,
    })
  })
})
