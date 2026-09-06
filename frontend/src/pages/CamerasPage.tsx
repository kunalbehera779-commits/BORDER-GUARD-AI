import { additionalCameras } from '../data/mock'
import { SectionCard } from '../components/shared/SectionCard'
import { StatusBadge } from '../components/shared/Badges'
import type { CameraFeed, CommandCenterSnapshot } from '../types'

type CamerasPageProps = {
  snapshot: CommandCenterSnapshot
  onViewCamera: (camera: CameraFeed) => void
}

export function CamerasPage({ snapshot, onViewCamera }: CamerasPageProps) {
  const liveIds = new Set(snapshot.cameras.map((camera) => camera.id))
  const registry = [
    ...snapshot.cameras.map((camera) => ({
      id: camera.id,
      name: camera.name,
      status: camera.status,
      live: true as const,
    })),
    ...additionalCameras.map((camera) => ({ ...camera, live: false as const })),
  ]

  return (
    <SectionCard title="Camera Registry" subtitle="Existing CCTV endpoints mapped to Sector Alpha">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Camera ID</th>
              <th>Location</th>
              <th>Status</th>
              <th>Feed</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {registry.map((camera) => {
              const liveCamera = snapshot.cameras.find((item) => item.id === camera.id)
              return (
                <tr key={camera.id}>
                  <td className="mono">{camera.id}</td>
                  <td>{camera.name}</td>
                  <td>
                    <StatusBadge
                      status={camera.status}
                      tone={camera.status === 'online' ? 'success' : camera.status === 'offline' ? 'warning' : 'neutral'}
                    />
                  </td>
                  <td>{liveIds.has(camera.id) ? 'Primary grid' : 'Archive / secondary'}</td>
                  <td>
                    {liveCamera ? (
                      <button type="button" className="btn-secondary" onClick={() => onViewCamera(liveCamera)}>
                        View Camera
                      </button>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}
