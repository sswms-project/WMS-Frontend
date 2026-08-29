import { describe, expect, it } from 'vitest'
import type { WarehouseLayoutSceneResponse } from '../types/warehouse-layout-scene.types'
import { mapEditorSceneToSaveRequest, mapWarehouseLayoutScene } from './layout-scene-mapper'

const persistedScene: WarehouseLayoutSceneResponse = {
  warehouseId: 'warehouse-1',
  version: 3,
  canvas: { width: 1200, height: 800, gridSize: 20 },
  zones: [
    {
      id: 'zone-1',
      zoneCode: 'A',
      zoneName: 'Khu A',
      status: 'Active',
      x: null,
      y: null,
      width: null,
      height: null,
      rotation: 0,
      zIndex: 0,
      color: '#C7E8C0',
    },
  ],
  racks: [
    {
      id: 'rack-1',
      zoneId: 'zone-1',
      zoneCode: 'A',
      rackCode: 'A-01',
      rackName: 'Kệ A-01',
      status: 'Active',
      x: 120,
      y: 160,
      width: 200,
      height: 80,
      rotation: 90,
      zIndex: 5,
      color: '#B9DDF2',
    },
  ],
  slots: [],
  decorations: [
    {
      id: 'decoration-1',
      type: 'Receiving',
      label: 'Khu nhận hàng',
      x: 40,
      y: 40,
      width: 200,
      height: 100,
      rotation: 0,
      zIndex: 10,
      color: '#FFE0A8',
    },
  ],
}

describe('warehouse layout scene mapper', () => {
  it('generates deterministic geometry only for unplaced business objects', () => {
    const result = mapWarehouseLayoutScene(persistedScene)

    expect(result.hasGeneratedGeometry).toBe(true)
    expect(result.editorScene.zones[0]).toMatchObject({ id: 'zone-1', x: 60, y: 60 })
    expect(result.editorScene.racks[0]).toMatchObject({
      id: 'rack-1',
      x: 120,
      y: 160,
      rotation: 90,
    })
    expect(result.editorScene.decorations[0]!.clientKey).toBe('decoration-1')
  })

  it('maps the editor draft to one versioned batch request', () => {
    const { editorScene } = mapWarehouseLayoutScene(persistedScene)
    editorScene.decorations.push({
      id: '',
      clientKey: 'local-1',
      type: 'Door',
      label: ' Cửa phụ ',
      x: 20,
      y: 20,
      width: 40,
      height: 80,
      rotation: 0,
      zIndex: 11,
      color: null,
    })

    const request = mapEditorSceneToSaveRequest('warehouse-1', 3, editorScene)

    expect(request.version).toBe(3)
    expect(request.zones[0]!.entityId).toBe('zone-1')
    expect(request.zones[0]!.color).toBe('#C7E8C0')
    expect(request.racks[0]).toMatchObject({
      entityId: 'rack-1',
      rotation: 90,
      color: '#B9DDF2',
    })
    expect(request.decorations[0]!.color).toBe('#FFE0A8')
    expect(request.decorations[1]).toMatchObject({ id: null, type: 'Door', label: 'Cửa phụ' })
  })

  it('omits inactive business geometry from the update batch', () => {
    const inactiveScene: WarehouseLayoutSceneResponse = {
      ...persistedScene,
      zones: persistedScene.zones.map((zone) => ({ ...zone, status: 'Inactive' })),
      racks: persistedScene.racks.map((rack) => ({ ...rack, status: 'Active' })),
    }
    const { editorScene, hasGeneratedGeometry } = mapWarehouseLayoutScene(inactiveScene)

    const request = mapEditorSceneToSaveRequest('warehouse-1', 3, editorScene)

    expect(request.zones).toEqual([])
    expect(request.racks).toEqual([])
    expect(hasGeneratedGeometry).toBe(false)
  })
})
