import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BUILDING_CONSTANTS } from '../../data/buildingData'

export function GridConnection() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <group position={BUILDING_CONSTANTS.GRID_POSITION}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.2, 2, 0.8]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.8}
          roughness={0.3}
          emissive="#fbbf24"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight color="#fbbf24" intensity={2} distance={8} />
    </group>
  )
}
