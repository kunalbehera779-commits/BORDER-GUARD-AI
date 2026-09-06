import { SectionCard } from '../components/shared/SectionCard'
import { StatusBadge } from '../components/shared/Badges'
import type { CameraFeed, CommandCenterSnapshot } from '../types'

type CamerasPageProps = {
  snapshot: CommandCenterSnapshot
  onViewCamera: (camera: CameraFeed) => void
}

export function CamerasPage({ snapshot, onViewCamera }: CamerasPageProps) {
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
            {snapshot.cameras.map((camera) => {
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
                  <td>Primary grid</td>
                  <td>
                    <button type="button" className="btn-secondary" onClick={() => onViewCamera(camera)}>
                      View Camera
                    </button>
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
