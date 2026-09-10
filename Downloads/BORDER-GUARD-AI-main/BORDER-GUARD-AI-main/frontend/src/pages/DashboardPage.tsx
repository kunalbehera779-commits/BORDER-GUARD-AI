import { ActiveAlerts } from '../components/dashboard/ActiveAlerts'
import { LiveCctvGrid } from '../components/dashboard/LiveCctvGrid'
import { QuickStatistics } from '../components/dashboard/QuickStatistics'
import { RecentIncidents } from '../components/dashboard/RecentIncidents'
import { SystemHealthPanel } from '../components/dashboard/SystemHealthPanel'
import { ThreatSummaryCards } from '../components/dashboard/ThreatSummaryCards'
import { QuickConnectBanner } from '../components/shared/QuickConnectBanner'
import type { Alert, CameraFeed, CommandCenterSnapshot } from '../types'

type DashboardPageProps = {
  snapshot: CommandCenterSnapshot
  now: Date
  onViewCamera: (camera: CameraFeed) => void
  onSelectAlert: (alert: Alert) => void
  onViewIncident: (alert: Alert) => void
  onRefreshCameras?: () => void
}

export function DashboardPage({
  snapshot,
  now,
  onViewCamera,
  onSelectAlert,
  onViewIncident,
  onRefreshCameras,
}: DashboardPageProps) {
  return (
    <div className="page-stack">
      <QuickConnectBanner onCameraConnected={() => onRefreshCameras?.()} />

      <ThreatSummaryCards summary={snapshot.threatSummary} />

      <div className="dashboard-main">
        <LiveCctvGrid cameras={snapshot.cameras} now={now} onViewCamera={onViewCamera} onRefreshCameras={onRefreshCameras} />
        <ActiveAlerts
          alerts={snapshot.alerts}
          onSelect={onSelectAlert}
          onViewIncident={onViewIncident}
        />
      </div>

      <RecentIncidents incidents={snapshot.incidents} />

      <div className="dashboard-bottom">
        <SystemHealthPanel health={snapshot.systemHealth} />
        <QuickStatistics stats={snapshot.quickStats} />
      </div>
    </div>
  )
}
