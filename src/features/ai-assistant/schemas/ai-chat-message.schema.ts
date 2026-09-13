import { z } from 'zod'

// Mirrors SendAiChatMessageCommandValidator (AiAssistant:MaxMessageLength).
export const AI_CHAT_MESSAGE_MAX_LENGTH = 2000

export const aiChatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Hãy nhập câu hỏi.')
    .max(AI_CHAT_MESSAGE_MAX_LENGTH, `Câu hỏi tối đa ${AI_CHAT_MESSAGE_MAX_LENGTH} ký tự.`),
})

export type AiChatMessageForm = z.infer<typeof aiChatMessageSchema>
