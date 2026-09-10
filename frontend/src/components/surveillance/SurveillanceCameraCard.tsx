import type { Ref } from 'react'
import type { BoundingBox, CameraFeed } from '../../types'
import { CctvFeed } from './CctvFeed'

type SurveillanceCameraCardProps = {
  camera: CameraFeed
  now: Date
  selected: boolean
  paused: boolean
  muted: boolean
  showOverlays: boolean
  boxes: BoundingBox[]
  active?: boolean
  activeTrackId?: string
  onSelect: (camera: CameraFeed) => void
  feedRef?: Ref<HTMLDivElement>
}

export function SurveillanceCameraCard({
  camera,
  now,
  selected,
  paused,
  muted,
  showOverlays,
  boxes,
  active = false,
  activeTrackId,
  onSelect,
  feedRef,
}: SurveillanceCameraCardProps) {
  return (
    <button
      type="button"
      className={`surv-cam ${selected ? 'is-selected' : ''} ${active ? 'is-event-focused' : ''}`}
      onClick={() => onSelect(camera)}
      aria-pressed={selected}
    >
      <CctvFeed
        ref={selected ? feedRef : undefined}
        camera={camera}
        now={now}
        paused={paused}
        muted={muted}
        showOverlays={showOverlays}
        boxes={boxes}
        active={active}
        activeTrackId={activeTrackId}
      />
      <div className="surv-cam-meta">
        <div>
          <p className="mono surv-cam-id">{camera.id}</p>
          <p>{camera.name} <span className="muted">· {camera.sector}</span></p>
          <p className="surv-cam-status">
            <span className={`status-dot status-${camera.status}`} />
            {camera.status.toUpperCase()} · {camera.detections.length} detections · AI {camera.aiStatus.toUpperCase()}
          </p>
        </div>
        <div className="surv-cam-chips">
          {camera.detections.map((item) => (
            <span key={`${camera.id}-${item.type}-${item.trackId ?? ''}`} className="chip">
              {item.type}
              {item.trackId ? ` · ${item.trackId}` : ''} · {item.confidence}%
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}
