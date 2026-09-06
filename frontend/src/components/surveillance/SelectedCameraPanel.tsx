import type { CameraFeed } from '../../types'
import { signalLabel } from './surveillanceUtils'

type SelectedCameraPanelProps = {
  camera: CameraFeed
}

export function SelectedCameraPanel({ camera }: SelectedCameraPanelProps) {
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
      </dl>
      <div className="surv-track-row">
        <p>Detected objects</p>
        <div className="detection-row">
          {camera.detections.map((item) => (
            <span key={`${item.type}-${item.trackId ?? ''}`} className="chip">
              {item.type} · {item.confidence}%
              {item.trackId ? ` · Track ${item.trackId}` : ''}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
