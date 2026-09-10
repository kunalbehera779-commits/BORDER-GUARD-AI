import type { BoundingBox, CameraFeed, DetectionFilter } from '../../types'

export function filterBoxes(boxes: BoundingBox[], filter: DetectionFilter): BoundingBox[] {
  if (filter === 'all') return boxes
  return boxes.filter((box) => box.kind === filter)
}

export function cameraMatchesFilter(
  camera: CameraFeed,
  filter: 'all' | 'online' | 'offline' | 'critical' | 'ai-active',
  criticalCameraIds: Set<string>,
): boolean {
  if (filter === 'online') return camera.status === 'online'
  if (filter === 'offline') return camera.status === 'offline'
  if (filter === 'ai-active') return camera.aiStatus === 'active'
  if (filter === 'critical') return criticalCameraIds.has(camera.id)
  return true
}

export function signalLabel(quality: number): string {
  if (quality >= 90) return 'Strong'
  if (quality >= 75) return 'Stable'
  if (quality >= 50) return 'Weak'
  return 'Poor'
}
