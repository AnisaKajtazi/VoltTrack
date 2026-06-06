import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import { buildingData, BUILDING_CONSTANTS, getFloorPanelPosition } from '../../data/buildingData'
import { useShadowGridStore } from '../../store/useShadowGridStore'
import { getPowerFlowColor } from '../../utils/energyUtils'

interface EnergyPath {
  id: string
  curve: THREE.CatmullRomCurve3
  power: number
  isActive: boolean
  color: string
  level: 'grid' | 'panel' | 'floor' | 'room' | 'device'
  health?: number
}

interface ParticleSystemProps {
  path: EnergyPath
  particleCount: number
  dimmed: boolean
}

function ParticleSystem({ path, particleCount, dimmed }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const progressRef = useRef<Float32Array>(
    new Float32Array(particleCount).map(() => Math.random()),
  )

  const geometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [particleCount])

  const speed = 0.18 + (path.power / 3000) * 0.55
  const size = 0.06 + (path.power / 2000) * 0.14

  useFrame((_, delta) => {
    if (!pointsRef.current || !path.isActive) return

    const positions = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const progress = progressRef.current

    for (let i = 0; i < particleCount; i++) {
      progress[i] = (progress[i] + delta * speed) % 1
      const point = path.curve.getPoint(progress[i])
      positions.setXYZ(i, point.x, point.y, point.z)
    }
    positions.needsUpdate = true
  })

  const opacity = dimmed
    ? 0.06
    : path.isActive
      ? 0.75 + (path.power / 3000) * 0.25
      : 0.1

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={size}
        color={path.color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function DirectionArrow({ path, dimmed }: { path: EnergyPath; dimmed: boolean }) {
  const arrowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!arrowRef.current || !path.isActive || dimmed) return
    const t = (clock.elapsedTime * (0.25 + path.power / 4000)) % 1
    const point = path.curve.getPoint(t)
    const tangent = path.curve.getTangent(t).normalize()
    arrowRef.current.position.copy(point)
    arrowRef.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      tangent,
    )
  })

  if (!path.isActive) return null

  return (
    <mesh ref={arrowRef}>
      <coneGeometry args={[0.06, 0.18, 6]} />
      <meshBasicMaterial
        color={path.color}
        transparent
        opacity={dimmed ? 0.1 : 0.85}
      />
    </mesh>
  )
}

function EnergyLine({ path, dimmed }: { path: EnergyPath; dimmed: boolean }) {
  const points = useMemo(() => path.curve.getPoints(64), [path.curve])
  const opacityRef = useRef(path.isActive ? 0.45 : 0.08)

  useFrame(({ clock }) => {
    if (path.isActive && !dimmed) {
      opacityRef.current =
        0.25 + (path.power / 3000) * 0.45 + Math.sin(clock.elapsedTime * 3) * 0.12
    } else {
      opacityRef.current = dimmed ? 0.05 : 0.08
    }
  })

  return (
    <Line
      points={points}
      color={path.color}
      transparent
      opacity={path.isActive ? opacityRef.current : dimmed ? 0.04 : 0.08}
      lineWidth={path.level === 'grid' || path.level === 'panel' ? 2 : 1}
    />
  )
}

function FlowLabel({
  position,
  text,
  color,
  visible,
}: {
  position: THREE.Vector3
  text: string
  color: string
  visible: boolean
}) {
  if (!visible) return null

  return (
    <Text
      position={[position.x, position.y + 0.4, position.z]}
      fontSize={0.14}
      color={color}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.015}
      outlineColor="#0a0e17"
    >
      {text}
    </Text>
  )
}

export function EnergyFlow() {
  const selectedRoomId = useShadowGridStore((s) => s.selectedRoomId)
  const selectedFloorId = useShadowGridStore((s) => s.selectedFloorId)
  const selectedDeviceId = useShadowGridStore((s) => s.selectedDeviceId)
  const navigationLevel = useShadowGridStore((s) => s.navigationLevel)

  const paths = useMemo(() => {
    const result: EnergyPath[] = []
    const grid = new THREE.Vector3(...BUILDING_CONSTANTS.GRID_POSITION)
    const panel = new THREE.Vector3(...BUILDING_CONSTANTS.MAIN_PANEL_POSITION)

    // Grid → Main Power Source
    result.push({
      id: 'grid-to-panel',
      curve: new THREE.CatmullRomCurve3([
        grid,
        new THREE.Vector3(0, 4, 4),
        new THREE.Vector3(0, 10, 2),
        panel,
      ]),
      power: 5000,
      isActive: true,
      color: '#fbbf24',
      level: 'grid',
    })

    for (const floor of buildingData.floors) {
      const floorPanel = new THREE.Vector3(...getFloorPanelPosition(floor.yOffset))
      const floorPower = floor.energyConsumption * 200

      // Main Panel → Floor Distribution Panel
      result.push({
        id: `panel-to-floor-panel-${floor.id}`,
        curve: new THREE.CatmullRomCurve3([
          panel,
          new THREE.Vector3(
            floorPanel.x + 1.5,
            (panel.y + floorPanel.y) / 2,
            floorPanel.z + 1,
          ),
          floorPanel,
        ]),
        power: floorPower,
        isActive: true,
        color: getPowerFlowColor(floorPower, true),
        level: 'panel',
      })

      for (const room of floor.rooms) {
        const roomPos = new THREE.Vector3(
          room.position[0],
          floor.yOffset + 1.5,
          room.position[2],
        )

        const roomPower = room.devices
          .filter((d) => d.status === 'on')
          .reduce((s, d) => s + d.powerUsage, 0)

        const roomHealth = Math.min(...room.devices.map((d) => d.health))

        // Floor Panel → Room
        result.push({
          id: `floor-panel-to-${room.id}`,
          curve: new THREE.CatmullRomCurve3([
            floorPanel,
            new THREE.Vector3(
              (floorPanel.x + roomPos.x) / 2,
              floorPanel.y,
              (floorPanel.z + roomPos.z) / 2,
            ),
            roomPos,
          ]),
          power: roomPower,
          isActive: roomPower > 0,
          color: getPowerFlowColor(roomPower, roomPower > 0, roomHealth),
          level: 'room',
          health: roomHealth,
        })

        for (const device of room.devices) {
          if (device.type === 'plant' || device.type === 'switch') continue

          const devicePos = new THREE.Vector3(
            room.position[0] + device.position[0],
            floorYOffset(floor.yOffset, device.position[1]),
            room.position[2] + device.position[2],
          )

          result.push({
            id: `room-to-${device.id}`,
            curve: new THREE.CatmullRomCurve3([
              roomPos,
              new THREE.Vector3(
                (roomPos.x + devicePos.x) / 2,
                (roomPos.y + devicePos.y) / 2 + 0.2,
                (roomPos.z + devicePos.z) / 2,
              ),
              devicePos,
            ]),
            power: device.powerUsage,
            isActive: device.status === 'on',
            color: getPowerFlowColor(
              device.powerUsage,
              device.status === 'on',
              device.health,
            ),
            level: 'device',
            health: device.health,
          })
        }
      }
    }

    return result
  }, [])

  const focusActive =
    navigationLevel === 'room' ||
    navigationLevel === 'device' ||
    selectedRoomId !== null

  function isPathRelated(path: EnergyPath): boolean {
    if (!focusActive) return true
    if (path.level === 'grid') return true

    if (selectedDeviceId && path.id === `room-to-${selectedDeviceId}`) return true

    if (selectedRoomId) {
      if (path.id.includes(selectedRoomId)) return true
      if (
        path.level === 'device' &&
        path.id.startsWith('room-to-') &&
        buildingData.floors.some((f) =>
          f.rooms.some(
            (r) =>
              r.id === selectedRoomId &&
              r.devices.some((d) => path.id === `room-to-${d.id}`),
          ),
        )
      ) {
        return true
      }
      const roomFloor = buildingData.floors.find((f) =>
        f.rooms.some((r) => r.id === selectedRoomId),
      )
      if (roomFloor && path.id.includes(roomFloor.id)) return true
    }

    if (selectedFloorId && path.id.includes(selectedFloorId)) return true

    return path.level === 'panel'
  }

  return (
    <group>
      {paths.map((path) => {
        const isRelated = isPathRelated(path)
        const dimmed = focusActive && !isRelated

        const count = Math.max(
          4,
          Math.min(
            35,
            Math.floor(6 + (path.power / 400) * (path.isActive && !dimmed ? 1 : 0.15)),
          ),
        )

        return (
          <group key={path.id}>
            <EnergyLine path={path} dimmed={dimmed} />
            <ParticleSystem path={path} particleCount={count} dimmed={dimmed} />
            {(path.level === 'grid' || path.level === 'panel') && (
              <DirectionArrow path={path} dimmed={dimmed} />
            )}
          </group>
        )
      })}

      <FlowLabel
        position={new THREE.Vector3(...BUILDING_CONSTANTS.GRID_POSITION)}
        text="Main Power Source"
        color="#fbbf24"
        visible={!focusActive || navigationLevel === 'building'}
      />
      <FlowLabel
        position={new THREE.Vector3(...BUILDING_CONSTANTS.MAIN_PANEL_POSITION)}
        text="Main Distribution Panel"
        color="#38bdf8"
        visible
      />
    </group>
  )
}

function floorYOffset(floorY: number, deviceY: number): number {
  return floorY + deviceY
}
