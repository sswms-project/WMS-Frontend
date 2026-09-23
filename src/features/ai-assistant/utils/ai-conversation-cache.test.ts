import { describe, expect, it } from 'vitest'
import type { AiChatResponse, AiDraftStatusInfo, AiMessage } from '../types/ai-assistant.types'
import { appendAiChatTurn, mergeAiDrafts, updateAiDraftStatus } from './ai-conversation-cache'

const message = (id: string, role: AiMessage['role'], content: string): AiMessage => ({
  id,
  role,
  content,
  intent: null,
  cards: [],
  createdAt: '2026-09-12T08:00:00Z',
})

const draft = (draftId: string, status: AiDraftStatusInfo['status']): AiDraftStatusInfo => ({
  draftId,
  action: 'create_inbound_request',
  status,
  resultEntityId: null,
  expiresAt: '2026-09-12T08:15:00Z',
})

const response: AiChatResponse = {
  conversationId: 'conversation-1',
  userMessage: message('u2', 'User', 'Tạo PO'),
  assistantMessage: message('a2', 'Assistant', 'Bạn xác nhận nhé'),
  drafts: [draft('d2', 'Pending')],
}

describe('ai conversation cache helpers', () => {
  it('seeds a new conversation from the first chat turn', () => {
    const result = appendAiChatTurn(undefined, response)

    expect(result.title).toBe('Tạo PO')
    expect(result.messages.map((item) => item.id)).toEqual(['u2', 'a2'])
    expect(result.drafts).toEqual([draft('d2', 'Pending')])
  })

  it('appends to an existing conversation and keeps earlier drafts', () => {
    const result = appendAiChatTurn(
      {
        conversationId: 'conversation-1',
        title: 'Tồn kho',
        messages: [message('u1', 'User', 'Tồn kho?'), message('a1', 'Assistant', 'Đây')],
        drafts: [draft('d1', 'Executed')],
      },
      response
    )

    expect(result.title).toBe('Tồn kho')
    expect(result.messages.map((item) => item.id)).toEqual(['u1', 'a1', 'u2', 'a2'])
    expect(result.drafts.map((item) => item.draftId)).toEqual(['d1', 'd2'])
  })

  it('replaces a draft status by id', () => {
    expect(mergeAiDrafts([draft('d1', 'Pending')], [draft('d1', 'Cancelled')])).toEqual([
      draft('d1', 'Cancelled'),
    ])

    const updated = updateAiDraftStatus(
      { conversationId: 'c', title: 't', messages: [], drafts: [draft('d1', 'Pending')] },
      { draftId: 'd1', status: 'Executed', resultEntityId: 'po-1' }
    )

    expect(updated?.drafts[0]).toMatchObject({ status: 'Executed', resultEntityId: 'po-1' })
    expect(
      updateAiDraftStatus(undefined, { draftId: 'd1', status: 'Executed', resultEntityId: null })
    ).toBeUndefined()
  })
})
