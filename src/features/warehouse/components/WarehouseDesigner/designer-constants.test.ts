import { describe, expect, it } from 'vitest'
import {
  LAYOUT_DRAG_DATA_TYPE,
  readLayoutDragData,
  writeLayoutDragData,
} from './designer-constants'

function createDataTransfer() {
  const values = new Map<string, string>()
  return {
    effectAllowed: 'none',
    setData: (type: string, value: string) => values.set(type, value),
    getData: (type: string) => values.get(type) ?? '',
  } as unknown as DataTransfer
}

describe('layout palette drag data', () => {
  it('round-trips supported business and decoration payloads', () => {
    const dataTransfer = createDataTransfer()
    writeLayoutDragData(dataTransfer, { kind: 'zone' })
    expect(readLayoutDragData(dataTransfer)).toEqual({ kind: 'zone' })

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
})
