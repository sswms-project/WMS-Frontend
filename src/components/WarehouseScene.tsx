'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { CSSProperties } from 'react'

/*
 * Decorative CSS-3D warehouse, "prism" edition: glossy neon sphere, frosted
 * glass rack, neon-edged crates and a scanning light sweep. Purely visual —
 * the whole scene is aria-hidden and every color derives from theme tokens
 * (mint / neon / deep-green family) so it follows the landing palette.
 */

type CrateTone = 'deep' | 'mint' | 'neon'

const crateFaceColors: Record<CrateTone, { top: string; front: string; side: string }> = {
  deep: {
    top: 'color-mix(in oklab, var(--primary) 58%, white)',
    front: 'color-mix(in oklab, var(--primary) 82%, white)',
    side: 'var(--primary)',
  },
  mint: {
    top: 'color-mix(in oklab, var(--secondary-container) 55%, white)',
    front: 'color-mix(in oklab, var(--secondary-container) 90%, var(--primary))',
    side: 'color-mix(in oklab, var(--secondary-container) 55%, var(--primary))',
  },
  neon: {
    top: 'color-mix(in oklab, var(--primary-container) 45%, white)',
    front: 'var(--primary-container)',
    side: 'color-mix(in oklab, var(--primary-container) 55%, var(--primary))',
  },
}

const glassEdge = '1px solid color-mix(in oklab, white 55%, transparent)'
const neonGlow = '0 0 22px color-mix(in oklab, var(--primary-container) 55%, transparent)'

function crateFaceStyle(size: number, transform: string, background: string): CSSProperties {
  return {
    position: 'absolute',
    width: size,
    height: size,
    transform,
    background,
    border: glassEdge,
    borderRadius: 6,
    backfaceVisibility: 'hidden',
  }
}

function Crate({
  size,
  x,
  y,
  z,
  tone,
  floating = false,
}: {
  size: number
  x: number
  y: number
  z: number
  tone: CrateTone
  floating?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const half = size / 2
  const colors = crateFaceColors[tone]

  const faces = (
    <>
      <div style={crateFaceStyle(size, `translateZ(${half}px)`, colors.front)} />
      <div style={crateFaceStyle(size, `rotateY(90deg) translateZ(${half}px)`, colors.side)} />
      <div style={crateFaceStyle(size, `rotateY(-90deg) translateZ(${half}px)`, colors.side)} />
      <div style={crateFaceStyle(size, `rotateY(180deg) translateZ(${half}px)`, colors.front)} />
      <div style={crateFaceStyle(size, `rotateX(90deg) translateZ(${half}px)`, colors.top)} />
    </>
  )

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: size,
        height: size,
        margin: -half,
        transform: `translate3d(${x}px, ${y}px, ${z}px)`,
        transformStyle: 'preserve-3d',
        filter: tone === 'neon' ? `drop-shadow(${neonGlow})` : undefined,
      }}
    >
      {floating ? (
        <motion.div
          style={{ width: size, height: size, transformStyle: 'preserve-3d' }}
          animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {faces}
        </motion.div>
      ) : (
        faces
      )}
    </div>
  )
}

/* Frosted-glass shelf / side panel of the storage rack */
function glassPanelStyle(width: number, height: number, transform: string): CSSProperties {
  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width,
    height,
    margin: `${-height / 2}px 0 0 ${-width / 2}px`,
    transform,
    background:
      'linear-gradient(135deg, color-mix(in oklab, white 62%, transparent), color-mix(in oklab, var(--secondary-container) 38%, transparent))',
    border: glassEdge,
    borderRadius: 10,
    boxShadow: 'inset 0 0 24px color-mix(in oklab, white 35%, transparent)',
  }
}

export function WarehouseScene() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div aria-hidden="true" className="relative h-[420px] w-full [perspective:1300px]">
      {/* Glossy neon sphere backdrop, outside the 3D rotation so it stays round */}
      <motion.div
        className="absolute top-2 right-6 size-44 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 32% 26%, var(--on-primary) 0%, var(--primary-container) 22%, color-mix(in oklab, var(--primary-container) 78%, var(--primary)) 55%, var(--primary) 100%)',
          boxShadow: neonGlow,
        }}
        animate={prefersReducedMotion ? undefined : { y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Specular streak */}
        <div
          className="absolute top-[14%] left-[20%] h-[26%] w-[14%] rounded-full"
          style={{
            background:
              'linear-gradient(160deg, color-mix(in oklab, white 95%, transparent), transparent)',
            filter: 'blur(2px)',
          }}
        />
      </motion.div>

      <div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-22deg) rotateY(-32deg)' }}
      >
        {/* Floor: frosted glass slab with neon grid */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 460,
            height: 340,
            margin: '-170px 0 0 -230px',
            transform: 'translateY(150px) rotateX(90deg)',
            background:
              'linear-gradient(color-mix(in oklab, var(--primary-container) 32%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--primary-container) 32%, transparent) 1px, transparent 1px), linear-gradient(135deg, color-mix(in oklab, white 55%, transparent), color-mix(in oklab, var(--secondary-container) 30%, transparent))',
            backgroundSize: '46px 46px, 46px 46px, auto',
            border: glassEdge,
            borderRadius: 18,
            boxShadow: 'inset 0 0 40px color-mix(in oklab, white 40%, transparent)',
          }}
        />

        {/* Storage rack: frosted side panels + shelves */}
        <div style={glassPanelStyle(96, 190, 'translate3d(-228px, -28px, -60px) rotateY(90deg)')} />
        <div style={glassPanelStyle(96, 190, 'translate3d(-4px, -28px, -60px) rotateY(90deg)')} />
        <div style={glassPanelStyle(230, 96, 'translate3d(-115px, 62px, -60px) rotateX(90deg)')} />
        <div style={glassPanelStyle(230, 96, 'translate3d(-115px, -20px, -60px) rotateX(90deg)')} />

        {/* Scan beam sweeping vertically across the rack */}
        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 250,
            height: 96,
            margin: '-48px 0 0 -125px',
            transform: 'translate3d(-115px, 70px, -60px) rotateX(90deg)',
            background:
              'linear-gradient(color-mix(in oklab, var(--primary-container) 45%, transparent), transparent)',
            borderTop: '2px solid var(--primary-container)',
            borderRadius: 10,
            filter: 'blur(0.5px)',
            transformStyle: 'preserve-3d',
          }}
          animate={
            prefersReducedMotion ? undefined : { y: [0, -130, 0], opacity: [0.9, 0.35, 0.9] }
          }
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Crates on the rack shelves */}
        <Crate size={40} x={-170} y={36} z={-60} tone="mint" />
        <Crate size={36} x={-70} y={38} z={-52} tone="neon" />
        <Crate size={38} x={-120} y={-46} z={-60} tone="mint" />

        {/* Crates stacked on the floor */}
        <Crate size={68} x={110} y={112} z={30} tone="deep" />
        <Crate size={52} x={104} y={52} z={26} tone="mint" />
        <Crate size={56} x={10} y={118} z={90} tone="mint" />

        {/* Floating neon crate with pulsing landing pad */}
        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 96,
            height: 66,
            margin: '-33px 0 0 -48px',
            transform: 'translate3d(28px, 149px, 95px) rotateX(90deg)',
            background:
              'radial-gradient(closest-side, color-mix(in oklab, var(--primary-container) 55%, transparent), transparent)',
            filter: 'blur(5px)',
          }}
          animate={prefersReducedMotion ? undefined : { opacity: [0.9, 0.45, 0.9] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Crate size={46} x={28} y={16} z={95} tone="neon" floating />
      </div>
    </div>
  )
}
