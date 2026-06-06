import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { WindowData } from '../../types'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { useClippingProps } from './CrossSectionManager'

interface WindowMeshProps {
  window: WindowData
  floorId: string
  hidden?: boolean
}

export function WindowMesh({ window, floorId, hidden }: WindowMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const selectedWindowId = useShadowGridStore((s) => s.selectedWindowId)
  const selectWindow = useShadowGridStore((s) => s.selectWindow)
  const clippingProps = useClippingProps()

  const isSelected = selectedWindowId === window.id

  useFrame(({ clock }) => {
    if (meshRef.current && (isSelected || hovered)) {
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial
      mat.emissiveIntensity = 0.3 + Math.sin(clock.elapsedTime * 3) * 0.15
    }
  })

  if (hidden) return null

  const [w, h] = window.size
  const rotation =
    window.face === 'front'
      ? [0, 0, 0]
      : window.face === 'back'
        ? [0, Math.PI, 0]
        : window.face === 'left'
          ? [0, Math.PI / 2, 0]
          : [0, -Math.PI / 2, 0]

  return (
    <mesh
      ref={meshRef}
      position={window.position}
      rotation={rotation as [number, number, number]}
      onClick={(e) => {
        e.stopPropagation()
        selectWindow(window.id, floorId)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      <planeGeometry args={[w, h]} />
      <meshPhysicalMaterial
        color={isSelected ? '#7dd3fc' : '#1e3a5f'}
        emissive={isSelected || hovered ? '#38bdf8' : '#0ea5e9'}
        emissiveIntensity={isSelected ? 0.6 : hovered ? 0.3 : 0.08}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={isSelected ? 0.85 : 0.55}
        transmission={0.4}
        thickness={0.1}
        {...clippingProps}
      />
    </mesh>
  )
}
