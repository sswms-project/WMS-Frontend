'use client'

import { ContactShadows, Float, RoundedBox } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import * as THREE from 'three'

/*
 * Real-3D warehouse hero (Three.js via React Three Fiber): lit crates on a
 * soft mint floor, a storage rack, a glossy lime sphere and a scanning light
 * sweep. The composition is rotated toward the hero copy on the left and the
 * edges are masked so the scene melts into the page background. Colors are
 * raw hex because WebGL materials cannot read CSS custom properties — values
 * mirror the landing palette in index.css.
 */
const BRAND = {
  deep: '#0e3d28',
  deepSoft: '#2e5a2a',
  lime: '#c0f24d',
  limeDim: '#a4d63e',
  mint: '#cfeec6',
  mintSoft: '#e0f4d6',
  gridLine: '#c3e2b8',
  white: '#f9fff6',
} as const

/* Turns the whole composition toward the hero copy on the left */
const BASE_ROTATION_Y = 0.5

function Crate({
  position,
  size = 1,
  color = BRAND.mint,
  lime = false,
}: {
  position: [number, number, number]
  size?: number
  color?: string
  lime?: boolean
}) {
  return (
    <RoundedBox args={[size, size, size]} radius={0.05} position={position} castShadow>
      {lime ? (
        <meshStandardMaterial
          color={BRAND.lime}
          emissive={BRAND.limeDim}
          emissiveIntensity={0.35}
          roughness={0.3}
        />
      ) : (
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.08} />
      )}
    </RoundedBox>
  )
}

function StorageRack() {
  const postPositions: [number, number][] = [
    [-1.7, -0.55],
    [-1.7, 0.55],
    [1.7, -0.55],
    [1.7, 0.55],
  ]
  return (
    <group position={[-2.1, 0, -1.6]}>
      {postPositions.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 1.5, z]} castShadow>
          <boxGeometry args={[0.12, 3, 0.12]} />
          <meshStandardMaterial color={BRAND.deep} roughness={0.35} metalness={0.45} />
        </mesh>
      ))}
      {[1.05, 2.1].map((shelfY) => (
        <mesh key={shelfY} position={[0, shelfY, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.55, 0.1, 1.25]} />
          <meshStandardMaterial color={BRAND.deep} roughness={0.4} metalness={0.35} />
        </mesh>
      ))}
      {/* Crates resting on the shelves */}
      <Crate position={[-1.05, 1.44, 0]} size={0.66} />
      <Crate position={[0.15, 1.42, 0.1]} size={0.6} lime />
      <Crate position={[1.1, 2.48, -0.05]} size={0.64} color={BRAND.mintSoft} />
      <Crate position={[-0.6, 0.34, 0.15]} size={0.68} color={BRAND.mintSoft} />
    </group>
  )
}

function ScanBeam({ animate }: { animate: boolean }) {
  const beamRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!animate || !beamRef.current) return
    const t = (Math.sin(clock.elapsedTime * 0.9) + 1) / 2
    beamRef.current.position.y = 0.25 + t * 2.4
    const material = beamRef.current.material as THREE.MeshBasicMaterial
    material.opacity = 0.18 + t * 0.2
  })
  return (
    <mesh ref={beamRef} position={[-2.1, 1.2, -1.6]}>
      <boxGeometry args={[3.8, 0.02, 1.45]} />
      <meshBasicMaterial color={BRAND.lime} transparent opacity={0.3} toneMapped={false} />
    </mesh>
  )
}

function LimeSphere({ animate }: { animate: boolean }) {
  return (
    <Float
      speed={animate ? 1.4 : 0}
      rotationIntensity={0.2}
      floatIntensity={animate ? 0.9 : 0}
      position={[2.7, 2.9, -3]}
    >
      <mesh castShadow>
        <sphereGeometry args={[0.85, 48, 48]} />
        <meshPhysicalMaterial
          color={BRAND.lime}
          emissive={BRAND.limeDim}
          emissiveIntensity={0.15}
          roughness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  )
}

/* Slow camera drift so the scene feels alive even without pointer input */
function CameraRig({ animate }: { animate: boolean }) {
  useFrame(({ camera, clock }) => {
    if (!animate) return
    const t = clock.elapsedTime
    camera.position.x = 6.4 + Math.sin(t * 0.16) * 0.4
    camera.position.y = 4.6 + Math.sin(t * 0.12) * 0.25
    camera.lookAt(0, 1.05, 0)
  })
  return null
}

function WarehouseGroup({ animate }: { animate: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame(({ pointer }) => {
    if (!animate || !groupRef.current) return
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      BASE_ROTATION_Y + pointer.x * 0.22,
      0.045
    )
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -pointer.y * 0.08,
      0.045
    )
  })

  return (
    <group ref={groupRef} rotation={[0, BASE_ROTATION_Y, 0]}>
      {/* Floor kept close to the page background so the scene blends in */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color={BRAND.mintSoft} roughness={0.95} />
      </mesh>
      <gridHelper args={[14, 22, BRAND.limeDim, BRAND.gridLine]} position={[0, 0.001, 0]} />

      <StorageRack />
      <ScanBeam animate={animate} />
      <LimeSphere animate={animate} />

      {/* Floor crates */}
      <Crate position={[1.6, 0.5, 0.6]} size={1} color={BRAND.deepSoft} />
      <Crate position={[1.5, 1.32, 0.55]} size={0.64} />
      <Crate position={[0.2, 0.42, 1.7]} size={0.84} />

      {/* Floating lime crate */}
      <Float
        speed={animate ? 1.8 : 0}
        rotationIntensity={0.25}
        floatIntensity={animate ? 1.2 : 0}
        position={[2.9, 1.5, 1.4]}
      >
        <Crate position={[0, 0, 0]} size={0.72} lime />
      </Float>

      <ContactShadows position={[0, 0.002, 0]} opacity={0.28} scale={13} blur={2.6} far={4.2} />
    </group>
  )
}

export function WarehouseScene3D() {
  const prefersReducedMotion = useReducedMotion()
  const animate = !prefersReducedMotion

  return (
    <div
      aria-hidden="true"
      className="h-[440px] w-full [mask-image:radial-gradient(115%_95%_at_50%_42%,black_58%,transparent_96%)]"
    >
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.75]}
        camera={{ position: [6.4, 4.6, 8.2], fov: 34 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={animate ? 'always' : 'demand'}
        onCreated={({ camera }) => camera.lookAt(0, 1.05, 0)}
      >
        <ambientLight intensity={0.9} color={BRAND.white} />
        <directionalLight
          position={[6, 9, 5]}
          intensity={1.3}
          color={BRAND.white}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[2.4, 3.4, -1.2]} intensity={9} color={BRAND.lime} distance={7} />
        <CameraRig animate={animate} />
        <WarehouseGroup animate={animate} />
      </Canvas>
    </div>
  )
}
