'use client'

import Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Circle, Group, Layer, Line, Rect, Stage, Text, Transformer } from 'react-konva'
import type {
  WarehouseLayoutDecorationType,
  WarehouseLayoutEditorScene,
  WarehouseLayoutGeometry,
  WarehouseLayoutGeometryTarget,
  WarehouseLayoutSelection,
} from '../../types/warehouse-layout-scene.types'
import {
  constrainLayoutGeometryToCanvas,
  snapToGrid,
  type LayoutBounds,
} from '../../utils/layout-grid'
import {
  hasLayoutDragData,
  readLayoutDragData,
  type LayoutPaletteDragData,
} from './designer-constants'

const MIN_SCALE = 0.2
const MAX_SCALE = 4
const ZOOM_FACTOR = 1.15
const CANVAS_PADDING = 32
const SCROLLBAR_ALLOWANCE = 18

interface CanvasPalette {
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  primary: string
  accent: string
  destructive: string
  card: string
  warning: string
  warningContainer: string
}

interface WarehouseCanvasProps {
  readonly ref?: React.Ref<WarehouseCanvasHandle>
  readonly scene: WarehouseLayoutEditorScene
  readonly selection: WarehouseLayoutSelection | null
  readonly canConfigure: boolean
  readonly isGridVisible: boolean
  readonly onSelect: (selection: WarehouseLayoutSelection | null) => void
  readonly onGeometryChange: (
    target: WarehouseLayoutGeometryTarget,
    id: string,
    geometry: WarehouseLayoutGeometry
  ) => void
  readonly onZoomChange: (zoomPercent: number) => void
  readonly onPaletteDrop: (payload: LayoutPaletteDragData, x: number, y: number) => void
}

export interface WarehouseCanvasHandle {
  zoomIn: () => void
  zoomOut: () => void
  fit: () => void
}

function readCanvasPalette(): CanvasPalette {
  const styles = getComputedStyle(document.documentElement)
  const read = (token: string) => styles.getPropertyValue(token).trim()
  const isDark = document.documentElement.classList.contains('dark')
  return {
    background: isDark ? '#111827' : '#FFFFFF',
    foreground: isDark ? '#E5E7EB' : '#1F2937',
    muted: isDark ? '#1F2937' : '#F2F4F7',
    mutedForeground: read('--muted-foreground'),
    border: isDark ? '#475569' : '#CBD5E1',
    primary: '#2F80ED',
    accent: isDark ? '#1E3A5F' : '#DCE9FF',
    destructive: read('--destructive'),
    card: isDark ? '#172033' : '#FFFFFF',
    warning: read('--warning'),
    warningContainer: read('--warning-container'),
  }
}

function useCanvasPalette() {
  const [palette, setPalette] = useState<CanvasPalette | null>(null)

  useEffect(() => {
    const updatePalette = () => setPalette(readCanvasPalette())
    updatePalette()
    const observer = new MutationObserver(updatePalette)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return palette
}

function useContainerSize() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = (width: number, height: number) => {
      const nextWidth = Math.floor(width)
      const nextHeight = Math.floor(height)
      setSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight }
      )
    }
    const initialBounds = container.getBoundingClientRect()
    updateSize(initialBounds.width, initialBounds.height)

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      updateSize(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return { containerRef, size }
}

function getFitScale(containerWidth: number, containerHeight: number, bounds: LayoutBounds) {
  const availableWidth = Math.max(containerWidth - CANVAS_PADDING * 2 - SCROLLBAR_ALLOWANCE, 1)
  const availableHeight = Math.max(containerHeight - CANVAS_PADDING * 2 - SCROLLBAR_ALLOWANCE, 1)
  const canvasWidth = Math.max(bounds.maxX - bounds.minX, 1)
  const canvasHeight = Math.max(bounds.maxY - bounds.minY, 1)
  return Math.min(
    MAX_SCALE,
    Math.max(MIN_SCALE, Math.min(availableWidth / canvasWidth, availableHeight / canvasHeight))
  )
}

function getOccupancyLabel(slots: WarehouseLayoutEditorScene['slots']) {
  if (slots.length === 0) return 'Chưa có vị trí'
  if (slots.length > 1) return `${slots.length} vị trí lưu trữ`

  const slot = slots[0]!
  return slot.capacity === null
    ? 'Không áp dụng giới hạn số lượng'
    : `${slot.currentOccupancy} / ${slot.capacity}`
}

function isSelected(
  selection: WarehouseLayoutSelection | null,
  kind: WarehouseLayoutSelection['kind'],
  id: string
) {
  return selection?.kind === kind && selection.id === id
}

function parseHexColor(color: string) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color)
  if (!match) return null
  return [
    Number.parseInt(match[1]!, 16),
    Number.parseInt(match[2]!, 16),
    Number.parseInt(match[3]!, 16),
  ] as const
}

function getRelativeLuminance(color: string) {
  const rgb = parseHexColor(color)
  if (!rgb) return null
  const channels = rgb.map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
}

function getContrastRatio(first: string, second: string) {
  const firstLuminance = getRelativeLuminance(first)
  const secondLuminance = getRelativeLuminance(second)
  if (firstLuminance === null || secondLuminance === null) return 0
  const lighter = Math.max(firstLuminance, secondLuminance)
  const darker = Math.min(firstLuminance, secondLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

function getReadableCanvasColor(background: string, palette: CanvasPalette) {
  return getContrastRatio(background, palette.foreground) >=
    getContrastRatio(background, palette.background)
    ? palette.foreground
    : palette.background
}

function renderDecorationSymbol(
  type: WarehouseLayoutDecorationType,
  width: number,
  height: number,
  palette: CanvasPalette,
  foreground?: string
) {
  const iconSize = Math.min(38, Math.max(20, Math.min(width, height) * 0.38))
  const scale = iconSize / 24
  const x = (width - iconSize) / 2
  const y = Math.max(6, (height - iconSize - (height >= 58 ? 18 : 0)) / 2)
  const stroke = foreground ?? palette.foreground
  const strokeWidth = 1.6
  let symbol: React.ReactNode

  switch (type) {
    case 'Door':
      symbol = (
        <>
          <Rect x={5} y={2} width={13} height={20} stroke={stroke} strokeWidth={strokeWidth} />
          <Line points={[5, 2, 5, 22]} stroke={stroke} strokeWidth={strokeWidth} />
          <Circle x={15} y={12} radius={1} fill={stroke} />
        </>
      )
      break
    case 'DoubleDoor':
      symbol = (
        <>
          <Rect x={2} y={3} width={20} height={18} stroke={stroke} strokeWidth={strokeWidth} />
          <Line points={[12, 3, 12, 21]} stroke={stroke} strokeWidth={strokeWidth} />
          <Circle x={9} y={12} radius={1} fill={stroke} />
          <Circle x={15} y={12} radius={1} fill={stroke} />
        </>
      )
      break
    case 'Aisle':
      symbol = (
        <>
          <Line points={[4, 3, 4, 21]} stroke={stroke} strokeWidth={strokeWidth} />
          <Line points={[20, 3, 20, 21]} stroke={stroke} strokeWidth={strokeWidth} />
          <Line
            points={[8, 12, 16, 12, 13, 9, 16, 12, 13, 15]}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </>
      )
      break
    case 'DirectionArrow':
      symbol = (
        <Line
          points={[3, 12, 19, 12, 14, 7, 19, 12, 14, 17]}
          stroke={stroke}
          strokeWidth={2}
          lineCap="round"
          lineJoin="round"
        />
      )
      break
    case 'Exit':
      symbol = (
        <>
          <Rect x={3} y={3} width={12} height={18} stroke={stroke} strokeWidth={strokeWidth} />
          <Line
            points={[9, 12, 22, 12, 18, 8, 22, 12, 18, 16]}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </>
      )
      break
    case 'Forklift':
      symbol = (
        <>
          <Rect x={3} y={9} width={11} height={8} stroke={stroke} strokeWidth={strokeWidth} />
          <Line points={[14, 5, 17, 5, 17, 17, 21, 17]} stroke={stroke} strokeWidth={strokeWidth} />
          <Circle x={7} y={20} radius={2} stroke={stroke} strokeWidth={strokeWidth} />
          <Circle x={17} y={20} radius={2} stroke={stroke} strokeWidth={strokeWidth} />
        </>
      )
      break
    case 'Receiving':
      symbol = (
        <>
          <Rect x={3} y={9} width={11} height={8} stroke={stroke} strokeWidth={strokeWidth} />
          <Line points={[14, 5, 17, 5, 17, 17, 21, 17]} stroke={stroke} strokeWidth={strokeWidth} />
          <Circle x={7} y={20} radius={2} stroke={stroke} strokeWidth={strokeWidth} />
          <Circle x={17} y={20} radius={2} stroke={stroke} strokeWidth={strokeWidth} />
        </>
      )
      break
    case 'Packing':
      symbol = (
        <>
          <Rect x={4} y={5} width={16} height={15} stroke={stroke} strokeWidth={strokeWidth} />
          <Line points={[4, 10, 20, 10]} stroke={stroke} strokeWidth={strokeWidth} />
          <Line points={[12, 5, 12, 20]} stroke={stroke} strokeWidth={strokeWidth} />
        </>
      )
      break
    case 'Picking':
      symbol = (
        <>
          <Rect x={4} y={4} width={16} height={16} stroke={stroke} strokeWidth={strokeWidth} />
          <Line points={[7, 12, 10.5, 15.5, 17, 8]} stroke={stroke} strokeWidth={2} />
        </>
      )
      break
    case 'Damaged':
      symbol = (
        <>
          <Line
            points={[12, 2, 22, 21, 2, 21]}
            closed
            stroke={foreground ?? palette.destructive}
            strokeWidth={strokeWidth}
          />
          <Text
            x={9}
            y={7}
            width={6}
            text="!"
            align="center"
            fill={foreground ?? palette.destructive}
            fontSize={12}
          />
        </>
      )
      break
    case 'Office':
      symbol = (
        <>
          <Rect x={4} y={3} width={16} height={18} stroke={stroke} strokeWidth={strokeWidth} />
          <Rect x={7} y={7} width={3} height={3} stroke={stroke} strokeWidth={1} />
          <Rect x={14} y={7} width={3} height={3} stroke={stroke} strokeWidth={1} />
          <Rect x={10} y={14} width={5} height={7} stroke={stroke} strokeWidth={1} />
        </>
      )
      break
    default:
      symbol = (
        <>
          <Line
            points={[12, 2, 21, 7, 12, 12, 3, 7, 12, 2]}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[3, 7, 3, 17, 12, 22, 21, 17, 21, 7]}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <Line points={[12, 12, 12, 22]} stroke={stroke} strokeWidth={strokeWidth} />
        </>
      )
  }

  return (
    <Group x={x} y={y} scaleX={scale} scaleY={scale} listening={false}>
      {symbol}
    </Group>
  )
}

export function WarehouseCanvas({
  ref,
  scene,
  selection,
  canConfigure,
  isGridVisible,
  onSelect,
  onGeometryChange,
  onZoomChange,
  onPaletteDrop,
}: WarehouseCanvasProps) {
  const palette = useCanvasPalette()
  const { containerRef, size } = useContainerSize()
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const objectNodes = useRef(new Map<string, Konva.Node>())
  const lastPinchDistance = useRef<number | null>(null)
  const isFitMode = useRef(true)
  const pendingCenter = useRef<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState(1)
  const [scrollPosition, setScrollPosition] = useState({ left: 0, top: 0 })
  const activeZoneIds = useMemo(
    () => new Set(scene.zones.filter((zone) => zone.status === 'Active').map((zone) => zone.id)),
    [scene.zones]
  )
  const visibleRacks = useMemo(() => scene.racks, [scene.racks])
  const effectiveBounds = useMemo(
    () => ({ minX: 0, minY: 0, maxX: scene.canvas.width, maxY: scene.canvas.height }),
    [scene.canvas.height, scene.canvas.width]
  )
  const paperWidth = scene.canvas.width * scale
  const paperHeight = scene.canvas.height * scale
  const contentWidth = Math.max(size.width, paperWidth + CANVAS_PADDING * 2)
  const contentHeight = Math.max(size.height, paperHeight + CANVAS_PADDING * 2)
  const paperLeft = (contentWidth - paperWidth) / 2
  const paperTop = (contentHeight - paperHeight) / 2
  const viewport = useMemo(
    () => ({
      scale,
      x: paperLeft - scrollPosition.left,
      y: paperTop - scrollPosition.top,
    }),
    [paperLeft, paperTop, scale, scrollPosition.left, scrollPosition.top]
  )

  const fit = useCallback(() => {
    if (!size.width || !size.height) return
    isFitMode.current = true
    pendingCenter.current = {
      x: (effectiveBounds.minX + effectiveBounds.maxX) / 2,
      y: (effectiveBounds.minY + effectiveBounds.maxY) / 2,
    }
    setScale(getFitScale(size.width, size.height, effectiveBounds))
  }, [effectiveBounds, size.height, size.width])

  const zoomAtCenter = useCallback(
    (factor: number) => {
      isFitMode.current = false
      pendingCenter.current = {
        x: (size.width / 2 - viewport.x) / viewport.scale,
        y: (size.height / 2 - viewport.y) / viewport.scale,
      }
      setScale((current) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, current * factor)))
    },
    [size.height, size.width, viewport]
  )

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => zoomAtCenter(ZOOM_FACTOR),
      zoomOut: () => zoomAtCenter(1 / ZOOM_FACTOR),
      fit,
    }),
    [fit, zoomAtCenter]
  )

  useEffect(() => {
    if (size.width <= 0 || size.height <= 0) return
    if (isFitMode.current) fit()
  }, [fit, size])

  useLayoutEffect(() => {
    const container = containerRef.current
    const center = pendingCenter.current
    if (!container || !center || size.width <= 0 || size.height <= 0) return

    const nextLeft = Math.max(0, paperLeft + center.x * scale - size.width / 2)
    const nextTop = Math.max(0, paperTop + center.y * scale - size.height / 2)
    container.scrollTo({ left: nextLeft, top: nextTop })
    setScrollPosition({ left: nextLeft, top: nextTop })
    pendingCenter.current = null
  }, [
    containerRef,
    contentHeight,
    contentWidth,
    paperLeft,
    paperTop,
    scale,
    size.height,
    size.width,
  ])

  useEffect(() => {
    onZoomChange(Math.round(scale * 100))
  }, [onZoomChange, scale])

  const canTransformSelection = (() => {
    if (!canConfigure || !selection) return false
    if (selection.kind === 'decoration') return true
    if (selection.kind === 'zone') {
      return scene.zones.some((zone) => zone.id === selection.id && zone.status === 'Active')
    }
    if (selection.kind === 'rack') {
      return scene.racks.some(
        (rack) =>
          rack.id === selection.id && rack.status === 'Active' && activeZoneIds.has(rack.zoneId)
      )
    }
    return false
  })()
  const selectionKey = selection ? `${selection.kind}:${selection.id}` : null
  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return
    const selectedNode = selectionKey ? objectNodes.current.get(selectionKey) : undefined
    transformer.nodes(selectedNode && canTransformSelection ? [selectedNode] : [])
    transformer.getLayer()?.batchDraw()
  }, [canTransformSelection, selectionKey])

  const setObjectNode = useCallback((key: string, node: Konva.Node | null) => {
    if (node) objectNodes.current.set(key, node)
    else objectNodes.current.delete(key)
  }, [])

  const gridLines = useMemo(() => {
    if (!isGridVisible || scene.canvas.gridSize * viewport.scale < 7) return []
    const lines: { points: number[]; key: string }[] = []
    const overscan = scene.canvas.gridSize
    const visibleBounds = {
      minX: -viewport.x / viewport.scale - overscan,
      minY: -viewport.y / viewport.scale - overscan,
      maxX: (size.width - viewport.x) / viewport.scale + overscan,
      maxY: (size.height - viewport.y) / viewport.scale + overscan,
    }
    const minX = Math.max(effectiveBounds.minX, visibleBounds.minX)
    const maxX = Math.min(effectiveBounds.maxX, visibleBounds.maxX)
    const minY = Math.max(effectiveBounds.minY, visibleBounds.minY)
    const maxY = Math.min(effectiveBounds.maxY, visibleBounds.maxY)
    const startX = Math.floor(minX / scene.canvas.gridSize) * scene.canvas.gridSize
    const endX = Math.ceil(maxX / scene.canvas.gridSize) * scene.canvas.gridSize
    const startY = Math.floor(minY / scene.canvas.gridSize) * scene.canvas.gridSize
    const endY = Math.ceil(maxY / scene.canvas.gridSize) * scene.canvas.gridSize

    for (let x = startX; x <= endX; x += scene.canvas.gridSize) {
      if (x < effectiveBounds.minX || x > effectiveBounds.maxX) continue
      lines.push({ key: `x-${x}`, points: [x, minY, x, maxY] })
    }
    for (let y = startY; y <= endY; y += scene.canvas.gridSize) {
      if (y < effectiveBounds.minY || y > effectiveBounds.maxY) continue
      lines.push({ key: `y-${y}`, points: [minX, y, maxX, y] })
    }
    return lines
  }, [effectiveBounds, isGridVisible, scene.canvas.gridSize, size, viewport])
  const sortedZones = useMemo(
    () => scene.zones.toSorted((first, second) => first.zIndex - second.zIndex),
    [scene.zones]
  )
  const sortedRacks = useMemo(
    () => visibleRacks.toSorted((first, second) => first.zIndex - second.zIndex),
    [visibleRacks]
  )
  const sortedDecorations = useMemo(
    () => scene.decorations.toSorted((first, second) => first.zIndex - second.zIndex),
    [scene.decorations]
  )
  const slotsByRack = useMemo(() => {
    const result = new Map<string, WarehouseLayoutEditorScene['slots']>()
    for (const slot of scene.slots) {
      const rackSlots = result.get(slot.rackId) ?? []
      rackSlots.push(slot)
      result.set(slot.rackId, rackSlots)
    }
    return result
  }, [scene.slots])

  if (!palette) {
    return (
      <div
        ref={containerRef}
        className="bg-muted h-full min-h-[28rem] w-full"
        role="application"
        aria-label="Mặt bằng kho tương tác đang tải"
        aria-busy="true"
      />
    )
  }
  const canvasPalette = palette

  function handleWheel(event: KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault()
    const direction = event.evt.deltaY > 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR
    zoomAtCenter(direction)
  }

  function handleTouchMove(event: KonvaEventObject<TouchEvent>) {
    if (event.evt.touches.length !== 2) return
    event.evt.preventDefault()
    const [firstTouch, secondTouch] = Array.from(event.evt.touches)
    if (!firstTouch || !secondTouch) return
    const distance = Math.hypot(
      secondTouch.clientX - firstTouch.clientX,
      secondTouch.clientY - firstTouch.clientY
    )
    const previousDistance = lastPinchDistance.current
    lastPinchDistance.current = distance
    if (!previousDistance) return
    const factor = distance / previousDistance
    zoomAtCenter(factor)
  }

  function getNodeGeometry(node: Konva.Node, zIndex: number): WarehouseLayoutGeometry {
    return {
      x: node.x(),
      y: node.y(),
      width: Math.max(1, node.width() * node.scaleX()),
      height: Math.max(1, node.height() * node.scaleY()),
      rotation: node.rotation(),
      zIndex,
    }
  }

  function commitNodeGeometry(
    target: WarehouseLayoutGeometryTarget,
    id: string,
    node: Konva.Node,
    zIndex: number
  ) {
    const nodeGeometry = getNodeGeometry(node, zIndex)
    node.scaleX(1)
    node.scaleY(1)
    const geometry = constrainLayoutGeometryToCanvas(nodeGeometry, scene.canvas)
    onGeometryChange(target, id, geometry)
  }

  function renderBusinessObject(
    target: 'zone' | 'rack',
    object:
      | WarehouseLayoutEditorScene['zones'][number]
      | WarehouseLayoutEditorScene['racks'][number]
  ) {
    const isRack = 'rackCode' in object
    const code = isRack ? object.rackCode : object.zoneCode
    const key = `${target}:${object.id}`
    const selected = isSelected(selection, target, object.id)
    const isZone = !isRack
    const isInactive = object.status !== 'Active'
    const rack = isRack ? object : null
    const rackSlots = rack ? (slotsByRack.get(rack.id) ?? []) : []
    const objectFill = object.color ?? (isZone ? canvasPalette.accent : canvasPalette.card)
    const objectForeground = object.color
      ? getReadableCanvasColor(object.color, canvasPalette)
      : canvasPalette.foreground
    const canMoveObject =
      canConfigure &&
      object.status === 'Active' &&
      (isZone || (rack !== null && activeZoneIds.has(rack.zoneId)))
    return (
      <Group
        key={key}
        ref={(node) => setObjectNode(key, node)}
        x={object.x}
        y={object.y}
        width={object.width}
        height={object.height}
        rotation={object.rotation}
        draggable={canMoveObject}
        dragBoundFunc={(position) => ({
          x: snapToGrid(position.x, scene.canvas.gridSize),
          y: snapToGrid(position.y, scene.canvas.gridSize),
        })}
        onClick={(event) => {
          event.cancelBubble = true
          onSelect({ kind: target, id: object.id })
        }}
        onTap={(event) => {
          event.cancelBubble = true
          onSelect({ kind: target, id: object.id })
        }}
        onDragEnd={(event) => {
          event.cancelBubble = true
          commitNodeGeometry(target, object.id, event.target, object.zIndex)
        }}
        onTransformEnd={(event) => {
          event.cancelBubble = true
          commitNodeGeometry(target, object.id, event.target, object.zIndex)
        }}
      >
        <Rect
          name={`${target}:${object.id}`}
          width={object.width}
          height={object.height}
          fill={objectFill}
          opacity={isInactive ? 0.38 : isZone && !object.color ? 0.55 : 1}
          stroke={selected ? canvasPalette.primary : canvasPalette.border}
          strokeWidth={selected ? 3 / viewport.scale : 1 / viewport.scale}
          dash={isZone || isInactive ? [10 / viewport.scale, 5 / viewport.scale] : undefined}
          cornerRadius={isZone ? 4 : 2}
        />
        <Text
          x={10}
          y={10}
          width={Math.max(object.width - 20, 1)}
          text={code}
          fill={objectForeground}
          fontFamily="monospace"
          fontSize={isZone ? 16 : 13}
          fontStyle="bold"
          ellipsis
          wrap="none"
        />
        {isInactive ? (
          <Text
            x={10}
            y={Math.max(10, object.height - 20)}
            width={Math.max(object.width - 20, 1)}
            text="Ngừng hoạt động"
            fill={objectForeground}
            fontSize={9}
            fontStyle="bold"
            align="right"
            ellipsis
            wrap="none"
          />
        ) : null}
        {rack ? (
          <Text
            x={10}
            y={Math.min(32, Math.max(rack.height - 18, 18))}
            width={Math.max(rack.width - 20, 1)}
            text={getOccupancyLabel(rackSlots)}
            fill={object.color ? objectForeground : canvasPalette.mutedForeground}
            fontFamily="monospace"
            fontSize={10}
            ellipsis
            wrap="none"
          />
        ) : null}
        {rack ? (
          <>
            <Line
              points={[6, 28, rack.width - 6, 28]}
              stroke={objectForeground}
              strokeWidth={1}
              opacity={0.55}
              listening={false}
            />
            <Line
              points={[6, rack.height - 7, rack.width - 6, rack.height - 7]}
              stroke={objectForeground}
              strokeWidth={1}
              opacity={0.55}
              listening={false}
            />
            <Line
              points={[6, 28, 6, rack.height - 7]}
              stroke={objectForeground}
              strokeWidth={2}
              opacity={0.7}
              listening={false}
            />
            <Line
              points={[rack.width - 6, 28, rack.width - 6, rack.height - 7]}
              stroke={objectForeground}
              strokeWidth={2}
              opacity={0.7}
              listening={false}
            />
          </>
        ) : null}
        {rack ? renderRackSlots(rack, rackSlots, canvasPalette, selection, onSelect) : null}
      </Group>
    )
  }

  return (
    <div
      ref={containerRef}
      className="focus-visible:ring-ring relative h-full min-h-0 w-full touch-none overflow-auto overscroll-contain bg-[#eef1f5] outline-none select-none focus-visible:ring-2 focus-visible:ring-inset dark:bg-slate-950"
      role="application"
      aria-label="Mặt bằng kho tương tác"
      aria-describedby="warehouse-canvas-instructions"
      tabIndex={0}
      style={{
        cursor: 'default',
        backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.28) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onSelect(null)
      }}
      onDragOver={(event) => {
        if (hasLayoutDragData(event.dataTransfer)) event.preventDefault()
      }}
      onDrop={(event) => {
        const payload = readLayoutDragData(event.dataTransfer)
        if (!payload) return
        event.preventDefault()
        const bounds = event.currentTarget.getBoundingClientRect()
        const x = snapToGrid(
          (event.clientX - bounds.left + event.currentTarget.scrollLeft - paperLeft) / scale,
          scene.canvas.gridSize
        )
        const y = snapToGrid(
          (event.clientY - bounds.top + event.currentTarget.scrollTop - paperTop) / scale,
          scene.canvas.gridSize
        )
        if (x < 0 || y < 0 || x > scene.canvas.width || y > scene.canvas.height) return
        onPaletteDrop(payload, x, y)
      }}
      onScroll={(event) => {
        setScrollPosition({
          left: event.currentTarget.scrollLeft,
          top: event.currentTarget.scrollTop,
        })
      }}
    >
      <p id="warehouse-canvas-instructions" className="sr-only">
        Dùng danh sách đối tượng để chọn bằng bàn phím. Nhấn Escape để bỏ chọn.
      </p>
      {size.width > 0 && size.height > 0 ? (
        <div style={{ width: contentWidth, height: contentHeight }} className="relative">
          <div className="sticky top-0 left-0" style={{ width: size.width, height: size.height }}>
            <Stage
              ref={stageRef}
              width={size.width}
              height={size.height}
              x={viewport.x}
              y={viewport.y}
              scaleX={scale}
              scaleY={scale}
              draggable={false}
              onWheel={handleWheel}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => {
                lastPinchDistance.current = null
              }}
            >
              <Layer>
                <Rect
                  name="canvas-background"
                  x={effectiveBounds.minX}
                  y={effectiveBounds.minY}
                  width={effectiveBounds.maxX - effectiveBounds.minX}
                  height={effectiveBounds.maxY - effectiveBounds.minY}
                  fill={canvasPalette.background}
                  stroke={canvasPalette.primary}
                  strokeWidth={2 / viewport.scale}
                  onClick={() => onSelect(null)}
                  onTap={() => onSelect(null)}
                />
                {gridLines.map((line) => (
                  <Line
                    key={line.key}
                    points={line.points}
                    stroke={canvasPalette.border}
                    strokeWidth={1 / viewport.scale}
                    opacity={0.45}
                    listening={false}
                  />
                ))}
              </Layer>
              <Layer>{sortedZones.map((zone) => renderBusinessObject('zone', zone))}</Layer>
              <Layer>{sortedRacks.map((rack) => renderBusinessObject('rack', rack))}</Layer>
              <Layer>
                {sortedDecorations.map((decoration) => {
                  const key = `decoration:${decoration.clientKey}`
                  const selected = isSelected(selection, 'decoration', decoration.clientKey)
                  const decorationFill = decoration.color ?? canvasPalette.background
                  const decorationForeground = decoration.color ?? canvasPalette.foreground
                  return (
                    <Group
                      key={key}
                      ref={(node) => setObjectNode(key, node)}
                      x={decoration.x}
                      y={decoration.y}
                      width={decoration.width}
                      height={decoration.height}
                      rotation={decoration.rotation}
                      draggable={canConfigure}
                      dragBoundFunc={(position) => ({
                        x: snapToGrid(position.x, scene.canvas.gridSize),
                        y: snapToGrid(position.y, scene.canvas.gridSize),
                      })}
                      onClick={(event) => {
                        event.cancelBubble = true
                        onSelect({ kind: 'decoration', id: decoration.clientKey })
                      }}
                      onTap={(event) => {
                        event.cancelBubble = true
                        onSelect({ kind: 'decoration', id: decoration.clientKey })
                      }}
                      onDragEnd={(event) => {
                        event.cancelBubble = true
                        commitNodeGeometry(
                          'decoration',
                          decoration.clientKey,
                          event.target,
                          decoration.zIndex
                        )
                      }}
                      onTransformEnd={(event) => {
                        event.cancelBubble = true
                        commitNodeGeometry(
                          'decoration',
                          decoration.clientKey,
                          event.target,
                          decoration.zIndex
                        )
                      }}
                    >
                      <Rect
                        name={`decoration:${decoration.clientKey}`}
                        width={decoration.width}
                        height={decoration.height}
                        fill={selected ? decorationFill : 'transparent'}
                        opacity={selected ? 0.16 : 0}
                        stroke={selected ? canvasPalette.primary : 'transparent'}
                        strokeWidth={selected ? 2 / viewport.scale : 0}
                        cornerRadius={2}
                      />
                      {renderDecorationSymbol(
                        decoration.type,
                        decoration.width,
                        decoration.height,
                        canvasPalette,
                        decoration.color ? decorationForeground : undefined
                      )}
                      {decoration.width >= 72 && decoration.height >= 58 ? (
                        <Text
                          x={8}
                          y={decoration.height - 22}
                          width={Math.max(decoration.width - 16, 1)}
                          text={decoration.label}
                          align="center"
                          fill={decorationForeground}
                          fontSize={11}
                          fontStyle="bold"
                          ellipsis
                          wrap="none"
                        />
                      ) : null}
                    </Group>
                  )
                })}
              </Layer>
              <Layer>
                <Transformer
                  ref={transformerRef}
                  rotateEnabled
                  flipEnabled={false}
                  borderStroke={canvasPalette.primary}
                  anchorStroke={canvasPalette.primary}
                  anchorFill={canvasPalette.card}
                  anchorSize={8}
                  rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                  boundBoxFunc={(oldBox, newBox) =>
                    Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20 ? oldBox : newBox
                  }
                />
              </Layer>
            </Stage>
          </div>
        </div>
      ) : null}
      {scene.slots.length > 0 ? (
        <div className="bg-card/95 pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border px-3 py-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-accent size-2.5 rounded-[2px] border" aria-hidden="true" />
            Có hàng
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="bg-card size-2.5 rounded-[2px] border" aria-hidden="true" />
            Trống
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="bg-warning-container border-warning size-2.5 rounded-[2px] border"
              aria-hidden="true"
            />
            Đang chọn
          </span>
        </div>
      ) : null}
    </div>
  )
}

function renderRackSlots(
  rack: WarehouseLayoutEditorScene['racks'][number],
  slots: WarehouseLayoutEditorScene['slots'],
  palette: CanvasPalette,
  selection: WarehouseLayoutSelection | null,
  onSelect: (selection: WarehouseLayoutSelection | null) => void
) {
  if (slots.length === 0 || rack.width < 60 || rack.height < 45) return null
  const gap = 3
  const availableWidth = Math.max(rack.width - 20, 1)
  const availableHeight = Math.max(rack.height - 52, 1)
  const visibleSlots = slots.slice(0, 60)
  const columns = Math.min(
    visibleSlots.length,
    Math.max(1, Math.ceil(Math.sqrt(visibleSlots.length * (availableWidth / availableHeight))))
  )
  const rows = Math.ceil(visibleSlots.length / columns)
  const slotWidth = (availableWidth - gap * (columns - 1)) / columns
  const slotHeight = (availableHeight - gap * (rows - 1)) / rows
  if (slotWidth < 7 || slotHeight < 7) return null

  return visibleSlots.map((slot, index) => {
    const x = 10 + (index % columns) * (slotWidth + gap)
    const y = 42 + Math.floor(index / columns) * (slotHeight + gap)
    const selected = isSelected(selection, 'slot', slot.id)
    const fill = selected
      ? palette.warningContainer
      : !slot.isActive
        ? palette.muted
        : slot.occupancyStatus === 'Vacant'
          ? palette.card
          : slot.occupancyStatus === 'Reserved'
            ? palette.warningContainer
            : palette.accent
    return (
      <Group
        key={slot.id}
        x={x}
        y={y}
        onClick={(event) => {
          event.cancelBubble = true
          onSelect({ kind: 'slot', id: slot.id })
        }}
        onTap={(event) => {
          event.cancelBubble = true
          onSelect({ kind: 'slot', id: slot.id })
        }}
      >
        <Rect
          name={`slot:${slot.id}`}
          width={slotWidth}
          height={slotHeight}
          fill={fill}
          opacity={slot.isActive ? 1 : 0.55}
          stroke={selected ? palette.warning : palette.border}
          strokeWidth={selected ? 2 : 1}
          cornerRadius={2}
        />
        {selected && slotWidth >= 14 && slotHeight >= 10 ? (
          <Line
            points={[
              slotWidth * 0.3,
              slotHeight * 0.52,
              slotWidth * 0.45,
              slotHeight * 0.68,
              slotWidth * 0.72,
              slotHeight * 0.32,
            ]}
            stroke={palette.warning}
            strokeWidth={1.5}
            lineCap="round"
            lineJoin="round"
            listening={false}
          />
        ) : null}
      </Group>
    )
  })
}
