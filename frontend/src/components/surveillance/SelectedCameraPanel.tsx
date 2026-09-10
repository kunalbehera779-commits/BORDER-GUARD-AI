import { CctvFeed } from './CctvFeed'
import { formatTime } from '../../utils/format'
import type { AiEvent, BoundingBox, CameraFeed } from '../../types'
import { signalLabel } from './surveillanceUtils'

type SelectedCameraPanelProps = {
  camera: CameraFeed
  now: Date
  paused: boolean
  muted: boolean
  showOverlays: boolean
  boxes: BoundingBox[]
  recentEvents: AiEvent[]
}

export function SelectedCameraPanel({ camera, now, paused, muted, showOverlays, boxes, recentEvents }: SelectedCameraPanelProps) {
  return (
    <section className="panel surv-selected">
      <header className="panel-header">
        <div>
          <h2>
            <span className="mono">{camera.id}</span> {camera.name}
          </h2>
          <p className="panel-subtitle">
            {camera.sector} · Simulated feed for operator review
          </p>
        </div>
        <span className={`badge ${camera.status === 'online' ? 'badge-success' : 'badge-warning'}`}>
          {camera.status === 'online' ? 'LIVE' : camera.status}
        </span>
      </header>
      <div className="surv-selected-feed-wrap">
        <CctvFeed
          camera={camera}
          now={now}
          paused={paused}
          muted={muted}
          showOverlays={showOverlays}
          boxes={boxes}
          active={camera.fenceBreached}
        />
      </div>
      <dl className="surv-selected-grid">
        <div>
          <dt>Location</dt>
          <dd>{camera.name}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{camera.status === 'online' ? 'LIVE' : camera.status}</dd>
        </div>
        <div>
          <dt>Resolution</dt>
          <dd className="mono">{camera.resolution}</dd>
        </div>
        <div>
          <dt>FPS</dt>
          <dd className="mono">{camera.fps}</dd>
        </div>
        <div>
          <dt>AI processing</dt>
          <dd>{camera.aiStatus.toUpperCase()}</dd>
        </div>
        <div>
          <dt>Environment</dt>
          <dd>{camera.environment}</dd>
        </div>
        <div>
          <dt>Signal quality</dt>
          <dd>
            {camera.signalQuality}% · {signalLabel(camera.signalQuality)}
          </dd>
        </div>
        <div>
          <dt>Current event</dt>
          <dd>{camera.currentEvent ?? 'None flagged'}</dd>
        </div>
        <div>
          <dt>Fence state</dt>
          <dd>{camera.virtualFence ? (camera.fenceBreached ? 'Possible intrusion' : 'Active') : 'Inactive'}</dd>
        </div>
      </dl>
      <div className="surv-track-row">
        <div className="surv-detail-heading">
          <p>Detected objects</p>
          <span className="muted">{camera.detections.length} tracked</span>
        </div>
        <div className="detection-row">
          {camera.detections.map((item) => (
            <span key={`${item.type}-${item.trackId ?? ''}`} className="chip">
              {item.type} · {item.confidence}%
              {item.trackId ? ` · Track ${item.trackId}` : ''}
            </span>
          ))}
        </div>
      </div>
      <div className="surv-recent-events">
        <div className="surv-detail-heading">
          <p>Recent AI events</p>
          <span className="muted">Evidence queue</span>
        </div>
        {recentEvents.length > 0 ? recentEvents.map((event) => (
          <div key={event.id} className="surv-recent-event">
            <span className={`status-dot severity-dot-${event.severity}`} />
            <span>{event.name}</span>
            <span className="mono muted">{formatTime(event.timestamp)}</span>
          </div>
        )) : <p className="muted">No recent events linked to this camera.</p>}
      </div>
    </section>
  )
}
