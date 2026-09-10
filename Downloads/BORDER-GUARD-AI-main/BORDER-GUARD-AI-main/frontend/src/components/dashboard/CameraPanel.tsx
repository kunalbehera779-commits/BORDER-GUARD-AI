import { apiService } from '../../services/api'
import { LiveStreamCanvas } from '../cameras/LiveStreamCanvas'
import { Trash2 } from 'lucide-react'
import type { CameraFeed } from '../../types'

type CameraPanelProps = {
  camera: CameraFeed
  now: Date
  onView?: (camera: CameraFeed) => void
  onRefreshCameras?: () => void
}

export function CameraPanel({ camera, now, onView, onRefreshCameras }: CameraPanelProps) {
  const handleRemove = async () => {
    if (!window.confirm(`Disconnect and remove camera endpoint ${camera.id}?`)) return
    await apiService.deleteCamera(camera.id)
    if (onRefreshCameras) {
      onRefreshCameras()
    } else {
      window.location.reload()
    }
  }

  return (
    <article className="camera-card">
      <LiveStreamCanvas
        cameraId={camera.id}
        cameraName={camera.name}
        streamType={camera.streamType || camera.feedType?.toLowerCase()}
        streamUrl={camera.streamUrl}
      />
      <div className="camera-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="detection-row">
          <span className="chip">
            Resolution: {camera.resolution}
          </span>
          <span className="chip">
            FPS: {camera.fps}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onView ? (
            <button type="button" className="btn-secondary" onClick={() => onView(camera)}>
              View Detail
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleRemove}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              borderRadius: '6px',
              padding: '0.4rem 0.6rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem'
            }}
            title="Remove camera endpoint"
          >
            <Trash2 size={14} />
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}
