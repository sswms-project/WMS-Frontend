import { describe, expect, it } from 'vitest'
import {
  LAYOUT_DRAG_DATA_TYPE,
  hasLayoutDragData,
  readLayoutDragData,
  writeLayoutDragData,
} from './designer-constants'

function createDataTransfer(protectData = false) {
  const values = new Map<string, string>()
  return {
    effectAllowed: 'none',
    get types() {
      return Array.from(values.keys())
    },
    setData: (type: string, value: string) => values.set(type, value),
    getData: (type: string) => (protectData ? '' : (values.get(type) ?? '')),
  } as unknown as DataTransfer
}

describe('layout palette drag data', () => {
  it('recognizes a drag from its type without reading protected payload data', () => {
    const dataTransfer = createDataTransfer(true)
    writeLayoutDragData(dataTransfer, { kind: 'rack', shape: 'Vertical' })

    expect(readLayoutDragData(dataTransfer)).toBeNull()
    expect(hasLayoutDragData(dataTransfer)).toBe(true)
  })

  it('round-trips supported business and decoration payloads', () => {
    const dataTransfer = createDataTransfer()
    writeLayoutDragData(dataTransfer, { kind: 'zone' })
    expect(readLayoutDragData(dataTransfer)).toEqual({ kind: 'zone' })

    writeLayoutDragData(dataTransfer, { kind: 'rack', shape: 'CrossBraced' })
    expect(readLayoutDragData(dataTransfer)).toEqual({ kind: 'rack', shape: 'CrossBraced' })

    writeLayoutDragData(dataTransfer, {
      kind: 'decoration',
      type: 'Forklift',
      label: 'Xe nâng',
    })
    expect(readLayoutDragData(dataTransfer)).toEqual({
      kind: 'decoration',
      type: 'Forklift',
      label: 'Xe nâng',
    })
  })

  it('ignores unknown decoration types', () => {
    const dataTransfer = createDataTransfer()
    dataTransfer.setData(
      LAYOUT_DRAG_DATA_TYPE,
      JSON.stringify({ kind: 'decoration', type: 'Unknown', label: 'Không hợp lệ' })
    )
    expect(readLayoutDragData(dataTransfer)).toBeNull()
  })

  it('ignores unknown rack shapes', () => {
    const dataTransfer = createDataTransfer()
    dataTransfer.setData(LAYOUT_DRAG_DATA_TYPE, JSON.stringify({ kind: 'rack', shape: 'Circular' }))
    expect(readLayoutDragData(dataTransfer)).toBeNull()
  })
})
