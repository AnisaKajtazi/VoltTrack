export type DeviceType =
  | 'light'
  | 'computer'
  | 'monitor'
  | 'hvac'
  | 'charger'
  | 'meter'
  | 'appliance'
  | 'server'
  | 'outlet'
  | 'switch'
  | 'printer'
  | 'plant'

export interface Device {
  id: string
  name: string
  type: DeviceType | string
  powerUsage: number
  status: 'on' | 'off'
  health: number
  /** Local offset from room center [x, y, z] */
  position: [number, number, number]
  dailyUsage: number
  estimatedCost: number
}

export interface Room {
  id: string
  name: string
  area: number
  dimensions: { width: number; depth: number; height: number }
  occupancy: number
  energyUsage: number
  position: [number, number, number]
  color: string
  devices: Device[]
}

export interface WindowData {
  id: string
  floorId: string
  position: [number, number, number]
  size: [number, number]
  face: 'front' | 'back' | 'left' | 'right'
}

export interface Floor {
  id: string
  number: number
  name: string
  area: number
  occupancy: number
  energyConsumption: number
  roomCount: number
  hvacStatus: 'optimal' | 'warning' | 'critical'
  electricalStatus: 'normal' | 'elevated' | 'overload'
  maintenanceStatus: 'good' | 'scheduled' | 'urgent'
  yOffset: number
  height: number
  rooms: Room[]
  windows: WindowData[]
}

export interface Building {
  id: string
  name: string
  width: number
  depth: number
  floors: Floor[]
}

export type ViewMode = 'exterior' | 'interior'
export type NavigationLevel = 'building' | 'floor' | 'room' | 'device'

export interface CameraTarget {
  position: [number, number, number]
  lookAt: [number, number, number]
}

export interface BreadcrumbItem {
  id: string
  label: string
  level: NavigationLevel
}
