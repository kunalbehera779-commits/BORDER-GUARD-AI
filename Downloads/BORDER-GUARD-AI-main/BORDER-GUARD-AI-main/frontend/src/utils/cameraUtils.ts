import type { CameraFeed } from '../types'

/**
 * Sort cameras so user connected/uploaded streams (file, webcam, rtsp)
 * are prioritized to Channel 01, Channel 02, etc.
 */
export function sortCamerasPrioritized(cameras: CameraFeed[]): CameraFeed[] {
  return [...cameras].sort((a, b) => {
    const isUserSource = (c: CameraFeed) =>
      c.streamType === 'file' ||
      c.streamType === 'webcam' ||
      c.streamType === 'rtsp' ||
      c.streamType === 'mjpeg' ||
      c.status === 'online'

    const aUser = isUserSource(a) ? 1 : 0
    const bUser = isUserSource(b) ? 1 : 0

    if (aUser !== bUser) {
      return bUser - aUser // Active connected cameras first
    }

    // Secondary priority: MP4 file upload > Webcam > RTSP > Default
    const typePriority = (c: CameraFeed) => {
      if (c.streamType === 'file') return 1
      if (c.streamType === 'webcam') return 2
      if (c.streamType === 'rtsp') return 3
      return 4
    }

    const pA = typePriority(a)
    const pB = typePriority(b)
    if (pA !== pB) return pA - pB

    return a.id.localeCompare(b.id)
  })
}

export interface ChannelSlot {
  slotId: string
  slotLabel: string
  camera: CameraFeed | null
}

/**
 * Map cameras into 4 fixed border channels.
 * Prioritized cameras fill Channel 01..Channel 04 first.
 */
export function mapCamerasTo4Channels(cameras: CameraFeed[]): ChannelSlot[] {
  const sorted = sortCamerasPrioritized(cameras)
  const slots = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04']

  return slots.map((slotId, index) => {
    const camera = sorted[index] || null
    return {
      slotId,
      slotLabel: `Channel 0${index + 1}`,
      camera,
    }
  })
}
