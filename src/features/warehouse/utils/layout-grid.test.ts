import { describe, expect, it } from 'vitest'
import {
  getEffectiveCanvasBounds,
  getLayoutGeometryBounds,
  normalizeLayoutGeometry,
  normalizeRotation,
  snapToGrid,
} from './layout-grid'

const canvas = { width: 200, height: 120, gridSize: 10 }

describe('layout grid helpers', () => {
  it('snaps coordinates and normalizes rotation without clamping to the base canvas', () => {
    expect(snapToGrid(47, 20)).toBe(40)
    expect(normalizeRotation(-45)).toBe(315)
    expect(normalizeRotation(405)).toBe(45)
    expect(
      normalizeLayoutGeometry(
        { x: 230, y: -30, width: 80, height: 50, rotation: 361, zIndex: 1200 },
        canvas
      )
    ).toEqual({ x: 230, y: -30, width: 80, height: 50, rotation: 1, zIndex: 1000 })
  })

  it('uses the configured canvas as the minimum effective bounds', () => {
    expect(
      getEffectiveCanvasBounds(canvas, [
        { x: 20, y: 20, width: 80, height: 50, rotation: 0, zIndex: 0 },
      ])
    ).toEqual({ minX: 0, minY: 0, maxX: 200, maxY: 120 })
  })

  it('expands all breached edges with grid-aligned padding', () => {
    expect(
      getEffectiveCanvasBounds(canvas, [
        { x: -30, y: -20, width: 310, height: 180, rotation: 0, zIndex: 0 },
      ])
    ).toEqual({ minX: -110, minY: -100, maxX: 360, maxY: 240 })
  })

  it('accounts for rotation when calculating dynamic bounds', () => {
    const geometry = { x: 10, y: 10, width: 80, height: 20, rotation: 90, zIndex: 0 }

    const bounds = getLayoutGeometryBounds(geometry)
    expect(bounds.minX).toBeCloseTo(-10)
    expect(bounds.minY).toBeCloseTo(10)
    expect(bounds.maxX).toBeCloseTo(10)
    expect(bounds.maxY).toBeCloseTo(90)
    expect(getEffectiveCanvasBounds(canvas, [geometry]).minX).toBe(-90)
  })

  it('shrinks back to the configured minimum after the outlying object returns', () => {
    const outside = getEffectiveCanvasBounds(canvas, [
      { x: 210, y: 20, width: 40, height: 40, rotation: 0, zIndex: 0 },
    ])
    const inside = getEffectiveCanvasBounds(canvas, [
      { x: 140, y: 20, width: 40, height: 40, rotation: 0, zIndex: 0 },
    ])

    expect(outside.maxX).toBe(330)
    expect(inside).toEqual({ minX: 0, minY: 0, maxX: 200, maxY: 120 })
  })
})
