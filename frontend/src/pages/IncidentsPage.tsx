import { RecentIncidents } from '../components/dashboard/RecentIncidents'
import type { CommandCenterSnapshot } from '../types'

type IncidentsPageProps = {
  snapshot: CommandCenterSnapshot
}

export function IncidentsPage({ snapshot }: IncidentsPageProps) {
  return (
    <div className="page-stack">
      <RecentIncidents incidents={snapshot.incidents} />
    </div>
  )
}
