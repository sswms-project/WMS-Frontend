import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WarehouseLayoutEditorScene } from '../../types/warehouse-layout-scene.types'
import { WarehouseCanvas } from './WarehouseCanvas'

const resizeObserverState = vi.hoisted(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  callback: undefined as
    | ((entries: Array<{ contentRect: { width: number; height: number } }>) => void)
    | undefined,
}))

interface MockKonvaNode {
  x: () => number
  y: () => number
  width: () => number
  height: () => number
  scaleX: (value?: number) => number
  scaleY: (value?: number) => number
  rotation: () => number
}

interface MockKonvaDragEvent {
  cancelBubble: boolean
  target: MockKonvaNode
}

const konvaMockState = vi.hoisted(() => ({
  stageNode: {
    x: () => 77,
    y: () => 88,
    width: () => 0,
    height: () => 0,
    scaleX: () => 1,
    scaleY: () => 1,
    rotation: () => 0,
  } as MockKonvaNode,
  stageDragEnd: undefined as ((event: MockKonvaDragEvent) => void) | undefined,
  groupDragEnds: [] as Array<{
    x?: number
    y?: number
    handler: (event: MockKonvaDragEvent) => void
  }>,
  groupInteractions: [] as Array<{
    x?: number
    y?: number
    dragMove?: (event: MockKonvaDragEvent) => void
    transform?: (event: MockKonvaDragEvent) => void
  }>,
}))

vi.mock('react-konva', async () => {
  const React = await import('react')

  return {
    Stage: ({
      ref,
      children,
      width,
      height,
      x,
      y,
      onDragEnd,
    }: {
      readonly ref?: React.Ref<MockKonvaNode>
      readonly children: React.ReactNode
      readonly width: number
      readonly height: number
      readonly x: number
      readonly y: number
      readonly onDragEnd: (event: MockKonvaDragEvent) => void
    }) => {
      React.useImperativeHandle(ref, () => konvaMockState.stageNode)
      konvaMockState.stageDragEnd = onDragEnd
      return (
        <div
          data-testid="konva-stage"
          data-width={width}
          data-height={height}
          data-x={x}
          data-y={y}
        >
          {children}
        </div>
      )
    },
    Layer: ({ children }: { readonly children: React.ReactNode }) => (
      <div data-testid="konva-layer">{children}</div>
    ),
    Group: ({
      children,
      x,
      y,
      onDragEnd,
      onDragMove,
      onTransform,
    }: {
      readonly children: React.ReactNode
      readonly x?: number
      readonly y?: number
      readonly onDragEnd?: (event: MockKonvaDragEvent) => void
      readonly onDragMove?: (event: MockKonvaDragEvent) => void
      readonly onTransform?: (event: MockKonvaDragEvent) => void
    }) => {
      if (onDragEnd) konvaMockState.groupDragEnds.push({ x, y, handler: onDragEnd })
      if (onDragMove || onTransform) {
        konvaMockState.groupInteractions.push({
          x,
          y,
          dragMove: onDragMove,
          transform: onTransform,
        })
      }
      return <div data-testid="konva-group">{children}</div>
    },
    Rect: ({
      name,
      fill,
      stroke,
      x,
      y,
      width,
      height,
    }: {
      readonly name?: string
      readonly fill?: string
      readonly stroke?: string
      readonly x?: number
      readonly y?: number
      readonly width?: number
      readonly height?: number
    }) => (
      <div
        data-testid="konva-rect"
        data-name={name}
        data-fill={fill}
        data-stroke={stroke}
        data-x={x}
        data-y={y}
        data-width={width}
        data-height={height}
      />
    ),
    Circle: () => <div data-testid="konva-circle" />,
    Line: () => <div data-testid="konva-line" />,
    Text: ({ text }: { readonly text: string }) => <span>{text}</span>,
    Transformer: () => <div data-testid="konva-transformer" />,
  }
})

const scene: WarehouseLayoutEditorScene = {
  canvas: { width: 1200, height: 800, gridSize: 20 },
  zones: [
    {
      id: 'zone-1',
      zoneCode: 'ZONE-A',
      zoneName: 'Khu A',
      status: 'Active',
      x: 40,
      y: 40,
      width: 520,
      height: 320,
      rotation: 0,
      zIndex: 0,
    },
  ],
  racks: [
    {
      id: 'rack-1',
      zoneId: 'zone-1',
      zoneCode: 'ZONE-A',
      rackCode: 'RACK-01',
      rackName: 'Kệ A-01',
      status: 'Active',
      x: 80,
      y: 100,
      width: 240,
      height: 120,
      rotation: 0,
      zIndex: 1,
    },
  ],
  slots: [
    {
      id: 'slot-vacant',
      zoneId: 'zone-1',
      rackId: 'rack-1',
      slotCode: 'SLOT-01',
      occupancyStatus: 'Vacant',
      isActive: true,
      capacity: 10,
      currentOccupancy: 0,
    },
    {
      id: 'slot-occupied',
      zoneId: 'zone-1',
      rackId: 'rack-1',
      slotCode: 'SLOT-02',
      occupancyStatus: 'Occupied',
      isActive: true,
      capacity: 10,
      currentOccupancy: 5,
    },
  ],
  decorations: [
    {
      id: '',
      clientKey: 'receiving-1',
      type: 'Receiving',
      label: 'Khu nhận hàng',
      x: 600,
      y: 80,
      width: 160,
      height: 100,
      rotation: 0,
      zIndex: 500,
    },
  ],
}

describe('WarehouseCanvas', () => {
  beforeEach(() => {
    resizeObserverState.observe.mockReset()
    resizeObserverState.disconnect.mockReset()
    resizeObserverState.callback = undefined
    konvaMockState.stageDragEnd = undefined
    konvaMockState.groupDragEnds = []
    konvaMockState.groupInteractions = []

    class ResizeObserverMock {
      constructor(
        callback: (entries: Array<{ contentRect: { width: number; height: number } }>) => void
      ) {
        resizeObserverState.callback = callback
      }

      observe = resizeObserverState.observe
      disconnect = resizeObserverState.disconnect
      unobserve = vi.fn()
    }

    Object.defineProperty(globalThis, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: ResizeObserverMock,
    })
    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      configurable: true,
      writable: true,
      value: (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0),
    })
    Object.defineProperty(globalThis, 'cancelAnimationFrame', {
      configurable: true,
      writable: true,
      value: (handle: number) => window.clearTimeout(handle),
    })
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 900,
      height: 600,
      top: 0,
      right: 900,
      bottom: 600,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    const rootStyle = document.documentElement.style
    rootStyle.setProperty('--background', '#f1fbec')
    rootStyle.setProperty('--foreground', '#18232f')
    rootStyle.setProperty('--muted', '#eaf7e2')
    rootStyle.setProperty('--muted-foreground', '#3f5442')
    rootStyle.setProperty('--border', '#b5d8ab')
    rootStyle.setProperty('--primary', '#2e5a2a')
    rootStyle.setProperty('--accent', '#c0f0c0')
    rootStyle.setProperty('--destructive', '#ba1a1a')
    rootStyle.setProperty('--card', '#ffffff')
    rootStyle.setProperty('--warning', '#9a5b00')
    rootStyle.setProperty('--warning-container', '#ffddb0')
  })

  it('measures the persistent container and renders the scene on first mount', async () => {
    render(
      <WarehouseCanvas
        scene={scene}
        selection={null}
        tool="select"
        canConfigure
        isGridVisible
        onSelect={vi.fn()}
        onGeometryChange={vi.fn()}
        onZoomChange={vi.fn()}
      />
    )

    const container = screen.getByRole('application')
    await waitFor(() => expect(resizeObserverState.observe).toHaveBeenCalledWith(container))

    const stage = await screen.findByTestId('konva-stage')
    expect(stage).toHaveAttribute('data-width', '900')
    expect(stage).toHaveAttribute('data-height', '600')
    expect(screen.getByText('ZONE-A')).toBeInTheDocument()
    expect(screen.getByText('RACK-01')).toBeInTheDocument()
    expect(screen.getByText('Khu nhận hàng')).toBeInTheDocument()
    expect(screen.getAllByTestId('konva-layer')).toHaveLength(5)
    expect(screen.getByText('Có hàng')).toBeInTheDocument()
    expect(document.querySelector('[data-name="slot:slot-vacant"]')).toHaveAttribute(
      'data-fill',
      '#ffffff'
    )
    expect(document.querySelector('[data-name="slot:slot-occupied"]')).toHaveAttribute(
      'data-fill',
      '#c0f0c0'
    )
  })

  it('uses the warning state and check mark for the selected slot', async () => {
    render(
      <WarehouseCanvas
        scene={scene}
        selection={{ kind: 'slot', id: 'slot-occupied' }}
        tool="select"
        canConfigure
        isGridVisible
        onSelect={vi.fn()}
        onGeometryChange={vi.fn()}
        onZoomChange={vi.fn()}
      />
    )

    await screen.findByTestId('konva-stage')
    expect(document.querySelector('[data-name="slot:slot-occupied"]')).toHaveAttribute(
      'data-fill',
      '#ffddb0'
    )
    expect(document.querySelector('[data-name="slot:slot-occupied"]')).toHaveAttribute(
      'data-stroke',
      '#9a5b00'
    )
  })

  it('hides an inactive Rack and its slots from the active canvas', async () => {
    render(
      <WarehouseCanvas
        scene={{
          ...scene,
          racks: scene.racks.map((rack) => ({ ...rack, status: 'Inactive' })),
        }}
        selection={null}
        tool="select"
        canConfigure
        isGridVisible
        onSelect={vi.fn()}
        onGeometryChange={vi.fn()}
        onZoomChange={vi.fn()}
      />
    )

    await screen.findByTestId('konva-stage')
    expect(document.querySelector('[data-name="rack:rack-1"]')).not.toBeInTheDocument()
    expect(document.querySelector('[data-name="slot:slot-vacant"]')).not.toBeInTheDocument()
  })

  it('expands the grid during drag and shrinks it when the object returns', async () => {
    render(
      <WarehouseCanvas
        scene={scene}
        selection={{ kind: 'zone', id: 'zone-1' }}
        tool="select"
        canConfigure
        isGridVisible
        onSelect={vi.fn()}
        onGeometryChange={vi.fn()}
        onZoomChange={vi.fn()}
      />
    )

    await screen.findByTestId('konva-stage')
    const zoneInteraction = konvaMockState.groupInteractions.find(
      (candidate) => candidate.x === 40 && candidate.y === 40
    )
    expect(zoneInteraction?.dragMove).toBeDefined()
    let x = -100
    const event: MockKonvaDragEvent = {
      cancelBubble: false,
      target: {
        x: () => x,
        y: () => 40,
        width: () => 520,
        height: () => 320,
        scaleX: () => 1,
        scaleY: () => 1,
        rotation: () => 0,
      },
    }

    await act(async () => {
      zoneInteraction?.dragMove?.(event)
      await new Promise((resolve) => window.setTimeout(resolve, 0))
    })
    expect(document.querySelector('[data-name="canvas-background"]')).toHaveAttribute(
      'data-x',
      '-180'
    )
    expect(document.querySelector('[data-name="canvas-background"]')).toHaveAttribute(
      'data-width',
      '1380'
    )

    x = 40
    await act(async () => {
      zoneInteraction?.dragMove?.(event)
      await new Promise((resolve) => window.setTimeout(resolve, 0))
    })
    expect(document.querySelector('[data-name="canvas-background"]')).toHaveAttribute('data-x', '0')
    expect(document.querySelector('[data-name="canvas-background"]')).toHaveAttribute(
      'data-width',
      '1200'
    )
  })

  it('renders custom colors without changing semantic slot colors', async () => {
    render(
      <WarehouseCanvas
        scene={{
          ...scene,
          zones: scene.zones.map((zone) => ({ ...zone, color: '#C7E8C0' })),
          racks: scene.racks.map((rack) => ({ ...rack, color: '#B9DDF2' })),
          decorations: scene.decorations.map((decoration) => ({
            ...decoration,
            color: '#FFE0A8',
          })),
        }}
        selection={null}
        tool="select"
        canConfigure
        isGridVisible
        onSelect={vi.fn()}
        onGeometryChange={vi.fn()}
        onZoomChange={vi.fn()}
      />
    )

    await screen.findByTestId('konva-stage')
    expect(document.querySelector('[data-name="zone:zone-1"]')).toHaveAttribute(
      'data-fill',
      '#C7E8C0'
    )
    expect(document.querySelector('[data-name="rack:rack-1"]')).toHaveAttribute(
      'data-fill',
      '#B9DDF2'
    )
    expect(document.querySelector('[data-name="decoration:receiving-1"]')).toHaveAttribute(
      'data-fill',
      '#FFE0A8'
    )
    expect(document.querySelector('[data-name="slot:slot-vacant"]')).toHaveAttribute(
      'data-fill',
      '#ffffff'
    )
  })

  it('does not treat a business object drag as a viewport drag', async () => {
    const onGeometryChange = vi.fn()
    render(
      <WarehouseCanvas
        scene={scene}
        selection={{ kind: 'zone', id: 'zone-1' }}
        tool="select"
        canConfigure
        isGridVisible
        onSelect={vi.fn()}
        onGeometryChange={onGeometryChange}
        onZoomChange={vi.fn()}
      />
    )

    const stage = await screen.findByTestId('konva-stage')
    const initialViewport = { x: stage.getAttribute('data-x'), y: stage.getAttribute('data-y') }
    const zoneDragEnd = konvaMockState.groupDragEnds.find(
      (candidate) => candidate.x === 40 && candidate.y === 40
    )?.handler
    expect(zoneDragEnd).toBeDefined()

    let scaleX = 1
    let scaleY = 1
    const event: MockKonvaDragEvent = {
      cancelBubble: false,
      target: {
        x: () => 260,
        y: () => 540,
        width: () => 520,
        height: () => 320,
        scaleX: (value) => {
          if (value !== undefined) scaleX = value
          return scaleX
        },
        scaleY: (value) => {
          if (value !== undefined) scaleY = value
          return scaleY
        },
        rotation: () => 0,
      },
    }

    act(() => zoneDragEnd?.(event))
    expect(event.cancelBubble).toBe(true)
    expect(onGeometryChange).toHaveBeenCalledOnce()
    expect(stage).toHaveAttribute('data-x', initialViewport.x)
    expect(stage).toHaveAttribute('data-y', initialViewport.y)
  })

  it('keeps the same world center when the canvas panel is resized', async () => {
    render(
      <WarehouseCanvas
        scene={scene}
        selection={null}
        tool="select"
        canConfigure
        isGridVisible
        onSelect={vi.fn()}
        onGeometryChange={vi.fn()}
        onZoomChange={vi.fn()}
      />
    )

    const stage = await screen.findByTestId('konva-stage')
    await waitFor(() => expect(stage.getAttribute('data-x')).not.toBe('0'))
    const initialX = Number(stage.getAttribute('data-x'))
    const initialY = Number(stage.getAttribute('data-y'))

    act(() => {
      resizeObserverState.callback?.([{ contentRect: { width: 700, height: 600 } }])
    })

    await waitFor(() => expect(stage).toHaveAttribute('data-width', '700'))
    expect(Number(stage.getAttribute('data-x'))).toBe(initialX - 100)
    expect(Number(stage.getAttribute('data-y'))).toBe(initialY)
  })
})
