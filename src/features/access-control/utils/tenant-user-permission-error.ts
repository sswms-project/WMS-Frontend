import { ZodError } from 'zod'
import { getApiErrorCode, getApiErrorMessage } from '@/lib/api-error'

export type PersonalPermissionRecovery = 'reload' | 'reselect'

export interface PersonalPermissionErrorDetails {
  readonly message: string
  readonly recovery?: PersonalPermissionRecovery
  readonly targetUnavailable: boolean
}

export function getPersonalPermissionErrorDetails(error: unknown): PersonalPermissionErrorDetails {
  if (error instanceof ZodError) {
    return {
      message: 'Dữ liệu quyền không hợp lệ. Hãy tải lại trang và thử lại.',
      targetUnavailable: false,
    }
  }

  const code = getApiErrorCode(error)
  if (code === 'USER_ROLE_CHANGED') {
    return {
      message:
        'Vai trò của nhân sự đã thay đổi. Hãy đối chiếu bản chỉnh sửa, sau đó chọn lại nhân sự.',
      recovery: 'reselect',
      targetUnavailable: false,
    }
  }
  if (code === 'USER_PERMISSION_STATE_CONFLICT') {
    return {
      message:
        'Quyền cá nhân vừa được cập nhật ở nơi khác. Hãy đối chiếu bản chỉnh sửa rồi tải dữ liệu mới.',
      recovery: 'reload',
      targetUnavailable: false,
    }
  }
  if (code === 'USER_NOT_ACTIVE') {
    return {
      message: 'Tài khoản nhân sự không còn hoạt động nên không thể cập nhật quyền.',
      targetUnavailable: true,
    }
  }
  if (code === 'USER_NOT_FOUND') {
    return {
      message: 'Nhân sự không còn thuộc tổ chức hiện tại.',
      targetUnavailable: true,
    }
  }

  return {
    message: getApiErrorMessage(
      error,
      'Không thể lưu quyền cá nhân. Dữ liệu đang chỉnh vẫn được giữ lại.'
    ),
    targetUnavailable: false,
  }
}
