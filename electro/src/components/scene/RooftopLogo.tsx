import { useTexture } from '@react-three/drei'
import { BUILDING_CONSTANTS } from '../../data/buildingData'

export function RooftopLogo() {
  const texture = useTexture('/logos/ick.png')
  const width = BUILDING_CONSTANTS.BUILDING_WIDTH
  const depth = BUILDING_CONSTANTS.BUILDING_DEPTH

  return (
    <group position={[0, 2.45, depth / 2 + 0.36]}>
      <mesh position={[-2.5, -1.05, -0.04]} castShadow>
        <boxGeometry args={[0.08, 2.15, 0.08]} />
        <meshStandardMaterial color="#475569" metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[2.5, -1.05, -0.04]} castShadow>
        <boxGeometry args={[0.08, 2.15, 0.08]} />
        <meshStandardMaterial color="#475569" metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0, -0.08]} castShadow receiveShadow>
        <boxGeometry args={[Math.min(width * 0.46, 5.6), 1.75, 0.08]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.12} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <planeGeometry args={[Math.min(width * 0.42, 5.2), 1.45]} />
        <meshStandardMaterial map={texture} transparent alphaTest={0.08} roughness={0.35} />
      </mesh>
    </group>
  )
}
