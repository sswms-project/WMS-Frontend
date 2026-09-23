import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TooltipProvider } from '@/components/ui/tooltip'
import { USER_ROLES } from '@/config/roles'
import type { AuthUser } from '@/features/auth/types/auth.types'
import { useAuthStore } from '@/stores/auth.store'
import type { AiChatResponse } from '../../types/ai-assistant.types'
import { AiAssistantLauncher } from './AiAssistantLauncher'

const mocks = vi.hoisted(() => ({
  sendMessage: vi.fn(),
  getConversations: vi.fn(),
  getMessages: vi.fn(),
  confirmAction: vi.fn(),
  cancelAction: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock('../../services/ai-assistant.service', () => ({
  aiAssistantService: {
    sendMessage: mocks.sendMessage,
    getConversations: mocks.getConversations,
    getMessages: mocks.getMessages,
    confirmAction: mocks.confirmAction,
    cancelAction: mocks.cancelAction,
  },
}))

vi.mock('sonner', () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }))
vi.mock('@/lib/logger', () => ({ logger: { error: vi.fn() } }))

const chatResponse: AiChatResponse = {
  conversationId: 'conversation-1',
  userMessage: {
    id: 'u1',
    role: 'User',
    content: 'Tạo PO 200 SKU-001',
    intent: null,
    cards: [],
    createdAt: '2026-09-12T08:00:00Z',
  },
  assistantMessage: {
    id: 'a1',
    role: 'Assistant',
    content: 'Mình đã chuẩn bị **bản nháp** PO, bạn kiểm tra rồi bấm Xác nhận nhé.',
    intent: 'action',
    cards: [
      {
        type: 'navigation_card',
        routeKey: 'inbound_requests',
        title: 'Nhập kho',
        description: 'Danh sách yêu cầu nhập kho',
        actionUrl: '/inbound-requests',
        icon: 'clipboard-list',
      },
      {
        type: 'action_confirmation',
        draftId: 'draft-1',
        action: 'create_inbound_request',
        summary: 'Tạo yêu cầu nhập kho 200 chai SKU-001',
        details: [{ label: 'Kho nhận', value: 'Kho Hà Nội' }],
        expiresAt: '2026-09-12T08:15:00Z',
      },
    ],
    createdAt: '2026-09-12T08:00:05Z',
  },
  drafts: [
    {
      draftId: 'draft-1',
      action: 'create_inbound_request',
      status: 'Pending',
      resultEntityId: null,
      expiresAt: '2026-09-12T08:15:00Z',
    },
  ],
}

function renderLauncher(role: AuthUser['role'] = USER_ROLES.TenantOwner) {
  useAuthStore.setState({ user: { role } as AuthUser })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AiAssistantLauncher />
      </TooltipProvider>
    </QueryClientProvider>
  )
}

describe('AiAssistantLauncher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    mocks.getConversations.mockResolvedValue({ data: [] })
    mocks.getMessages.mockResolvedValue({
      data: {
        conversationId: 'conversation-1',
        title: 'Tạo PO',
        messages: [chatResponse.userMessage, chatResponse.assistantMessage],
        drafts: chatResponse.drafts,
      },
    })
    mocks.sendMessage.mockResolvedValue({ data: chatResponse })
    mocks.confirmAction.mockResolvedValue({
      data: {
        draftId: 'draft-1',
        action: 'create_inbound_request',
        status: 'Executed',
        resultEntityId: 'po-1',
      },
    })
  })

  it('is hidden for platform administrators', () => {
    renderLauncher(USER_ROLES.SystemAdmin)

    expect(screen.queryByRole('button', { name: 'Mở trợ lý AI Kovia' })).not.toBeInTheDocument()
  })

  it('sends a question, renders the reply with cards and confirms the drafted action', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByRole('button', { name: 'Mở trợ lý AI Kovia' }))
    expect(await screen.findByText('Xin chào! Mình có thể giúp gì cho bạn?')).toBeInTheDocument()

    await user.type(
      screen.getByRole('textbox', { name: 'Câu hỏi cho trợ lý AI' }),
      'Tạo PO 200 SKU-001{Enter}'
    )

    expect(mocks.sendMessage).toHaveBeenCalledWith({
      conversationId: null,
      message: 'Tạo PO 200 SKU-001',
    })
    expect(await screen.findByText('bản nháp')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Nhập kho/ })).toHaveAttribute(
      'href',
      '/inbound-requests'
    )
    expect(screen.getByText('Chờ xác nhận')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))

    await waitFor(() => expect(mocks.confirmAction).toHaveBeenCalledWith('draft-1'))
    expect(await screen.findByText('Đã thực hiện')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem yêu cầu nhập kho' })).toHaveAttribute(
      'href',
      '/inbound-requests/po-1'
    )
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Đã thực hiện thao tác.')
  })

  it('does not send an empty question', async () => {
    const user = userEvent.setup()
    renderLauncher()

    await user.click(screen.getByRole('button', { name: 'Mở trợ lý AI Kovia' }))
    await user.click(await screen.findByRole('button', { name: 'Gửi câu hỏi' }))

    expect(await screen.findByText('Hãy nhập câu hỏi.')).toBeInTheDocument()
    expect(mocks.sendMessage).not.toHaveBeenCalled()
  })

  it('moves the assistant without opening the chat', () => {
    renderLauncher()
    const launcher = screen.getByRole('button', { name: 'Mở trợ lý AI Kovia' })

    fireEvent.pointerDown(launcher, { button: 0, pointerId: 1, clientX: 32, clientY: 640 })
    fireEvent.pointerMove(launcher, { pointerId: 1, clientX: 132, clientY: 540 })
    fireEvent.pointerUp(launcher, { pointerId: 1, clientX: 132, clientY: 540 })

    expect(launcher.parentElement).toHaveStyle({ left: '116px', top: '580px' })
    expect(window.localStorage.getItem('kovia-ai-assistant-launcher-position')).toContain(
      '"left":116'
    )
    expect(screen.queryByText('Xin chào! Mình có thể giúp gì cho bạn?')).not.toBeInTheDocument()
  })
})
