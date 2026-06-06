import type { Building, Device, Room, WindowData } from '../types'

const FLOOR_HEIGHT = 4
const BUILDING_WIDTH = 16
const BUILDING_DEPTH = 10

function createDevice(
  id: string,
  name: string,
  type: string,
  powerUsage: number,
  status: 'on' | 'off',
  health: number,
  position: [number, number, number],
): Device {
  const hours = status === 'on' ? 8 + Math.random() * 4 : 0
  return {
    id,
    name,
    type,
    powerUsage,
    status,
    health,
    position,
    dailyUsage: Math.round(powerUsage * hours * 10) / 10,
    estimatedCost: Math.round(powerUsage * hours * 0.12 * 100) / 100,
  }
}

function createRoom(
  id: string,
  name: string,
  area: number,
  w: number,
  d: number,
  occupancy: number,
  energy: number,
  position: [number, number, number],
  color: string,
  devices: Device[],
): Room {
  return {
    id,
    name,
    area,
    dimensions: { width: w, depth: d, height: 3.2 },
    occupancy,
    energyUsage: energy,
    position,
    color,
    devices,
  }
}

function generateWindows(floorId: string, yOffset: number): WindowData[] {
  const windows: WindowData[] = []
  const faces: Array<{ face: WindowData['face']; x: number; z: number; rot: number }> = [
    { face: 'front', x: 0, z: BUILDING_DEPTH / 2 + 0.02, rot: 0 },
    { face: 'back', x: 0, z: -BUILDING_DEPTH / 2 - 0.02, rot: Math.PI },
    { face: 'left', x: -BUILDING_WIDTH / 2 - 0.02, z: 0, rot: Math.PI / 2 },
    { face: 'right', x: BUILDING_WIDTH / 2 + 0.02, z: 0, rot: -Math.PI / 2 },
  ]

  faces.forEach(({ face, x, z }) => {
    for (let col = 0; col < 4; col++) {
      const wx = x === 0 ? -6 + col * 4 : x
      const wz = z === 0 ? -3 + col * 2.5 : z
      windows.push({
        id: `${floorId}-win-${face}-${col}`,
        floorId,
        position: [wx, yOffset + 2, wz],
        size: [1.8, 1.4],
        face,
      })
    }
  })

  return windows
}

// Floor 1: clean 2×2 matrix with central corridors (NW, NE, SW, SE)
const FLOOR1_ROOM_W = 6.9
const FLOOR1_ROOM_D = 3.9
const FLOOR1_ROOM_X = 4.05
const FLOOR1_ROOM_Z = 2.55

const floor1Rooms: Room[] = [
  // Room 1 — NW: Meeting Room
  createRoom(
    'room-meeting',
    'Meeting Room',
    42,
    FLOOR1_ROOM_W,
    FLOOR1_ROOM_D,
    8,
    3.2,
    [-FLOOR1_ROOM_X, FLOOR_HEIGHT * 0 + 0.1, FLOOR1_ROOM_Z],
    '#3b82f6',
    [
      createDevice('dev-mr-light1', 'Ceiling Panel A', 'light', 45, 'on', 98, [-1.5, 3.0, 1.0]),
      createDevice('dev-mr-light2', 'Ceiling Panel B', 'light', 45, 'on', 95, [1.5, 3.0, 1.0]),
      createDevice('dev-mr-hvac', 'Mini Split HVAC', 'hvac', 850, 'on', 92, [2.9, 2.5, -1.2]),
      createDevice('dev-mr-monitor', 'Presentation Display', 'monitor', 120, 'on', 88, [0, 1.4, 1.6]),
      createDevice('dev-mr-switch', 'Light Switch', 'switch', 2, 'on', 100, [2.9, 1.2, 0.3]),
      createDevice('dev-mr-outlet1', 'Power Outlet A', 'outlet', 8, 'on', 99, [-2.4, 0.45, 1.6]),
      createDevice('dev-mr-outlet2', 'Power Outlet B', 'outlet', 8, 'on', 99, [2.4, 0.45, -1.6]),
      createDevice('dev-mr-plant', 'Corner Plant', 'plant', 0, 'on', 100, [-2.5, 0.55, -1.2]),
    ],
  ),
  // Room 2 — NE: Work Area
  createRoom(
    'room-work',
    'Work Area',
    68,
    FLOOR1_ROOM_W,
    FLOOR1_ROOM_D,
    24,
    5.8,
    [FLOOR1_ROOM_X, FLOOR_HEIGHT * 0 + 0.1, FLOOR1_ROOM_Z],
    '#6366f1',
    [
      createDevice('dev-wa-pc1', 'Workstation Alpha', 'computer', 180, 'on', 94, [-2.2, 0.85, 0.2]),
      createDevice('dev-wa-mon1', 'Monitor Alpha', 'monitor', 35, 'on', 96, [-2.2, 1.15, -0.05]),
      createDevice('dev-wa-pc2', 'Workstation Beta', 'computer', 165, 'on', 91, [0, 0.85, 0.2]),
      createDevice('dev-wa-mon2', 'Monitor Beta', 'monitor', 32, 'on', 93, [0, 1.15, -0.05]),
      createDevice('dev-wa-pc3', 'Workstation Gamma', 'computer', 175, 'off', 87, [2.2, 0.85, 0.2]),
      createDevice('dev-wa-mon3', 'Monitor Gamma', 'monitor', 30, 'off', 90, [2.2, 1.15, -0.05]),
      createDevice('dev-wa-light', 'Open Office Lighting', 'light', 220, 'on', 96, [0, 3.0, 0]),
      createDevice('dev-wa-hvac', 'Zone HVAC', 'hvac', 680, 'on', 93, [-2.9, 2.5, -1.2]),
      createDevice('dev-wa-charger', 'USB-C Charging Hub', 'charger', 65, 'on', 99, [0.8, 0.5, 0.7]),
      createDevice('dev-wa-printer', 'Network Printer', 'printer', 45, 'on', 94, [2.4, 0.6, -1.3]),
      createDevice('dev-wa-plant', 'Desk Plant', 'plant', 0, 'on', 100, [-1, 0.55, 0.9]),
      createDevice('dev-wa-switch', 'Light Switch', 'switch', 2, 'on', 100, [-2.9, 1.2, 1.3]),
      createDevice('dev-wa-outlet', 'Power Outlet', 'outlet', 12, 'on', 99, [2.9, 0.45, 1.3]),
    ],
  ),
  // Room 3 — SW: Kitchen
  createRoom(
    'room-kitchen',
    'Kitchen',
    28,
    FLOOR1_ROOM_W,
    FLOOR1_ROOM_D,
    4,
    2.1,
    [-FLOOR1_ROOM_X, FLOOR_HEIGHT * 0 + 0.1, -FLOOR1_ROOM_Z],
    '#14b8a6',
    [
      createDevice('dev-k-fridge', 'Smart Refrigerator', 'appliance', 150, 'on', 97, [-2.0, 1.05, 1.2]),
      createDevice('dev-k-microwave', 'Microwave', 'appliance', 1100, 'off', 90, [1.5, 1.2, 1.2]),
      createDevice('dev-k-light', 'Kitchen Spotlights', 'light', 80, 'on', 93, [0, 3.0, 0]),
      createDevice('dev-k-switch', 'Light Switch', 'switch', 2, 'on', 100, [-2.9, 1.1, 0]),
      createDevice('dev-k-outlet', 'Power Outlet', 'outlet', 10, 'on', 99, [2.5, 0.5, -1.2]),
      createDevice('dev-k-plant', 'Herb Planter', 'plant', 0, 'on', 100, [0.5, 0.55, -1.2]),
    ],
  ),
  // Room 4 — SE: Office B
  createRoom(
    'room-office-b',
    'Office B',
    55,
    FLOOR1_ROOM_W,
    FLOOR1_ROOM_D,
    12,
    4.5,
    [FLOOR1_ROOM_X, FLOOR_HEIGHT * 0 + 0.1, -FLOOR1_ROOM_Z],
    '#8b5cf6',
    [
      createDevice('dev-ob-pc1', 'Executive Workstation', 'computer', 200, 'on', 96, [-1.8, 0.85, -0.4]),
      createDevice('dev-ob-mon1', 'Executive Monitor', 'monitor', 40, 'on', 95, [-1.8, 1.15, -0.65]),
      createDevice('dev-ob-pc2', 'Analyst Workstation', 'computer', 170, 'on', 89, [1.8, 0.85, -0.4]),
      createDevice('dev-ob-mon2', 'Analyst Monitor', 'monitor', 35, 'on', 91, [1.8, 1.15, -0.65]),
      createDevice('dev-ob-hvac', 'Zone HVAC', 'hvac', 720, 'on', 94, [2.9, 2.5, 1.2]),
      createDevice('dev-ob-light', 'Office Lighting Grid', 'light', 180, 'on', 97, [0, 3.0, 0]),
      createDevice('dev-ob-meter', 'Smart Energy Meter', 'meter', 5, 'on', 100, [-2.5, 1.5, 1.4]),
      createDevice('dev-ob-printer', 'Office Printer', 'printer', 50, 'on', 92, [0, 0.6, 1.4]),
      createDevice('dev-ob-plant', 'Office Plant', 'plant', 0, 'on', 100, [2.0, 0.55, -1.1]),
      createDevice('dev-ob-switch', 'Light Switch', 'switch', 2, 'on', 100, [-2.9, 1.2, -1.2]),
      createDevice('dev-ob-outlet', 'Power Outlet', 'outlet', 10, 'on', 99, [2.9, 0.45, -1.2]),
    ],
  ),
]

const floor2Rooms: Room[] = [
  createRoom(
    'room-reception',
    'Reception',
    38,
    4,
    4,
    6,
    2.8,
    [-3, FLOOR_HEIGHT * 1 + 0.1, 1],
    '#ec4899',
    [
      createDevice('dev-rc-light', 'Reception Lighting', 'light', 120, 'on', 95, [0, 2.9, 0]),
      createDevice('dev-rc-display', 'Welcome Display', 'monitor', 85, 'on', 92, [1, 1.2, 1.5]),
      createDevice('dev-rc-switch', 'Light Switch', 'switch', 2, 'on', 100, [1.8, 1.2, 0]),
      createDevice('dev-rc-outlet', 'Power Outlet', 'outlet', 8, 'on', 99, [-1.5, 0.45, 1.5]),
      createDevice('dev-rc-plant', 'Reception Plant', 'plant', 0, 'on', 100, [-1, 0.55, -1]),
    ],
  ),
  createRoom(
    'room-open-office',
    'Open Office',
    90,
    8,
    5,
    32,
    7.2,
    [1, FLOOR_HEIGHT * 1 + 0.1, -1],
    '#0ea5e9',
    [
      createDevice('dev-oo-pc1', 'Desk Cluster A', 'computer', 160, 'on', 93, [-2, 0.85, -1.5]),
      createDevice('dev-oo-mon1', 'Monitor A', 'monitor', 32, 'on', 94, [-2, 1.15, -1.75]),
      createDevice('dev-oo-pc2', 'Desk Cluster B', 'computer', 155, 'on', 90, [0, 0.85, -1.5]),
      createDevice('dev-oo-mon2', 'Monitor B', 'monitor', 30, 'on', 92, [0, 1.15, -1.75]),
      createDevice('dev-oo-pc3', 'Desk Cluster C', 'computer', 168, 'on', 88, [2, 0.85, -1.5]),
      createDevice('dev-oo-mon3', 'Monitor C', 'monitor', 32, 'on', 90, [2, 1.15, -1.75]),
      createDevice('dev-oo-light', 'LED Panel Array', 'light', 340, 'on', 96, [0, 2.9, 0]),
      createDevice('dev-oo-hvac', 'Central HVAC Unit', 'hvac', 1200, 'on', 91, [3.5, 2.5, 1.8]),
      createDevice('dev-oo-printer', 'Shared Printer', 'printer', 55, 'on', 93, [3, 0.6, 1.8]),
      createDevice('dev-oo-outlet', 'Power Outlet', 'outlet', 15, 'on', 99, [-3.5, 0.45, 1.8]),
    ],
  ),
  createRoom(
    'room-server',
    'Server Room',
    22,
    3,
    3.5,
    2,
    8.5,
    [-5, FLOOR_HEIGHT * 1 + 0.1, -2.5],
    '#ef4444',
    [
      createDevice('dev-srv-rack1', 'Server Rack A', 'server', 2400, 'on', 88, [-0.8, 1.5, 0]),
      createDevice('dev-srv-rack2', 'Server Rack B', 'server', 2200, 'on', 85, [0.8, 1.5, 0]),
      createDevice('dev-srv-cooling', 'Precision Cooling', 'hvac', 1800, 'on', 94, [0, 2.8, 1.2]),
      createDevice('dev-srv-ups', 'UPS System', 'meter', 450, 'on', 97, [0.5, 0.5, -1.2]),
      createDevice('dev-srv-outlet', 'PDU Outlet', 'outlet', 20, 'on', 98, [-1, 0.4, 1.2]),
    ],
  ),
]

const floor3Rooms: Room[] = [
  createRoom(
    'room-exec',
    'Executive Suite',
    48,
    5,
    4,
    4,
    3.5,
    [-3, FLOOR_HEIGHT * 2 + 0.1, 0],
    '#a855f7',
    [
      createDevice('dev-ex-pc', 'Executive PC', 'computer', 220, 'on', 98, [-1, 0.85, 0]),
      createDevice('dev-ex-mon', 'Executive Monitor', 'monitor', 42, 'on', 97, [-1, 1.15, -0.25]),
      createDevice('dev-ex-light', 'Ambient Lighting', 'light', 90, 'on', 96, [0, 2.9, 0]),
      createDevice('dev-ex-hvac', 'Premium HVAC', 'hvac', 680, 'on', 95, [2, 2.8, 1.5]),
      createDevice('dev-ex-printer', 'Executive Printer', 'printer', 40, 'on', 94, [1.5, 0.6, -1.2]),
      createDevice('dev-ex-plant', 'Office Plant', 'plant', 0, 'on', 100, [1, 0.55, 1]),
      createDevice('dev-ex-switch', 'Light Switch', 'switch', 2, 'on', 100, [2.3, 1.2, 0]),
    ],
  ),
  createRoom(
    'room-conf-a',
    'Conference A',
    52,
    5,
    4.5,
    16,
    4.1,
    [2.5, FLOOR_HEIGHT * 2 + 0.1, 0],
    '#06b6d4',
    [
      createDevice('dev-ca-light', 'Conference Lighting', 'light', 200, 'on', 94, [0, 2.9, 0]),
      createDevice('dev-ca-av', 'AV System', 'monitor', 350, 'on', 91, [1.8, 1.5, 1.8]),
      createDevice('dev-ca-hvac', 'Zone HVAC', 'hvac', 900, 'on', 93, [-1.5, 2.8, -1.8]),
      createDevice('dev-ca-outlet', 'Power Outlet', 'outlet', 12, 'on', 99, [2.2, 0.45, -1.8]),
      createDevice('dev-ca-plant', 'Corner Plant', 'plant', 0, 'on', 100, [-1.5, 0.55, 1.5]),
    ],
  ),
  createRoom(
    'room-lounge',
    'Employee Lounge',
    35,
    4,
    3.5,
    8,
    2.4,
    [-1, FLOOR_HEIGHT * 2 + 0.1, -2.5],
    '#22c55e',
    [
      createDevice('dev-lg-fridge', 'Beverage Fridge', 'appliance', 120, 'on', 96, [-1, 1.05, 1]),
      createDevice('dev-lg-light', 'Lounge Lighting', 'light', 100, 'on', 97, [0, 2.9, 0]),
      createDevice('dev-lg-tv', 'Lounge Display', 'monitor', 140, 'on', 89, [1, 1.5, 1.5]),
      createDevice('dev-lg-microwave', 'Lounge Microwave', 'appliance', 900, 'off', 88, [0.5, 1.2, -1]),
      createDevice('dev-lg-plant', 'Lounge Plant', 'plant', 0, 'on', 100, [-1.2, 0.55, -1]),
    ],
  ),
]

const mechanicalRooms: Room[] = [
  createRoom(
    'room-electrical',
    'Main Electrical Panel',
    30,
    4,
    3,
    1,
    12.5,
    [0, FLOOR_HEIGHT * 3 + 0.1, 0],
    '#f59e0b',
    [
      createDevice('dev-main-panel', 'Main Electrical Panel', 'meter', 0, 'on', 100, [0, 1.8, 0]),
      createDevice('dev-transformer', 'Power Transformer', 'meter', 850, 'on', 98, [-2, 1.5, 0]),
      createDevice('dev-grid-meter', 'Grid Smart Meter', 'meter', 15, 'on', 100, [2, 1.5, 0]),
    ],
  ),
  createRoom(
    'room-hvac-plant',
    'HVAC Plant',
    40,
    5,
    4,
    0,
    9.8,
    [-4, FLOOR_HEIGHT * 3 + 0.1, -2],
    '#64748b',
    [
      createDevice('dev-chiller', 'Central Chiller', 'hvac', 3500, 'on', 87, [-4.5, 1.2, -2]),
      createDevice('dev-boiler', 'Boiler System', 'hvac', 2800, 'on', 85, [-3, 1.2, -2]),
      createDevice('dev-ahu', 'Air Handling Unit', 'hvac', 1600, 'on', 90, [-4, 2.5, 0]),
    ],
  ),
]

export const buildingData: Building = {
  id: 'building-shadowgrid-hq',
  name: 'ShadowGrid HQ',
  width: BUILDING_WIDTH,
  depth: BUILDING_DEPTH,
  floors: [
    {
      id: 'floor-1',
      number: 1,
      name: 'Floor 1',
      area: 320,
      occupancy: 48,
      energyConsumption: 15.6,
      roomCount: 4,
      hvacStatus: 'optimal',
      electricalStatus: 'normal',
      maintenanceStatus: 'good',
      yOffset: 0,
      height: FLOOR_HEIGHT,
      rooms: floor1Rooms,
      windows: generateWindows('floor-1', 0),
    },
    {
      id: 'floor-2',
      number: 2,
      name: 'Floor 2',
      area: 320,
      occupancy: 40,
      energyConsumption: 22.4,
      roomCount: 3,
      hvacStatus: 'optimal',
      electricalStatus: 'elevated',
      maintenanceStatus: 'good',
      yOffset: FLOOR_HEIGHT,
      height: FLOOR_HEIGHT,
      rooms: floor2Rooms,
      windows: generateWindows('floor-2', FLOOR_HEIGHT),
    },
    {
      id: 'floor-3',
      number: 3,
      name: 'Floor 3',
      area: 320,
      occupancy: 28,
      energyConsumption: 10.2,
      roomCount: 3,
      hvacStatus: 'warning',
      electricalStatus: 'normal',
      maintenanceStatus: 'scheduled',
      yOffset: FLOOR_HEIGHT * 2,
      height: FLOOR_HEIGHT,
      rooms: floor3Rooms,
      windows: generateWindows('floor-3', FLOOR_HEIGHT * 2),
    },
    {
      id: 'floor-mechanical',
      number: 4,
      name: 'Mechanical Floor',
      area: 320,
      occupancy: 1,
      energyConsumption: 28.8,
      roomCount: 2,
      hvacStatus: 'optimal',
      electricalStatus: 'elevated',
      maintenanceStatus: 'good',
      yOffset: FLOOR_HEIGHT * 3,
      height: FLOOR_HEIGHT,
      rooms: mechanicalRooms,
      windows: generateWindows('floor-mechanical', FLOOR_HEIGHT * 3),
    },
  ],
}

export const BUILDING_CONSTANTS = {
  FLOOR_HEIGHT,
  BUILDING_WIDTH,
  BUILDING_DEPTH,
  TOTAL_HEIGHT: FLOOR_HEIGHT * 4,
  GRID_POSITION: [0, -1, BUILDING_DEPTH / 2 + 6] as [number, number, number],
  MAIN_PANEL_POSITION: [0, FLOOR_HEIGHT * 3 + 1.8, 0] as [number, number, number],
  CORRIDOR_WIDTH: 1.2,
  FLOOR1_ROOM_W,
  FLOOR1_ROOM_D,
}

export function getFloorPanelPosition(floorYOffset: number): [number, number, number] {
  return [0, floorYOffset + 2.2, 0]
}

export function getFloorById(id: string) {
  return buildingData.floors.find((f) => f.id === id)
}

export function getRoomById(id: string) {
  for (const floor of buildingData.floors) {
    const room = floor.rooms.find((r) => r.id === id)
    if (room) return { room, floor }
  }
  return null
}

export function getDeviceById(id: string) {
  for (const floor of buildingData.floors) {
    for (const room of floor.rooms) {
      const device = room.devices.find((d) => d.id === id)
      if (device) return { device, room, floor }
    }
  }
  return null
}

export function getTotalBuildingEnergy(): number {
  return buildingData.floors.reduce((sum, f) => sum + f.energyConsumption, 0)
}

export function getActiveDevicePower(): number {
  let total = 0
  for (const floor of buildingData.floors) {
    for (const room of floor.rooms) {
      for (const device of room.devices) {
        if (device.status === 'on') total += device.powerUsage
      }
    }
  }
  return total
}
