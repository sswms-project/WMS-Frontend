import { describe, expect, it } from 'vitest'
import type { WarehouseLayoutSceneResponse } from '../types/warehouse-layout-scene.types'
import { getLayoutGeometryBounds } from './layout-grid'
import { mapEditorSceneToSaveRequest, mapWarehouseLayoutScene } from './layout-scene-mapper'

const scene: WarehouseLayoutSceneResponse = {
  warehouseId: 'warehouse-1',
  version: 2,
  canvas: { width: 100, height: 100, gridSize: 10 },
  zones: [
    {
      id: 'zone-1',
      zoneCode: 'Z01',
      zoneName: 'Khu A',
      status: 'Active',
      x: 90,
      y: 10,
      width: 20,
      height: 20,
      rotation: 0,
      zIndex: 1,
    },
  ],
  racks: [
    {
      id: 'rack-1',
      zoneId: 'zone-1',
      zoneCode: 'Z01',
      rackCode: 'K01',
      rackName: 'Kệ 1',
      description: null,
      status: 'Active',
      layoutShape: 'Pallet',
      x: -10,
      y: 40,
      width: 20,
      height: 20,
      rotation: 0,
      zIndex: 2,
    },
  ],
  slots: [],
  decorations: [
    {
      id: 'decoration-1',
      type: 'Forklift',
      label: 'Xe nâng',
      x: 95,
      y: 95,
      width: 20,
      height: 20,
      rotation: 0,
      zIndex: 3,
    },
  ],
}

describe('layout scene mapper', () => {
  it('brings legacy geometry inside the fixed canvas before the next save', () => {
    const mapped = mapWarehouseLayoutScene(scene)

    expect(mapped.hasGeneratedGeometry).toBe(true)
    const geometries = [
      ...mapped.editorScene.zones,
      ...mapped.editorScene.racks,
      ...mapped.editorScene.decorations,
    ]
    geometries.forEach((geometry) => {
      const bounds = getLayoutGeometryBounds(geometry)
      expect(bounds.minX).toBeGreaterThanOrEqual(0)
      expect(bounds.minY).toBeGreaterThanOrEqual(0)
      expect(bounds.maxX).toBeLessThanOrEqual(scene.canvas.width)
      expect(bounds.maxY).toBeLessThanOrEqual(scene.canvas.height)
    })

    const request = mapEditorSceneToSaveRequest(
      scene.warehouseId,
      scene.version,
      mapped.editorScene
    )
    expect(request.zones[0]).toMatchObject({ x: 80, y: 10 })
    expect(request.racks[0]).toMatchObject({ x: 0, y: 40 })
    expect(request.racks[0]?.layoutShape).toBe('Pallet')
    expect(request.decorations[0]).toMatchObject({ x: 80, y: 80 })
  })

  it('gives a physical rack the same preset size as a rack placed from the diagram palette', () => {
    const mapped = mapWarehouseLayoutScene({
      ...scene,
      canvas: { width: 1000, height: 600, gridSize: 20 },
      zones: [
        {
          ...scene.zones[0]!,
          x: 40,
          y: 40,
          width: 600,
          height: 400,
        },
      ],
      racks: [
        {
          ...scene.racks[0]!,
          layoutShape: null,
          x: null,
          y: null,
          width: null,
          height: null,
        },
      ],
      decorations: [],
    })

    expect(mapped.editorScene.racks[0]).toMatchObject({
      width: 260,
      height: 100,
      layoutShape: 'Standard',
    })
  })
})
