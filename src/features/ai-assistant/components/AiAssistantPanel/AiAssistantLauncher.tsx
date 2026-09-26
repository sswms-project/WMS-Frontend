'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { USER_ROLES } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import { AiAssistantPanel } from './AiAssistantPanel'
import { AiAssistantMascot } from './AiChatMessageBubble'

interface LauncherPosition {
  readonly left: number
  readonly top: number
}

interface DragState {
  readonly pointerId: number
  readonly originX: number
  readonly originY: number
  readonly originLeft: number
  readonly originTop: number
}

const LAUNCHER_SIZE = 72
const VIEWPORT_GUTTER = 16
const DRAG_THRESHOLD = 5
const POSITION_STORAGE_KEY = 'kovia-ai-assistant-launcher-position'

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum))
}

function getDefaultPosition(): LauncherPosition {
  return {
    left: VIEWPORT_GUTTER,
    top: Math.max(VIEWPORT_GUTTER, window.innerHeight - LAUNCHER_SIZE - VIEWPORT_GUTTER),
  }
}

function getStoredPosition(): LauncherPosition | null {
  const value = window.localStorage.getItem(POSITION_STORAGE_KEY)
  if (!value) return null

  try {
    const parsed: unknown = JSON.parse(value)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'left' in parsed &&
      'top' in parsed &&
      typeof parsed.left === 'number' &&
      typeof parsed.top === 'number'
    ) {
      return {
        left: clamp(
          parsed.left,
          VIEWPORT_GUTTER,
          window.innerWidth - LAUNCHER_SIZE - VIEWPORT_GUTTER
        ),
        top: clamp(
          parsed.top,
          VIEWPORT_GUTTER,
          window.innerHeight - LAUNCHER_SIZE - VIEWPORT_GUTTER
        ),
      }
    }
  } catch {
    window.localStorage.removeItem(POSITION_STORAGE_KEY)
  }

  return null
}

function getDraggedPosition(
  drag: DragState,
  event: PointerEvent<HTMLButtonElement>
): LauncherPosition {
  return {
    left: clamp(
      drag.originLeft + event.clientX - drag.originX,
      VIEWPORT_GUTTER,
      window.innerWidth - LAUNCHER_SIZE - VIEWPORT_GUTTER
    ),
    top: clamp(
      drag.originTop + event.clientY - drag.originY,
      VIEWPORT_GUTTER,
      window.innerHeight - LAUNCHER_SIZE - VIEWPORT_GUTTER
    ),
  }
}

export function AiAssistantLauncher() {
  const user = useAuthStore((state) => state.user)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<LauncherPosition | null>(() =>
    typeof window !== 'undefined' ? (getStoredPosition() ?? getDefaultPosition()) : null
  )
  const dragState = useRef<DragState | null>(null)
  const hasDragged = useRef(false)
  // Kept here so closing the sheet does not lose the current conversation.
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setPosition(getStoredPosition() ?? getDefaultPosition())
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  const finishDragging = () => {
    dragState.current = null
    window.setTimeout(() => {
      hasDragged.current = false
    }, 0)
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return

    const currentPosition = position ?? getDefaultPosition()
    dragState.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      originLeft: currentPosition.left,
      originTop: currentPosition.top,
    }
    hasDragged.current = false
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragState.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.originX
    const deltaY = event.clientY - drag.originY
    if (Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD) hasDragged.current = true
    if (!hasDragged.current) return

    setPosition(getDraggedPosition(drag, event))
  }

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (hasDragged.current && dragState.current) {
      const finalPosition = getDraggedPosition(dragState.current, event)
      setPosition(finalPosition)
      window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(finalPosition))
    }
    finishDragging()
  }

  const handleClick = () => {
    if (!hasDragged.current) setOpen(true)
  }

  // The assistant works inside one tenant; platform administrators have no tenant scope.
  if (!user || user.role === USER_ROLES.SystemAdmin) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div
        className="fixed z-40 touch-none"
        style={
          position
            ? { left: position.left, top: position.top }
            : { left: VIEWPORT_GUTTER, bottom: VIEWPORT_GUTTER }
        }
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Mở trợ lý AI Kovia"
              className="group focus-visible:ring-ring relative flex size-18 cursor-grab touch-none items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:cursor-grabbing"
              onClick={handleClick}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={finishDragging}
              onDragStart={(event) => event.preventDefault()}
            >
              <span className="bg-primary/20 absolute inset-2 rounded-full blur-md transition-opacity group-hover:opacity-80" />
              <AiAssistantMascot size="lg" />
              <span className="bg-primary text-primary-foreground border-background absolute right-2 bottom-3 size-2.5 rounded-full border-2" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Kéo để di chuyển, bấm để trò chuyện</TooltipContent>
        </Tooltip>
      </div>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {open ? (
          <AiAssistantPanel
            conversationId={conversationId}
            onConversationChange={setConversationId}
            onNavigate={() => setOpen(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
