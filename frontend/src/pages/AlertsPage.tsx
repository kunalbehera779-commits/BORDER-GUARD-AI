import { ActiveAlerts } from '../components/dashboard/ActiveAlerts'
import type { Alert, CommandCenterSnapshot } from '../types'

type AlertsPageProps = {
  snapshot: CommandCenterSnapshot
  onSelectAlert: (alert: Alert) => void
  onViewIncident: (alert: Alert) => void
}

export function AlertsPage({ snapshot, onSelectAlert, onViewIncident }: AlertsPageProps) {
  return (
    <div className="page-stack page-narrow">
      <ActiveAlerts
        alerts={snapshot.alerts}
        onSelect={onSelectAlert}
        onViewIncident={onViewIncident}
      />
    </div>
  )
}
