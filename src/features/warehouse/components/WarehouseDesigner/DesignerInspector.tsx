'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Loader2,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  warehouseLayoutDecorationSchema,
  warehouseLayoutGeometrySchema,
  type WarehouseLayoutDecorationFormValues,
  type WarehouseLayoutGeometryFormValues,
} from '../../schemas/warehouse-layout-scene.schema'
import { rackNameSchema } from '../../schemas/warehouse.schema'
import type {
  WarehouseLayoutEditorDecoration,
  WarehouseLayoutEditorRack,
  WarehouseLayoutEditorScene,
  WarehouseLayoutEditorZone,
  WarehouseLayoutGeometry,
  WarehouseLayoutSelection,
} from '../../types/warehouse-layout-scene.types'
import { DECORATION_OPTIONS, getDecorationLabel, LAYOUT_COLOR_SWATCHES } from './designer-constants'

interface DesignerInspectorProps {
  readonly scene: WarehouseLayoutEditorScene
  readonly selection: WarehouseLayoutSelection
  readonly canConfigure: boolean
  readonly onGeometryChange: (geometry: WarehouseLayoutGeometry) => void
  readonly onColorChange: (color: string | null) => void
  readonly isUpdatingRack: boolean
  readonly isDeactivatingRack: boolean
  readonly onRackNameChange: (rackName: string) => Promise<boolean>
  readonly onDeactivateRack: () => void
  readonly onDecorationChange: (
    decoration: Omit<WarehouseLayoutEditorDecoration, 'clientKey' | 'id' | 'color'>
  ) => void
  readonly onDuplicateDecoration: () => void
  readonly onDeleteDecoration: () => void
  readonly onClose: () => void
}

function InspectorHeader({
  title,
  code,
  status,
}: {
  readonly title: string
  readonly code: string
  readonly status?: string
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 pr-12">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-muted-foreground text-[11px]">{title}</p>
          <h2 translate="no" className="truncate font-mono text-sm font-semibold">
            {code}
          </h2>
        </div>
        {status ? <Badge variant="outline">{status}</Badge> : null}
      </div>
    </div>
  )
}

function GeometryForm({
  geometry,
  gridSize,
  disabled,
  onSubmit,
}: {
  readonly geometry: WarehouseLayoutGeometry
  readonly gridSize: number
  readonly disabled: boolean
  readonly onSubmit: (geometry: WarehouseLayoutGeometry) => void
}) {
  const form = useForm<WarehouseLayoutGeometryFormValues>({
    resolver: zodResolver(warehouseLayoutGeometrySchema),
    values: geometry,
  })
  const { errors } = form.formState

  function nudge(xDelta: number, yDelta: number) {
    const current = form.getValues()
    const next = { ...current, x: current.x + xDelta, y: current.y + yDelta }
    form.setValue('x', next.x, { shouldDirty: true })
    form.setValue('y', next.y, { shouldDirty: true })
    onSubmit(next)
  }

  return (
    <form className="flex flex-col gap-3 px-4 py-3" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold">Hình học</h3>
        <div className="flex items-center gap-0.5" aria-label="Di chuyển theo bước lưới">
          <NudgeButton label="Sang trái" disabled={disabled} onClick={() => nudge(-gridSize, 0)}>
            <ArrowLeft aria-hidden="true" />
          </NudgeButton>
          <NudgeButton label="Lên trên" disabled={disabled} onClick={() => nudge(0, -gridSize)}>
            <ArrowUp aria-hidden="true" />
          </NudgeButton>
          <NudgeButton label="Xuống dưới" disabled={disabled} onClick={() => nudge(0, gridSize)}>
            <ArrowDown aria-hidden="true" />
          </NudgeButton>
          <NudgeButton label="Sang phải" disabled={disabled} onClick={() => nudge(gridSize, 0)}>
            <ArrowRight aria-hidden="true" />
          </NudgeButton>
        </div>
      </div>
      <FieldGroup className="grid grid-cols-2 gap-3">
        <GeometryNumberField form={form} name="x" label="X" disabled={disabled} />
        <GeometryNumberField form={form} name="y" label="Y" disabled={disabled} />
        <GeometryNumberField form={form} name="width" label="Rộng" disabled={disabled} />
        <GeometryNumberField form={form} name="height" label="Cao" disabled={disabled} />
        <GeometryNumberField form={form} name="rotation" label="Góc xoay" disabled={disabled} />
        <GeometryNumberField form={form} name="zIndex" label="Lớp" disabled={disabled} />
      </FieldGroup>
      <Button
        type="submit"
        size="sm"
        className="w-full"
        disabled={disabled || Object.keys(errors).length > 0}
      >
        <Save data-icon="inline-start" aria-hidden="true" />
        Áp dụng thuộc tính
      </Button>
    </form>
  )
}

function GeometryNumberField({
  form,
  name,
  label,
  disabled,
}: {
  readonly form: ReturnType<typeof useForm<WarehouseLayoutGeometryFormValues>>
  readonly name: keyof WarehouseLayoutGeometryFormValues
  readonly label: string
  readonly disabled: boolean
}) {
  const error = form.formState.errors[name]
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`geometry-${name}`}>{label}</FieldLabel>
      <Input
        id={`geometry-${name}`}
        type="number"
        step="1"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled || form.formState.isSubmitting}
        aria-invalid={Boolean(error)}
        {...form.register(name, { valueAsNumber: true })}
      />
      <FieldError errors={[error]} />
    </Field>
  )
}

function NudgeButton({
  label,
  disabled,
  onClick,
  children,
}: {
  readonly label: string
  readonly disabled: boolean
  readonly onClick: () => void
  readonly children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button
            type="button"
            size="icon-xs"
            variant="outline"
            disabled={disabled}
            aria-label={label}
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

function AppearanceColorField({
  color,
  disabled,
  onChange,
}: {
  readonly color?: string | null
  readonly disabled: boolean
  readonly onChange: (color: string | null) => void
}) {
  const pickerValue = color ?? LAYOUT_COLOR_SWATCHES[0]

  return (
    <div className="flex flex-col gap-3 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold">Màu hiển thị</h3>
          <p className="text-muted-foreground text-[11px]">Dùng để phân biệt trên sơ đồ.</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                disabled={disabled || !color}
                aria-label="Khôi phục màu mặc định"
                onClick={() => onChange(null)}
              >
                <RotateCcw aria-hidden="true" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Khôi phục màu mặc định</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Màu có sẵn">
        {LAYOUT_COLOR_SWATCHES.map((swatch) => (
          <Tooltip key={swatch}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                className="relative size-8 p-1"
                disabled={disabled}
                aria-label={`Chọn màu ${swatch}`}
                aria-pressed={color === swatch}
                onClick={() => onChange(swatch)}
              >
                <span
                  className="size-full rounded-[2px] border"
                  style={{ backgroundColor: swatch }}
                  aria-hidden="true"
                />
                {color === swatch ? (
                  <span className="ring-primary pointer-events-none absolute inset-0 ring-2 ring-inset" />
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{swatch}</TooltipContent>
          </Tooltip>
        ))}
        <Field className="ml-auto w-auto">
          <FieldLabel htmlFor="layout-color-picker" className="sr-only">
            Chọn màu tùy chỉnh
          </FieldLabel>
          <Input
            id="layout-color-picker"
            type="color"
            value={pickerValue}
            className="h-8 w-10 cursor-pointer p-1"
            disabled={disabled}
            aria-label="Chọn màu tùy chỉnh"
            onChange={(event) => onChange(event.target.value.toUpperCase())}
          />
        </Field>
      </div>
    </div>
  )
}

function ZoneInspector({
  zone,
  gridSize,
  canConfigure,
  onGeometryChange,
  onColorChange,
}: {
  readonly zone: WarehouseLayoutEditorZone
  readonly gridSize: number
  readonly canConfigure: boolean
  readonly onGeometryChange: (geometry: WarehouseLayoutGeometry) => void
  readonly onColorChange: (color: string | null) => void
}) {
  return (
    <>
      <InspectorHeader title="Khu vực" code={zone.zoneCode} status={zone.status} />
      <dl className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 px-4 pb-3 text-xs">
        <dt className="text-muted-foreground">Tên</dt>
        <dd className="truncate">{zone.zoneName}</dd>
      </dl>
      <Separator />
      <AppearanceColorField color={zone.color} disabled={!canConfigure} onChange={onColorChange} />
      <Separator />
      <GeometryForm
        geometry={zone}
        gridSize={gridSize}
        disabled={!canConfigure}
        onSubmit={onGeometryChange}
      />
    </>
  )
}

function RackInspector({
  rack,
  gridSize,
  canConfigure,
  onGeometryChange,
  onColorChange,
  isUpdating,
  isDeactivating,
  onNameChange,
  onDeactivate,
}: {
  readonly rack: WarehouseLayoutEditorRack
  readonly gridSize: number
  readonly canConfigure: boolean
  readonly onGeometryChange: (geometry: WarehouseLayoutGeometry) => void
  readonly onColorChange: (color: string | null) => void
  readonly isUpdating: boolean
  readonly isDeactivating: boolean
  readonly onNameChange: (rackName: string) => Promise<boolean>
  readonly onDeactivate: () => void
}) {
  const [rackName, setRackName] = useState(rack.rackName)
  const parsedName = rackNameSchema.safeParse({ rackName })
  const nameError = parsedName.success ? null : parsedName.error.issues[0]?.message
  const isNameDirty = rackName.trim() !== rack.rackName

  async function submitName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsedName.success) return
    if (await onNameChange(parsedName.data.rackName)) {
      setRackName(parsedName.data.rackName)
    }
  }

  return (
    <>
      <InspectorHeader title="Kệ hàng" code={rack.rackCode} status={rack.status} />
      <dl className="grid grid-cols-[5rem_1fr] gap-x-3 gap-y-1 px-4 pb-3 text-xs">
        <dt className="text-muted-foreground">Khu vực</dt>
        <dd translate="no" className="font-mono">
          {rack.zoneCode}
        </dd>
      </dl>
      {canConfigure ? (
        <form className="flex flex-col gap-3 px-4 pb-3" onSubmit={submitName}>
          <Field data-invalid={Boolean(nameError)}>
            <FieldLabel htmlFor="rack-name-inspector">Tên kệ</FieldLabel>
            <Input
              id="rack-name-inspector"
              autoComplete="off"
              disabled={isUpdating || isDeactivating}
              aria-invalid={Boolean(nameError)}
              value={rackName}
              onChange={(event) => setRackName(event.target.value)}
            />
            <FieldError>{nameError}</FieldError>
          </Field>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={!isNameDirty || Boolean(nameError) || isUpdating || isDeactivating}
          >
            {isUpdating ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
            ) : (
              <Save data-icon="inline-start" aria-hidden="true" />
            )}
            Lưu tên kệ
          </Button>
        </form>
      ) : (
        <dl className="grid grid-cols-[5rem_1fr] gap-x-3 px-4 pb-3 text-xs">
          <dt className="text-muted-foreground">Tên</dt>
          <dd className="truncate">{rack.rackName}</dd>
        </dl>
      )}
      <Separator />
      <AppearanceColorField color={rack.color} disabled={!canConfigure} onChange={onColorChange} />
      <Separator />
      <GeometryForm
        geometry={rack}
        gridSize={gridSize}
        disabled={!canConfigure}
        onSubmit={onGeometryChange}
      />
      {canConfigure ? (
        <>
          <Separator />
          <div className="p-4">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={isUpdating || isDeactivating}
              onClick={onDeactivate}
            >
              {isDeactivating ? (
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 data-icon="inline-start" aria-hidden="true" />
              )}
              Ngừng hoạt động kệ
            </Button>
          </div>
        </>
      ) : null}
    </>
  )
}

function DecorationInspector({
  decoration,
  canConfigure,
  onChange,
  onColorChange,
  onDuplicate,
  onDelete,
}: {
  readonly decoration: WarehouseLayoutEditorDecoration
  readonly canConfigure: boolean
  readonly onChange: (
    decoration: Omit<WarehouseLayoutEditorDecoration, 'clientKey' | 'id' | 'color'>
  ) => void
  readonly onColorChange: (color: string | null) => void
  readonly onDuplicate: () => void
  readonly onDelete: () => void
}) {
  const form = useForm<WarehouseLayoutDecorationFormValues>({
    resolver: zodResolver(warehouseLayoutDecorationSchema),
    values: decoration,
  })
  const { errors } = form.formState

  return (
    <>
      <InspectorHeader title="Khu chức năng" code={decoration.label} />
      <AppearanceColorField
        color={decoration.color}
        disabled={!canConfigure}
        onChange={onColorChange}
      />
      <Separator />
      <form className="flex flex-col gap-3 px-4 py-3" onSubmit={form.handleSubmit(onChange)}>
        <FieldGroup>
          <Field data-invalid={Boolean(errors.label)}>
            <FieldLabel htmlFor="decoration-label">Tên hiển thị</FieldLabel>
            <Input
              id="decoration-label"
              disabled={!canConfigure}
              autoComplete="off"
              aria-invalid={Boolean(errors.label)}
              {...form.register('label')}
            />
            <FieldError errors={[errors.label]} />
          </Field>
          <Field data-invalid={Boolean(errors.type)}>
            <FieldLabel htmlFor="decoration-type">Loại khu vực</FieldLabel>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} disabled={!canConfigure} onValueChange={field.onChange}>
                  <SelectTrigger id="decoration-type" className="w-full">
                    <SelectValue>{getDecorationLabel(field.value)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {DECORATION_OPTIONS.map((option) => (
                        <SelectItem key={option.type} value={option.type}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.type]} />
          </Field>
        </FieldGroup>
        <FieldGroup className="grid grid-cols-2 gap-3">
          {(['x', 'y', 'width', 'height', 'rotation', 'zIndex'] as const).map((name) => (
            <Field key={name} data-invalid={Boolean(errors[name])}>
              <FieldLabel htmlFor={`decoration-${name}`}>{getGeometryLabel(name)}</FieldLabel>
              <Input
                id={`decoration-${name}`}
                type="number"
                step="1"
                disabled={!canConfigure}
                autoComplete="off"
                aria-invalid={Boolean(errors[name])}
                {...form.register(name, { valueAsNumber: true })}
              />
              <FieldError errors={[errors[name]]} />
            </Field>
          ))}
        </FieldGroup>
        <Button type="submit" size="sm" className="w-full" disabled={!canConfigure}>
          <Save data-icon="inline-start" aria-hidden="true" />
          Áp dụng thuộc tính
        </Button>
      </form>
      <Separator />
      <div className="grid grid-cols-2 gap-2 p-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canConfigure}
          onClick={onDuplicate}
        >
          <Copy data-icon="inline-start" aria-hidden="true" />
          Nhân bản
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={!canConfigure}
          onClick={onDelete}
        >
          <Trash2 data-icon="inline-start" aria-hidden="true" />
          Xóa
        </Button>
      </div>
    </>
  )
}

function getGeometryLabel(name: keyof WarehouseLayoutGeometry): string {
  const labels: Record<keyof WarehouseLayoutGeometry, string> = {
    x: 'X',
    y: 'Y',
    width: 'Rộng',
    height: 'Cao',
    rotation: 'Góc xoay',
    zIndex: 'Lớp',
  }
  return labels[name]
}

function SlotInspector({
  scene,
  slotId,
}: {
  readonly scene: WarehouseLayoutEditorScene
  readonly slotId: string
}) {
  const slot = scene.slots.find((item) => item.id === slotId)
  if (!slot) return null
  const rack = scene.racks.find((item) => item.id === slot.rackId)
  return (
    <>
      <InspectorHeader title="Vị trí lưu trữ" code={slot.slotCode} status={slot.occupancyStatus} />
      <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-2 px-4 py-3 text-xs">
        <dt className="text-muted-foreground">Kệ hàng</dt>
        <dd translate="no" className="font-mono">
          {rack?.rackCode ?? '—'}
        </dd>
        <dt className="text-muted-foreground">Sức chứa</dt>
        <dd className="font-mono tabular-nums">
          {slot.currentOccupancy} / {slot.capacity}
        </dd>
        <dt className="text-muted-foreground">Vòng đời</dt>
        <dd>{slot.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}</dd>
      </dl>
      <p className="text-muted-foreground px-4 pb-4 text-[11px]">
        Vị trí lưu trữ chỉ được xem trong phiên bản designer này.
      </p>
    </>
  )
}

export function DesignerInspector({
  scene,
  selection,
  canConfigure,
  onGeometryChange,
  onColorChange,
  isUpdatingRack,
  isDeactivatingRack,
  onRackNameChange,
  onDeactivateRack,
  onDecorationChange,
  onDuplicateDecoration,
  onDeleteDecoration,
  onClose,
}: DesignerInspectorProps) {
  const content = (() => {
    if (selection.kind === 'zone') {
      const zone = scene.zones.find((item) => item.id === selection.id)
      return zone ? (
        <ZoneInspector
          zone={zone}
          gridSize={scene.canvas.gridSize}
          canConfigure={canConfigure}
          onGeometryChange={onGeometryChange}
          onColorChange={onColorChange}
        />
      ) : null
    }
    if (selection.kind === 'rack') {
      const rack = scene.racks.find((item) => item.id === selection.id)
      return rack ? (
        <RackInspector
          key={`${rack.id}:${rack.rackName}`}
          rack={rack}
          gridSize={scene.canvas.gridSize}
          canConfigure={canConfigure}
          onGeometryChange={onGeometryChange}
          onColorChange={onColorChange}
          isUpdating={isUpdatingRack}
          isDeactivating={isDeactivatingRack}
          onNameChange={onRackNameChange}
          onDeactivate={onDeactivateRack}
        />
      ) : null
    }
    if (selection.kind === 'decoration') {
      const decoration = scene.decorations.find((item) => item.clientKey === selection.id)
      return decoration ? (
        <DecorationInspector
          decoration={decoration}
          canConfigure={canConfigure}
          onChange={onDecorationChange}
          onColorChange={onColorChange}
          onDuplicate={onDuplicateDecoration}
          onDelete={onDeleteDecoration}
        />
      ) : null
    }
    return <SlotInspector scene={scene} slotId={selection.id} />
  })()

  return (
    <div className="bg-surface-container-lowest relative h-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="absolute top-2 right-2 z-10"
            aria-label="Đóng bảng thuộc tính"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Đóng bảng thuộc tính</TooltipContent>
      </Tooltip>
      <ScrollArea className="h-full">{content}</ScrollArea>
    </div>
  )
}
