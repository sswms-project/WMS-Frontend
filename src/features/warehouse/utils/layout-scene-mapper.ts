import type {
  SaveWarehouseLayoutSceneRequest,
  WarehouseLayoutEditorDecoration,
  WarehouseLayoutEditorRack,
  WarehouseLayoutEditorScene,
  WarehouseLayoutEditorZone,
  WarehouseLayoutGeometry,
  WarehouseLayoutSceneResponse,
} from '../types/warehouse-layout-scene.types'
import { normalizeLayoutGeometry } from './layout-grid'

const DEFAULT_ZONE_WIDTH = 520
const DEFAULT_ZONE_HEIGHT = 320
const DEFAULT_RACK_WIDTH = 160
const DEFAULT_RACK_HEIGHT = 60

function hasGeometry(object: {
  x: number | null
  y: number | null
  width: number | null
  height: number | null
}): object is { x: number; y: number; width: number; height: number } {
  return object.x !== null && object.y !== null && object.width !== null && object.height !== null
}

function getDefaultZoneGeometry(
  index: number,
  scene: WarehouseLayoutSceneResponse
): WarehouseLayoutGeometry {
  const columns = Math.max(1, Math.floor(scene.canvas.width / 600))
  return normalizeLayoutGeometry(
    {
      x: 60 + (index % columns) * 600,
      y: 60 + Math.floor(index / columns) * 400,
      width: Math.min(DEFAULT_ZONE_WIDTH, scene.canvas.width),
      height: Math.min(DEFAULT_ZONE_HEIGHT, scene.canvas.height),
      rotation: 0,
      zIndex: index,
    },
    scene.canvas
  )
}

function getDefaultRackGeometry(
  rackIndex: number,
  zone: WarehouseLayoutEditorZone,
  scene: WarehouseLayoutSceneResponse
): WarehouseLayoutGeometry {
  const columns = Math.max(1, Math.floor(Math.max(zone.width - 60, 1) / (DEFAULT_RACK_WIDTH + 20)))
  return normalizeLayoutGeometry(
    {
      x: zone.x + 30 + (rackIndex % columns) * (DEFAULT_RACK_WIDTH + 20),
      y: zone.y + 70 + Math.floor(rackIndex / columns) * (DEFAULT_RACK_HEIGHT + 24),
      width: DEFAULT_RACK_WIDTH,
      height: DEFAULT_RACK_HEIGHT,
      rotation: 0,
      zIndex: 100 + rackIndex,
    },
    scene.canvas
  )
}

export function mapWarehouseLayoutScene(scene: WarehouseLayoutSceneResponse): {
  editorScene: WarehouseLayoutEditorScene
  hasGeneratedGeometry: boolean
} {
  let hasGeneratedGeometry = false
  const zones = scene.zones.map<WarehouseLayoutEditorZone>((zone, index) => {
    const geometry = hasGeometry(zone)
      ? normalizeLayoutGeometry(zone, scene.canvas, false)
      : getDefaultZoneGeometry(index, scene)
    if (!hasGeometry(zone) && zone.status === 'Active') hasGeneratedGeometry = true
    return { ...zone, ...geometry, color: zone.color ?? null }
  })
  const zoneById = new Map(zones.map((zone) => [zone.id, zone]))
  const rackIndexByZone = new Map<string, number>()
  const racks = scene.racks.map<WarehouseLayoutEditorRack>((rack, index) => {
    const zone = zoneById.get(rack.zoneId)
    const rackIndex = rackIndexByZone.get(rack.zoneId) ?? 0
    rackIndexByZone.set(rack.zoneId, rackIndex + 1)
    const geometry = hasGeometry(rack)
      ? normalizeLayoutGeometry(rack, scene.canvas, false)
      : zone
        ? getDefaultRackGeometry(rackIndex, zone, scene)
        : normalizeLayoutGeometry(
            {
              x: 40 + index * 20,
              y: 40 + index * 20,
              width: DEFAULT_RACK_WIDTH,
              height: DEFAULT_RACK_HEIGHT,
              rotation: 0,
              zIndex: 100 + index,
            },
            scene.canvas
          )
    if (!hasGeometry(rack) && rack.status === 'Active' && zone?.status === 'Active') {
      hasGeneratedGeometry = true
    }
    return { ...rack, ...geometry, color: rack.color ?? null }
  })
  const decorations = scene.decorations.map<WarehouseLayoutEditorDecoration>((decoration) => ({
    ...decoration,
    color: decoration.color ?? null,
    clientKey: decoration.id,
  }))

  return {
    editorScene: { canvas: scene.canvas, zones, racks, slots: scene.slots, decorations },
    hasGeneratedGeometry,
  }
}

export function mapEditorSceneToSaveRequest(
  warehouseId: string,
  version: number,
  scene: WarehouseLayoutEditorScene
): SaveWarehouseLayoutSceneRequest {
  const activeZoneIds = new Set(
    scene.zones.filter((zone) => zone.status === 'Active').map((zone) => zone.id)
  )

  return {
    warehouseId,
    version,
    canvas: scene.canvas,
    zones: scene.zones
      .filter((zone) => zone.status === 'Active')
      .map((zone) => ({
        entityId: zone.id,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height,
        rotation: zone.rotation,
        zIndex: zone.zIndex,
        color: zone.color ?? null,
      })),
    racks: scene.racks
      .filter((rack) => rack.status === 'Active' && activeZoneIds.has(rack.zoneId))
      .map((rack) => ({
        entityId: rack.id,
        x: rack.x,
        y: rack.y,
        width: rack.width,
        height: rack.height,
        rotation: rack.rotation,
        zIndex: rack.zIndex,
        color: rack.color ?? null,
      })),
    decorations: scene.decorations.map((decoration) => ({
      id: decoration.id || null,
      type: decoration.type,
      label: decoration.label.trim(),
      x: decoration.x,
      y: decoration.y,
      width: decoration.width,
      height: decoration.height,
      rotation: decoration.rotation,
      zIndex: decoration.zIndex,
      color: decoration.color ?? null,
    })),
  }
}
