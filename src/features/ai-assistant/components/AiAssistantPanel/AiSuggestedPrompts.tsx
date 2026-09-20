import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SUGGESTED_PROMPTS = [
  'Kho nào đang có nhiều sản phẩm sắp hết hàng?',
  'Trong tháng này có bao nhiêu yêu cầu xuất kho đã hoàn tất?',
  'Có yêu cầu kho nào đang bị trễ xử lý không?',
  'Sản phẩm nào nên nhập thêm hàng?',
  'Trang dự báo tồn kho ở đâu?',
] as const

interface AiSuggestedPromptsProps {
  readonly disabled: boolean
  readonly onSelect: (prompt: string) => void
}

export function AiSuggestedPrompts({ disabled, onSelect }: AiSuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-2 py-6 text-center">
      <span className="bg-tertiary/10 text-tertiary flex size-10 items-center justify-center rounded-full">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold">Xin chào! Mình có thể giúp gì cho bạn?</p>
        <p className="text-muted-foreground text-xs">
          Hỏi về tồn kho, vận hành kho, dự báo hoặc nhờ mình chỉ đường tới đúng màn hình.
        </p>
      </div>
      <ul className="flex w-full flex-col gap-2" aria-label="Câu hỏi gợi ý">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              className="h-auto w-full justify-start py-2 text-left whitespace-normal"
              onClick={() => onSelect(prompt)}
            >
              {prompt}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
