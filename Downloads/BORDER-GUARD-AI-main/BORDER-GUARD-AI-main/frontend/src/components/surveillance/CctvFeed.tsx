import { forwardRef } from 'react'
import { LiveStreamCanvas } from '../cameras/LiveStreamCanvas'
import type { BoundingBox, CameraFeed } from '../../types'

type CctvFeedProps = {
  camera: CameraFeed
  now: Date
  paused: boolean
  muted: boolean
  showOverlays: boolean
  boxes: BoundingBox[]
  active?: boolean
  activeTrackId?: string
  compact?: boolean
}

export const CctvFeed = forwardRef<HTMLDivElement, CctvFeedProps>(function CctvFeed(
  { camera, compact = false },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`cctv-frame surv-feed ${compact ? 'is-compact' : ''}`}
      style={{ overflow: 'hidden', position: 'relative', borderRadius: '6px' }}
    >
      <LiveStreamCanvas
        cameraId={camera.id}
        cameraName={`${camera.id} ${camera.name}`}
        streamType={camera.streamType || camera.feedType?.toLowerCase()}
        streamUrl={camera.streamUrl}
      />
    </div>
  )
})
