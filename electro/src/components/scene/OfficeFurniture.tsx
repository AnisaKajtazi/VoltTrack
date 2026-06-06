import type { Room } from '../../types'

interface OfficeFurnitureProps {
  room: Room
}

const WOOD = '#8b7355'
const METAL = '#64748b'
const FABRIC = '#334155'
const GLASS = '#94a3b8'

function Desk({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.06, 0.7]} />
        <meshStandardMaterial color={WOOD} roughness={0.65} metalness={0.1} />
      </mesh>
      {[[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.19, lz]} castShadow>
          <boxGeometry args={[0.06, 0.38, 0.06]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function Chair({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.45, 0.08, 0.45]} />
        <meshStandardMaterial color={FABRIC} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.55, -0.18]} castShadow>
        <boxGeometry args={[0.45, 0.55, 0.06]} />
        <meshStandardMaterial color={FABRIC} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.24, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

function ConferenceTable({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.08, 1.2]} />
        <meshStandardMaterial color={WOOD} roughness={0.5} metalness={0.15} />
      </mesh>
      {[[-1.1, -0.4], [1.1, -0.4], [-1.1, 0.4], [1.1, 0.4]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.2, lz]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function KitchenCounter({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.08, 0.6]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[2.5, 0.44, 0.55]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
    </group>
  )
}

function CeilingLightPanel({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 1.55, z]}>
      <boxGeometry args={[0.8, 0.04, 0.8]} />
      <meshStandardMaterial
        color="#f8fafc"
        emissive="#fbbf24"
        emissiveIntensity={0.35}
        roughness={0.2}
      />
    </mesh>
  )
}

function WallACUnit({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <mesh position={[x, y, z]} castShadow>
      <boxGeometry args={[0.9, 0.35, 0.25]} />
      <meshStandardMaterial color="#e2e8f0" metalness={0.5} roughness={0.4} />
    </mesh>
  )
}

function PlantPot({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.24, 10]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.8} />
      </mesh>
    </group>
  )
}

function PrinterUnit({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.25, z]} castShadow>
      <boxGeometry args={[0.45, 0.35, 0.4]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.5} />
    </mesh>
  )
}

function MeetingRoomFurniture({ room }: { room: Room }) {
  const hw = room.dimensions.width / 2
  const hd = room.dimensions.depth / 2
  return (
    <>
      <ConferenceTable x={0} z={-0.3} />
      {[[-1.2, 0.8], [1.2, 0.8], [-1.2, -1.2], [1.2, -1.2], [0, 1.2]].map(([x, z], i) => (
        <Chair key={i} x={x} z={z} rotation={z > 0 ? Math.PI : 0} />
      ))}
      <CeilingLightPanel x={-1.5} z={1} />
      <CeilingLightPanel x={1.5} z={1} />
      <WallACUnit x={hw - 0.15} y={0.8} z={-1.2} />
      <mesh position={[0, 0.9, hd - 0.1]}>
        <boxGeometry args={[1.8, 1.0, 0.06]} />
        <meshPhysicalMaterial
          color="#1e293b"
          metalness={0.8}
          roughness={0.2}
          clearcoat={0.5}
        />
      </mesh>
      <PlantPot x={-2.5} z={-1.2} />
    </>
  )
}

function WorkAreaFurniture({ room }: { room: Room }) {
  const hw = room.dimensions.width / 2
  return (
    <>
      <Desk x={-2.2} z={0.2} />
      <Desk x={0} z={0.2} />
      <Desk x={2.2} z={0.2} />
      <Chair x={-2.2} z={0.9} rotation={Math.PI} />
      <Chair x={0} z={0.9} rotation={Math.PI} />
      <Chair x={2.2} z={0.9} rotation={Math.PI} />
      <CeilingLightPanel x={0} z={0} />
      <WallACUnit x={-hw + 0.15} y={0.8} z={-1.2} />
      <PrinterUnit x={2.4} z={-1.3} />
      <PlantPot x={-1} z={0.9} />
    </>
  )
}

function KitchenFurniture({ room }: { room: Room }) {
  const hw = room.dimensions.width / 2
  return (
    <>
      <KitchenCounter x={0.5} z={1.2} />
      <mesh position={[-2, 0.9, 1.2]} castShadow>
        <boxGeometry args={[0.7, 1.8, 0.65]} />
        <meshStandardMaterial color={METAL} metalness={0.6} roughness={0.35} />
      </mesh>
      <CeilingLightPanel x={0} z={0} />
      <PlantPot x={0.5} z={-1.2} />
      <mesh position={[hw - 0.08, 0.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1.5, 1.2, 0.04]} />
        <meshPhysicalMaterial
          color={GLASS}
          transparent
          opacity={0.25}
          transmission={0.6}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[room.dimensions.width - 0.2, 0.02, room.dimensions.depth - 0.2]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} metalness={0.05} />
      </mesh>
    </>
  )
}

function OfficeBFurniture({ room }: { room: Room }) {
  const hw = room.dimensions.width / 2
  return (
    <>
      <Desk x={-1.8} z={-0.4} />
      <Desk x={1.8} z={-0.4} />
      <Chair x={-1.8} z={0.3} rotation={Math.PI} />
      <Chair x={1.8} z={0.3} rotation={Math.PI} />
      <CeilingLightPanel x={0} z={0} />
      <WallACUnit x={hw - 0.15} y={0.8} z={1.2} />
      <PrinterUnit x={0} z={1.4} />
      <PlantPot x={2} z={-1.1} />
      <mesh position={[-2.5, 1.0, 1.4]} castShadow>
        <boxGeometry args={[0.25, 0.5, 0.12]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.2} metalness={0.7} />
      </mesh>
    </>
  )
}

function GenericOfficeFurniture({ room }: { room: Room }) {
  const count = Math.min(3, room.devices.filter((d) => d.type === 'computer').length || 2)
  const spacing = Math.min(2.2, (room.dimensions.width - 2) / Math.max(count, 1))
  const start = -((count - 1) * spacing) / 2

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x = start + i * spacing
        return (
          <group key={i}>
            <Desk x={x} z={0} />
            <Chair x={x} z={0.7} rotation={Math.PI} />
          </group>
        )
      })}
      <CeilingLightPanel x={0} z={0} />
    </>
  )
}

export function OfficeFurniture({ room }: OfficeFurnitureProps) {
  const { height } = room.dimensions
  const floorY = -height / 2 + 0.05

  return (
    <group position={[0, floorY, 0]}>
      {room.id === 'room-meeting' && <MeetingRoomFurniture room={room} />}
      {room.id === 'room-work' && <WorkAreaFurniture room={room} />}
      {room.id === 'room-kitchen' && <KitchenFurniture room={room} />}
      {room.id === 'room-office-b' && <OfficeBFurniture room={room} />}
      {!['room-meeting', 'room-work', 'room-kitchen', 'room-office-b'].includes(room.id) && (
        <GenericOfficeFurniture room={room} />
      )}
    </group>
  )
}
