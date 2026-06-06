import { create } from 'zustand'
import type { CameraTarget, NavigationLevel, ViewMode } from '../types'
import {
  buildingData,
  getDeviceById,
  getRoomById,
} from '../data/buildingData'

const DEFAULT_CAMERA: CameraTarget = {
  position: [28, 18, 28],
  lookAt: [0, 8, 0],
}

interface ShadowGridState {
  viewMode: ViewMode
  crossSectionEnabled: boolean
  crossSectionProgress: number
  floorMode: boolean
  navigationLevel: NavigationLevel

  selectedFloorId: string | null
  selectedRoomId: string | null
  selectedDeviceId: string | null
  selectedWindowId: string | null

  cameraTarget: CameraTarget
  cameraAnimating: boolean
  resetCameraTrigger: number

  setViewMode: (mode: ViewMode) => void
  toggleCrossSection: () => void
  setCrossSectionProgress: (progress: number) => void
  setFloorMode: (enabled: boolean) => void

  selectWindow: (windowId: string, floorId: string) => void
  selectFloor: (floorId: string) => void
  selectRoom: (roomId: string) => void
  selectDevice: (deviceId: string) => void

  enterFloor: () => void
  navigateTo: (level: NavigationLevel, id?: string) => void
  resetCamera: () => void
  flyTo: (target: CameraTarget) => void
  setCameraAnimating: (animating: boolean) => void

  getSelectedFloor: () => (typeof buildingData.floors)[0] | undefined
  getSelectedRoom: () => ReturnType<typeof import('../data/buildingData').getRoomById>
  getSelectedDevice: () => ReturnType<typeof import('../data/buildingData').getDeviceById>
}

function floorCameraTarget(floorId: string): CameraTarget {
  const floor = buildingData.floors.find((f) => f.id === floorId)
  if (!floor) return DEFAULT_CAMERA
  const y = floor.yOffset + floor.height / 2
  return {
    position: [14, y + 4, 14],
    lookAt: [0, y, 0],
  }
}

function roomCameraTarget(roomId: string): CameraTarget {
  const result = buildingData.floors
    .flatMap((f) => f.rooms.map((r) => ({ room: r, floor: f })))
    .find(({ room }) => room.id === roomId)
  if (!result) return DEFAULT_CAMERA
  const { room, floor } = result
  const y = floor.yOffset + 1.6
  return {
    position: [room.position[0] + 3, y + 2, room.position[2] + 4],
    lookAt: [room.position[0], y, room.position[2]],
  }
}

function deviceCameraTarget(deviceId: string): CameraTarget {
  const result = buildingData.floors
    .flatMap((f) =>
      f.rooms.flatMap((r) =>
        r.devices.map((d) => ({ device: d, room: r, floor: f })),
      ),
    )
    .find(({ device }) => device.id === deviceId)
  if (!result) return DEFAULT_CAMERA
  const { device, room, floor } = result
  const y = floor.yOffset + device.position[1]
  const pos: [number, number, number] = [
    room.position[0] + device.position[0],
    y,
    room.position[2] + device.position[2],
  ]
  return {
    position: [pos[0] + 2, pos[1] + 1.5, pos[2] + 2.5],
    lookAt: pos,
  }
}

function windowCameraTarget(floorId: string): CameraTarget {
  const floor = buildingData.floors.find((f) => f.id === floorId)
  if (!floor) return DEFAULT_CAMERA
  const y = floor.yOffset + floor.height / 2
  return {
    position: [12, y + 2, 8],
    lookAt: [0, y, 2],
  }
}

export const useShadowGridStore = create<ShadowGridState>((set, get) => ({
  viewMode: 'exterior',
  crossSectionEnabled: false,
  crossSectionProgress: 0,
  floorMode: false,
  navigationLevel: 'building',

  selectedFloorId: null,
  selectedRoomId: null,
  selectedDeviceId: null,
  selectedWindowId: null,

  cameraTarget: DEFAULT_CAMERA,
  cameraAnimating: false,
  resetCameraTrigger: 0,

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleCrossSection: () =>
    set((s) => ({
      crossSectionEnabled: !s.crossSectionEnabled,
    })),

  setCrossSectionProgress: (progress) => set({ crossSectionProgress: progress }),

  setFloorMode: (enabled) => set({ floorMode: enabled }),

  selectWindow: (windowId, floorId) => {
    set({
      selectedWindowId: windowId,
      selectedFloorId: floorId,
      selectedRoomId: null,
      selectedDeviceId: null,
      navigationLevel: 'floor',
      cameraTarget: windowCameraTarget(floorId),
      cameraAnimating: true,
    })
  },

  selectFloor: (floorId) => {
    set({
      selectedFloorId: floorId,
      selectedRoomId: null,
      selectedDeviceId: null,
      selectedWindowId: null,
      navigationLevel: 'floor',
      cameraTarget: floorCameraTarget(floorId),
      cameraAnimating: true,
    })
  },

  selectRoom: (roomId) => {
    set({
      selectedRoomId: roomId,
      selectedDeviceId: null,
      navigationLevel: 'room',
      cameraTarget: roomCameraTarget(roomId),
      cameraAnimating: true,
    })
  },

  selectDevice: (deviceId) => {
    set({
      selectedDeviceId: deviceId,
      navigationLevel: 'device',
      cameraTarget: deviceCameraTarget(deviceId),
      cameraAnimating: true,
    })
  },

  enterFloor: () => {
    const { selectedFloorId } = get()
    if (!selectedFloorId) return
    set({
      floorMode: true,
      viewMode: 'interior',
      cameraTarget: floorCameraTarget(selectedFloorId),
      cameraAnimating: true,
    })
  },

  navigateTo: (level, id) => {
    switch (level) {
      case 'building':
        set({
          navigationLevel: 'building',
          selectedFloorId: null,
          selectedRoomId: null,
          selectedDeviceId: null,
          selectedWindowId: null,
          floorMode: false,
          viewMode: 'exterior',
          cameraTarget: DEFAULT_CAMERA,
          cameraAnimating: true,
        })
        break
      case 'floor':
        if (id) {
          set({
            navigationLevel: 'floor',
            selectedFloorId: id,
            selectedRoomId: null,
            selectedDeviceId: null,
            selectedWindowId: null,
            floorMode: false,
            viewMode: 'exterior',
            cameraTarget: floorCameraTarget(id),
            cameraAnimating: true,
          })
        }
        break
      case 'room':
        if (id) {
          const result = buildingData.floors
            .flatMap((f) => f.rooms.map((r) => ({ room: r, floor: f })))
            .find(({ room }) => room.id === id)
          set({
            navigationLevel: 'room',
            selectedRoomId: id,
            selectedDeviceId: null,
            selectedFloorId: result?.floor.id ?? null,
            floorMode: true,
            viewMode: 'interior',
            cameraTarget: roomCameraTarget(id),
            cameraAnimating: true,
          })
        }
        break
      case 'device':
        if (id) {
          const result = buildingData.floors
            .flatMap((f) =>
              f.rooms.flatMap((r) =>
                r.devices.map((d) => ({ device: d, room: r, floor: f })),
              ),
            )
            .find(({ device }) => device.id === id)
          set({
            navigationLevel: 'device',
            selectedDeviceId: id,
            selectedRoomId: result?.room.id ?? null,
            selectedFloorId: result?.floor.id ?? null,
            floorMode: true,
            viewMode: 'interior',
            cameraTarget: deviceCameraTarget(id),
            cameraAnimating: true,
          })
        }
        break
    }
  },

  resetCamera: () =>
    set((s) => ({
      cameraTarget: DEFAULT_CAMERA,
      cameraAnimating: true,
      resetCameraTrigger: s.resetCameraTrigger + 1,
    })),

  flyTo: (target) => set({ cameraTarget: target, cameraAnimating: true }),

  setCameraAnimating: (animating) => set({ cameraAnimating: animating }),

  getSelectedFloor: () => {
    const { selectedFloorId } = get()
    return selectedFloorId
      ? buildingData.floors.find((f) => f.id === selectedFloorId)
      : undefined
  },

  getSelectedRoom: () => {
    const { selectedRoomId } = get()
    if (!selectedRoomId) return null
    return getRoomById(selectedRoomId)
  },

  getSelectedDevice: () => {
    const { selectedDeviceId } = get()
    if (!selectedDeviceId) return null
    return getDeviceById(selectedDeviceId)
  },
}))

export { DEFAULT_CAMERA }
