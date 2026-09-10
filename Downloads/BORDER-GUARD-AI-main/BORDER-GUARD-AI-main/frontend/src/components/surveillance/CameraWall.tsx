import type { Ref } from 'react'
import type { BoundingBox, CameraFeed, GridLayoutMode } from '../../types'
import { CctvFeed } from './CctvFeed'
import { SurveillanceCameraCard } from './SurveillanceCameraCard'
import { CameraOff } from 'lucide-react'

type CameraWallProps = {
  cameras: CameraFeed[]
  selectedId: string
  now: Date
  paused: boolean
  muted: boolean
  showOverlays: boolean
  layout: GridLayoutMode
  boxesFor: (camera: CameraFeed) => BoundingBox[]
  activeEventId: string | null
  activeTrackId?: string
  onSelect: (camera: CameraFeed) => void
  selectedFeedRef: Ref<HTMLDivElement>
}

export function CameraWall({
  cameras,
  selectedId,
  now,
  paused,
  muted,
  showOverlays,
  layout,
  boxesFor,
  activeEventId,
  activeTrackId,
  onSelect,
  selectedFeedRef,
}: CameraWallProps) {
  if (cameras.length === 0) {
    return (
      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: '#040812',
        borderRadius: '8px',
        border: '1px dashed #1e2d4a',
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        <CameraOff size={42} style={{ color: '#475569' }} />
        <div>
          <strong style={{ color: '#e2e8f0', fontSize: '1.1rem', display: 'block' }}>
            No Active Cameras in Surveillance Wall
          </strong>
          <span style={{ fontSize: '0.85rem' }}>
            Use the top banner to connect your RTSP camera feed, USB webcam, or upload an MP4 video file for AI perimeter scanning.
          </span>
        </div>
      </div>
    )
  }

  const selected = cameras.find((camera) => camera.id === selectedId) ?? cameras[0]
  const others = cameras.filter((camera) => camera.id !== selected.id)

  if (layout === 'focus' && selected) {
    return (
      <div className="surv-wall is-focus">
        <SurveillanceCameraCard
          camera={selected}
          now={now}
          selected
          paused={paused}
          muted={muted}
          showOverlays={showOverlays}
          boxes={boxesFor(selected)}
          active={activeEventId === 'EVT-4404'}
          activeTrackId={activeTrackId}
          onSelect={onSelect}
          feedRef={selectedFeedRef}
        />
        <div className="surv-thumbs">
          {others.map((camera) => (
            <button
              key={camera.id}
              type="button"
              className="surv-thumb"
              onClick={() => onSelect(camera)}
            >
              <CctvFeed
                camera={camera}
                now={now}
                paused={paused}
                muted={muted}
                showOverlays={showOverlays}
                boxes={boxesFor(camera)}
                active={activeEventId === 'EVT-4404' && camera.id === 'CAM-02'}
                activeTrackId={activeTrackId}
                compact
              />
              <span className="mono">{camera.id}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`surv-wall is-${layout}`}>
      {cameras.map((camera) => (
        <SurveillanceCameraCard
          key={camera.id}
          camera={camera}
          now={now}
          selected={camera.id === selectedId}
          paused={paused}
          muted={muted}
          showOverlays={showOverlays}
          boxes={boxesFor(camera)}
          active={activeEventId === 'EVT-4404' && camera.id === 'CAM-02'}
          activeTrackId={activeTrackId}
          onSelect={onSelect}
          feedRef={camera.id === selectedId ? selectedFeedRef : undefined}
        />
      ))}
    </div>
  )
}
