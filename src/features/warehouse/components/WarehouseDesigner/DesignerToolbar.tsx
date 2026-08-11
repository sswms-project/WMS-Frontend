'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  Grid3X3,
  Hand,
  LoaderCircle,
  Maximize,
  MousePointer2,
  Redo2,
  Save,
  Settings2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  warehouseLayoutCanvasSchema,
  type WarehouseLayoutCanvasFormValues,
} from '../../schemas/warehouse-layout-scene.schema'
import type {
  WarehouseLayoutCanvas,
  WarehouseLayoutTool,
} from '../../types/warehouse-layout-scene.types'

interface DesignerToolbarProps {
  readonly tool: WarehouseLayoutTool
  readonly canvas: WarehouseLayoutCanvas
  readonly zoomPercent: number
  readonly isGridVisible: boolean
  readonly canUndo: boolean
  readonly canRedo: boolean
  readonly canSave: boolean
  readonly isSaving: boolean
  readonly isReadOnly: boolean
  readonly onUndo: () => void
  readonly onRedo: () => void
  readonly onToggleGrid: () => void
  readonly onZoomIn: () => void
  readonly onZoomOut: () => void
  readonly onFit: () => void
  readonly onCanvasChange: (canvas: WarehouseLayoutCanvas) => void
  readonly onSave: () => void
}

interface ToolbarIconButtonProps {
  readonly label: string
  readonly disabled?: boolean
  readonly pressed?: boolean
  readonly onClick: () => void
  readonly children: React.ReactNode
}

function ToolbarIconButton({
  label,
  disabled,
  pressed,
  onClick,
  children,
}: ToolbarIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            type="button"
            size="icon-sm"
            variant={pressed ? 'secondary' : 'ghost'}
            disabled={disabled}
            aria-label={label}
            aria-pressed={pressed}
            onClick={onClick}
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function CanvasSettingsSheet({
  canvas,
  disabled,
  onSubmit,
}: {
  readonly canvas: WarehouseLayoutCanvas
  readonly disabled: boolean
  readonly onSubmit: (canvas: WarehouseLayoutCanvas) => void
}) {
  const [open, setOpen] = useState(false)
  const form = useForm<WarehouseLayoutCanvasFormValues>({
    resolver: zodResolver(warehouseLayoutCanvasSchema),
    values: canvas,
  })
  const { errors } = form.formState

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Cài đặt nền">
              <Settings2 aria-hidden="true" />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>Cài đặt nền</TooltipContent>
      </Tooltip>
      <SheetContent className="w-full overflow-y-auto sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Cài đặt nền</SheetTitle>
          <SheetDescription>
            Đặt kích thước nền tối thiểu và bước lưới. Nền tự mở rộng khi đối tượng vượt biên.
          </SheetDescription>
        </SheetHeader>
        <form
          className="flex flex-1 flex-col"
          onSubmit={form.handleSubmit((values) => {
            onSubmit(values)
            setOpen(false)
          })}
        >
          <FieldGroup className="p-4">
            <CanvasNumberField
              id="canvas-width"
              label="Chiều rộng tối thiểu"
              error={errors.width}
              registration={form.register('width', { valueAsNumber: true })}
            />
            <CanvasNumberField
              id="canvas-height"
              label="Chiều cao tối thiểu"
              error={errors.height}
              registration={form.register('height', { valueAsNumber: true })}
            />
            <CanvasNumberField
              id="canvas-grid-size"
              label="Bước lưới"
              error={errors.gridSize}
              registration={form.register('gridSize', { valueAsNumber: true })}
            />
          </FieldGroup>
          <SheetFooter>
            <Button type="submit" disabled={disabled}>
              <Check data-icon="inline-start" aria-hidden="true" />
              Áp dụng
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function CanvasNumberField({
  id,
  label,
  error,
  registration,
}: {
  readonly id: string
  readonly label: string
  readonly error: ReturnType<
    ReturnType<typeof useForm<WarehouseLayoutCanvasFormValues>>['getFieldState']
  >['error']
  readonly registration: ReturnType<
    ReturnType<typeof useForm<WarehouseLayoutCanvasFormValues>>['register']
  >
}) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        min="1"
        step="1"
        inputMode="numeric"
        autoComplete="off"
        aria-invalid={Boolean(error)}
        {...registration}
      />
      <FieldError errors={[error]} />
    </Field>
  )
}

export function DesignerToolbar({
  tool,
  canvas,
  zoomPercent,
  isGridVisible,
  canUndo,
  canRedo,
  canSave,
  isSaving,
  isReadOnly,
  onUndo,
  onRedo,
  onToggleGrid,
  onZoomIn,
  onZoomOut,
  onFit,
  onCanvasChange,
  onSave,
}: DesignerToolbarProps) {
  return (
    <div className="bg-surface-container-lowest flex min-h-11 flex-wrap items-center gap-1 border-b px-2 py-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="bg-secondary text-secondary-foreground flex size-7 items-center justify-center rounded-sm border [&_svg]:size-4"
            role="status"
            tabIndex={0}
            aria-label={tool === 'pan' ? 'Đang di chuyển khung nhìn' : 'Đang chọn đối tượng'}
          >
            {tool === 'pan' ? <Hand aria-hidden="true" /> : <MousePointer2 aria-hidden="true" />}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {tool === 'pan' ? 'Đang di chuyển khung nhìn' : 'Giữ Ctrl để di chuyển khung nhìn'}
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />
      <ToolbarIconButton label="Hoàn tác" disabled={!canUndo || isReadOnly} onClick={onUndo}>
        <Undo2 aria-hidden="true" />
      </ToolbarIconButton>
      <ToolbarIconButton label="Làm lại" disabled={!canRedo || isReadOnly} onClick={onRedo}>
        <Redo2 aria-hidden="true" />
      </ToolbarIconButton>
      <ToolbarIconButton label="Hiện lưới" pressed={isGridVisible} onClick={onToggleGrid}>
        <Grid3X3 aria-hidden="true" />
      </ToolbarIconButton>

      <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />
      <ToolbarIconButton label="Thu nhỏ" onClick={onZoomOut}>
        <ZoomOut aria-hidden="true" />
      </ToolbarIconButton>
      <output className="text-muted-foreground w-12 text-center font-mono text-[11px] tabular-nums">
        {zoomPercent}%
      </output>
      <ToolbarIconButton label="Phóng to" onClick={onZoomIn}>
        <ZoomIn aria-hidden="true" />
      </ToolbarIconButton>
      <ToolbarIconButton label="Vừa màn hình" onClick={onFit}>
        <Maximize aria-hidden="true" />
      </ToolbarIconButton>
      <CanvasSettingsSheet canvas={canvas} disabled={isReadOnly} onSubmit={onCanvasChange} />

      <div className="ml-auto flex items-center gap-2">
        {canSave ? (
          <span className="text-muted-foreground hidden text-[11px] sm:inline">Chưa lưu</span>
        ) : null}
        <Button
          type="button"
          size="sm"
          disabled={!canSave || isSaving || isReadOnly}
          onClick={onSave}
        >
          {isSaving ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
          ) : (
            <Save data-icon="inline-start" aria-hidden="true" />
          )}
          {isSaving ? 'Đang lưu…' : 'Lưu sơ đồ'}
        </Button>
      </div>
    </div>
  )
}
