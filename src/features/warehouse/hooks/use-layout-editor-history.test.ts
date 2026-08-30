import { describe, expect, it } from 'vitest'
import type { WarehouseLayoutEditorScene } from '../types/warehouse-layout-scene.types'
import { createLayoutEditorHistory, layoutEditorHistoryReducer } from './use-layout-editor-history'

const scene: WarehouseLayoutEditorScene = {
  canvas: { width: 500, height: 300, gridSize: 20 },
  zones: [
    {
      id: 'zone-1',
      zoneCode: 'A',
      zoneName: 'Khu A',
      status: 'Active',
      x: 20,
      y: 20,
      width: 200,
      height: 160,
      rotation: 0,
      zIndex: 0,
    },
  ],
  racks: [],
  slots: [],
  decorations: [],
}

describe('layout editor history reducer', () => {
  it('updates geometry without mutating the React Query source scene', () => {
    const initial = createLayoutEditorHistory(scene)
    const next = layoutEditorHistoryReducer(initial, {
      type: 'update-geometry',
      target: 'zone',
      id: 'zone-1',
      geometry: { ...scene.zones[0]!, x: 80 },
    })

    expect(scene.zones[0]!.x).toBe(20)
    expect(next.present.zones[0]!.x).toBe(80)
    expect(next.past).toHaveLength(1)
  })

  it('restores draft state through undo and redo', () => {
    const changed = layoutEditorHistoryReducer(createLayoutEditorHistory(scene), {
      type: 'add-decoration',
      decoration: {
        id: '',
        clientKey: 'local-1',
        type: 'Aisle',
        label: 'Lối đi',
        x: 40,
        y: 40,
        width: 120,
        height: 40,
        rotation: 0,
        zIndex: 1,
      },
    })
    const undone = layoutEditorHistoryReducer(changed, { type: 'undo' })
    const redone = layoutEditorHistoryReducer(undone, { type: 'redo' })

    expect(undone.present.decorations).toHaveLength(0)
    expect(redone.present.decorations[0]!.clientKey).toBe('local-1')
  })

  it('tracks color changes through undo and redo', () => {
    const changed = layoutEditorHistoryReducer(createLayoutEditorHistory(scene), {
      type: 'update-color',
      target: 'zone',
      id: 'zone-1',
      color: '#B9DDF2',
    })
    const undone = layoutEditorHistoryReducer(changed, { type: 'undo' })
    const redone = layoutEditorHistoryReducer(undone, { type: 'redo' })

    expect(changed.present.zones[0]?.color).toBe('#B9DDF2')
    expect(undone.present.zones[0]?.color).toBeUndefined()
    expect(redone.present.zones[0]?.color).toBe('#B9DDF2')
  })

  it('deletes decorations but has no command for deleting business entities', () => {
    const withDecoration = layoutEditorHistoryReducer(createLayoutEditorHistory(scene), {
      type: 'add-decoration',
      decoration: {
        id: 'decoration-1',
        clientKey: 'decoration-1',
        type: 'Door',
        label: 'Cửa',
        x: 40,
        y: 40,
        width: 40,
        height: 80,
        rotation: 0,
        zIndex: 1,
      },
    })
    const deleted = layoutEditorHistoryReducer(withDecoration, {
      type: 'delete-decoration',
      id: 'decoration-1',
    })

    expect(deleted.present.decorations).toHaveLength(0)
    expect(deleted.present.zones).toHaveLength(1)
  })
})
