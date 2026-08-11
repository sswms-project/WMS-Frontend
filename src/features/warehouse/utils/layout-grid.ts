import type {
  WarehouseLayoutCanvas,
  WarehouseLayoutGeometry,
} from '../types/warehouse-layout-scene.types'

export const MIN_LAYOUT_OBJECT_SIZE = 20
export const MAX_LAYOUT_EXTENT = 100_000

export interface LayoutBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export function snapToGrid(value: number, gridSize: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(gridSize) || gridSize <= 0) return value
  return Math.round(value / gridSize) * gridSize
}

export function normalizeRotation(rotation: number): number {
  return ((Math.round(rotation) % 360) + 360) % 360
}

function clamp(value: number, minimum: number, maximum: number): number {
  const result = Math.min(Math.max(value, minimum), maximum)
  return Object.is(result, -0) ? 0 : result
}

export function getLayoutGeometryBounds(geometry: WarehouseLayoutGeometry): LayoutBounds {
  const radians = (geometry.rotation * Math.PI) / 180
  const cosine = Math.cos(radians)
  const sine = Math.sin(radians)
  const corners = [
    { x: 0, y: 0 },
    { x: geometry.width * cosine, y: geometry.width * sine },
    { x: -geometry.height * sine, y: geometry.height * cosine },
    {
      x: geometry.width * cosine - geometry.height * sine,
      y: geometry.width * sine + geometry.height * cosine,
    },
  ]

  return {
    minX: geometry.x + Math.min(...corners.map((corner) => corner.x)),
    maxX: geometry.x + Math.max(...corners.map((corner) => corner.x)),
    minY: geometry.y + Math.min(...corners.map((corner) => corner.y)),
    maxY: geometry.y + Math.max(...corners.map((corner) => corner.y)),
  }
}

export function normalizeLayoutGeometry(
  geometry: WarehouseLayoutGeometry,
  canvas: WarehouseLayoutCanvas,
  shouldSnap = true
): WarehouseLayoutGeometry {
  const minimumWidth = Math.min(MIN_LAYOUT_OBJECT_SIZE, MAX_LAYOUT_EXTENT)
  const minimumHeight = Math.min(MIN_LAYOUT_OBJECT_SIZE, MAX_LAYOUT_EXTENT)
  const normalizeValue = (value: number) =>
    shouldSnap ? snapToGrid(value, canvas.gridSize) : value

  return {
    x: normalizeValue(geometry.x),
    y: normalizeValue(geometry.y),
    width: clamp(normalizeValue(geometry.width), minimumWidth, MAX_LAYOUT_EXTENT),
    height: clamp(normalizeValue(geometry.height), minimumHeight, MAX_LAYOUT_EXTENT),
    rotation: normalizeRotation(geometry.rotation),
    zIndex: clamp(Math.round(geometry.zIndex), -1000, 1000),
  }
}

export function getEffectiveCanvasBounds(
  canvas: WarehouseLayoutCanvas,
  geometries: WarehouseLayoutGeometry[]
): LayoutBounds {
  const contentBounds = geometries.reduce<LayoutBounds>(
    (bounds, geometry) => {
      const objectBounds = getLayoutGeometryBounds(geometry)
      return {
        minX: Math.min(bounds.minX, objectBounds.minX),
        minY: Math.min(bounds.minY, objectBounds.minY),
        maxX: Math.max(bounds.maxX, objectBounds.maxX),
        maxY: Math.max(bounds.maxY, objectBounds.maxY),
      }
    },
    { minX: 0, minY: 0, maxX: canvas.width, maxY: canvas.height }
  )
  const padding = Math.max(canvas.gridSize * 4, 80)

  return {
    minX:
      contentBounds.minX < 0
        ? Math.floor((contentBounds.minX - padding) / canvas.gridSize) * canvas.gridSize
        : 0,
    minY:
      contentBounds.minY < 0
        ? Math.floor((contentBounds.minY - padding) / canvas.gridSize) * canvas.gridSize
        : 0,
    maxX:
      contentBounds.maxX > canvas.width
        ? Math.ceil((contentBounds.maxX + padding) / canvas.gridSize) * canvas.gridSize
        : canvas.width,
    maxY:
      contentBounds.maxY > canvas.height
        ? Math.ceil((contentBounds.maxY + padding) / canvas.gridSize) * canvas.gridSize
        : canvas.height,
  }
}
