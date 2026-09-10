import {
  Camera,
  Expand,
  Grid2x2,
  LayoutGrid,
  Pause,
  Play,
  Rows3,
  ScanLine,
  Volume2,
  VolumeX,
} from 'lucide-react'
import type { CameraFeed, DetectionFilter, GridLayoutMode, Severity } from '../../types'

type SurveillanceControlsProps = {
  cameras: CameraFeed[]
  selectedId: string
  paused: boolean
  muted: boolean
  showOverlays: boolean
  layout: GridLayoutMode
  detectionFilter: DetectionFilter
  eventSeverity: Severity | 'all'
  onTogglePause: () => void
  onSnapshot: () => void
  onFullscreen: () => void
  onToggleMute: () => void
  onLayout: (layout: GridLayoutMode) => void
  onToggleOverlays: () => void
  onDetectionFilter: (filter: DetectionFilter) => void
  onEventSeverity: (severity: Severity | 'all') => void
  onSelectCamera: (id: string) => void
}

const detectionOptions: { id: DetectionFilter; label: string }[] = [
  { id: 'all', label: 'All detections' },
  { id: 'person', label: 'Person' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'animal', label: 'Animal' },
  { id: 'anpr', label: 'ANPR' },
  { id: 'aerial', label: 'Aerial' },
]

export function SurveillanceControls({
  cameras,
  selectedId,
  paused,
  muted,
  showOverlays,
  layout,
  detectionFilter,
  eventSeverity,
  onTogglePause,
  onSnapshot,
  onFullscreen,
  onToggleMute,
  onLayout,
  onToggleOverlays,
  onDetectionFilter,
  onEventSeverity,
  onSelectCamera,
}: SurveillanceControlsProps) {
  return (
    <div className="surv-controls">
      <div className="surv-control-group">
        <span className="surv-control-section-label">Operator controls</span>
        <button type="button" className="btn-secondary" onClick={onTogglePause}>
          {paused ? <Play size={14} /> : <Pause size={14} />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className="btn-secondary" onClick={onSnapshot}>
          <Camera size={14} />
          Snapshot
        </button>
        <button type="button" className="btn-secondary" onClick={onFullscreen}>
          <Expand size={14} />
          Fullscreen
        </button>
        <button type="button" className="btn-secondary" onClick={onToggleMute}>
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {muted ? 'Unmute' : 'Mute'}
        </button>
      </div>
      <div className="surv-control-group">
        <span className="surv-control-label">Wall layout</span>
        <button
          type="button"
          className={`surv-icon-toggle ${layout === 'wall' ? 'is-on' : ''}`}
          onClick={() => onLayout('wall')}
          aria-label="2 by 2 grid"
        >
          <Grid2x2 size={16} />
        </button>
        <button
          type="button"
          className={`surv-icon-toggle ${layout === 'focus' ? 'is-on' : ''}`}
          onClick={() => onLayout('focus')}
          aria-label="Focus layout"
        >
          <LayoutGrid size={16} />
        </button>
        <button
          type="button"
          className={`surv-icon-toggle ${layout === 'strip' ? 'is-on' : ''}`}
          onClick={() => onLayout('strip')}
          aria-label="Strip layout"
        >
          <Rows3 size={16} />
        </button>
      </div>
      <div className="surv-control-group">
        <button
          type="button"
          className={`btn-secondary ${showOverlays ? 'is-on' : ''}`}
          onClick={onToggleOverlays}
        >
          <ScanLine size={14} />
          AI overlays <strong>{showOverlays ? 'ON' : 'OFF'}</strong>
        </button>
        <label className="surv-select">
          Detection filter
          <select
            value={detectionFilter}
            onChange={(event) => onDetectionFilter(event.target.value as DetectionFilter)}
          >
            {detectionOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="surv-select">
          Event severity
          <select
            value={eventSeverity}
            onChange={(event) => onEventSeverity(event.target.value as Severity | 'all')}
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="surv-select">
          Camera
          <select value={selectedId} onChange={(event) => onSelectCamera(event.target.value)}>
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.id} {camera.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
