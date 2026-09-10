import { SectionCard } from '../components/shared/SectionCard'
import { StatusBadge } from '../components/shared/Badges'
import type { CommandCenterSnapshot } from '../types'

type VehiclesPageProps = {
  snapshot: CommandCenterSnapshot
}

export function VehiclesPage({ snapshot }: VehiclesPageProps) {
  return (
    <SectionCard title="Vehicles" subtitle="ANPR-assisted sightings for operator review">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Record</th>
              <th>Plate</th>
              <th>Type</th>
              <th>Last seen</th>
              <th>Camera</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="mono">{vehicle.id}</td>
                <td className="mono">{vehicle.plate}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.lastSeen}</td>
                <td>{vehicle.cameraName}</td>
                <td>
                  <StatusBadge
                    status={vehicle.status}
                    tone={vehicle.status === 'cleared' ? 'success' : 'warning'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}
