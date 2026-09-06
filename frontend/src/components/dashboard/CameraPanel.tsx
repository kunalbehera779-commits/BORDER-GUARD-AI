import { formatClock } from '../../utils/format'
import type { CameraFeed } from '../../types'

type CameraPanelProps = {
  camera: CameraFeed
  now: Date
  onView?: (camera: CameraFeed) => void
}

export function CameraPanel({ camera, now, onView }: CameraPanelProps) {
  return (
    <article className="camera-card">
      <div className={`cctv-frame scene-${camera.scene}`}>
        <div className="scanlines" />
        <div className="cctv-vignette" />
        {camera.boxes.map((box) => (
          <div
            key={box.id}
            className="bbox"
            style={{
              top: box.top,
              left: box.left,
              width: box.width,
              height: box.height,
            }}
          >
            <span>
              {box.label} {box.confidence}%
            </span>
          </div>
        ))}
        <div className="cctv-overlay top">
          <span>
            {camera.id} {camera.name}
          </span>
          <span className="live-chip">
            <span className="pulse pulse-red" />
            LIVE
          </span>
        </div>
        <div className="cctv-overlay bottom">
          <span>{formatClock(now)}</span>
          <span>AI {camera.aiStatus.toUpperCase()}</span>
        </div>
      </div>
      <div className="camera-meta">
        <div className="detection-row">
          {camera.detections.map((item) => (
            <span key={`${camera.id}-${item.type}`} className="chip">
              {item.type} · {item.confidence}%
            </span>
          ))}
        </div>
        {onView ? (
          <button type="button" className="btn-secondary" onClick={() => onView(camera)}>
            View Camera
          </button>
        ) : null}
      </div>
    </article>
  )
}
