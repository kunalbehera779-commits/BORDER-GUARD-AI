import { SectionCard } from '../shared/SectionCard'
import { SeverityBadge, StatusBadge } from '../shared/Badges'
import { formatDateTime } from '../../utils/format'
import type { Incident } from '../../types'

type RecentIncidentsProps = {
  incidents: Incident[]
}

function statusTone(status: Incident['status']) {
  if (status === 'resolved' || status === 'closed') return 'success' as const
  if (status === 'open') return 'warning' as const
  return 'neutral' as const
}

export function RecentIncidents({ incidents }: RecentIncidentsProps) {
  return (
    <SectionCard title="Recent Incidents" subtitle="Operator-reviewed event log">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Incident ID</th>
              <th>Event type</th>
              <th>Camera</th>
              <th>Severity</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td className="mono">{incident.id}</td>
                <td>{incident.eventType}</td>
                <td>{incident.cameraName}</td>
                <td>
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td>{formatDateTime(incident.timestamp)}</td>
                <td>
                  <StatusBadge status={incident.status} tone={statusTone(incident.status)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}
