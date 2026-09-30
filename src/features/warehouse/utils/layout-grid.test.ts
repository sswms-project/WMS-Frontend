import { describe, expect, it } from 'vitest'
import {
  constrainLayoutGeometryToCanvas,
  getLayoutGeometryBounds,
  getRackPresetSize,
} from './layout-grid'

const canvas = { width: 1000, height: 600, gridSize: 20 }

describe('constrainLayoutGeometryToCanvas', () => {
  it('keeps a dropped object inside the fixed canvas', () => {
    const geometry = constrainLayoutGeometryToCanvas(
      { x: 960, y: 580, width: 180, height: 100, rotation: 0, zIndex: 1 },
      canvas
    )
    const bounds = getLayoutGeometryBounds(geometry)

    expect(bounds.minX).toBeGreaterThanOrEqual(0)
    expect(bounds.minY).toBeGreaterThanOrEqual(0)
    expect(bounds.maxX).toBeLessThanOrEqual(canvas.width)
    expect(bounds.maxY).toBeLessThanOrEqual(canvas.height)
  })

  it('limits an oversized object to the canvas dimensions', () => {
    const geometry = constrainLayoutGeometryToCanvas(
      { x: -100, y: -100, width: 2000, height: 900, rotation: 0, zIndex: 1 },
      canvas
    )

    expect(geometry).toMatchObject({ x: 0, y: 0, width: 1000, height: 600 })
  })

  it('keeps a rotated object inside after grid snapping', () => {
    const geometry = constrainLayoutGeometryToCanvas(
      { x: 980, y: 580, width: 180, height: 80, rotation: 45, zIndex: 1 },
      canvas
    )
    const bounds = getLayoutGeometryBounds(geometry)

    expect(bounds.minX).toBeGreaterThanOrEqual(0)
    expect(bounds.minY).toBeGreaterThanOrEqual(0)
    expect(bounds.maxX).toBeLessThanOrEqual(canvas.width)
    expect(bounds.maxY).toBeLessThanOrEqual(canvas.height)
  })

  it('scales down a rotated object whose projected bounds exceed the canvas', () => {
    const geometry = constrainLayoutGeometryToCanvas(
      { x: 0, y: 0, width: 1000, height: 600, rotation: 45, zIndex: 1 },
      canvas
    )
    const bounds = getLayoutGeometryBounds(geometry)

    expect(bounds.minX).toBeGreaterThanOrEqual(0)
    expect(bounds.minY).toBeGreaterThanOrEqual(0)
    expect(bounds.maxX).toBeLessThanOrEqual(canvas.width)
    expect(bounds.maxY).toBeLessThanOrEqual(canvas.height)
  })
})

describe('getRackPresetSize', () => {
  it('uses the same 160×60 initial footprint for every rack style', () => {
    expect(getRackPresetSize()).toEqual({ width: 160, height: 60 })
  })
})
