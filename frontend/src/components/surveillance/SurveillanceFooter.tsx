import { formatClock } from '../../utils/format'
import type { CommandCenterSnapshot } from '../../types'

type SurveillanceFooterProps = {
  snapshot: CommandCenterSnapshot
  eventsToday: number
  latencyMs: number
}

export function SurveillanceFooter({ snapshot, eventsToday, latencyMs }: SurveillanceFooterProps) {
  const { camerasOnline, camerasTotal, aiEngine } = snapshot.systemHealth

  return (
    <footer className="surv-footer">
      <span>
        Cameras online:{' '}
        <strong className="mono">
          {camerasOnline}/{camerasTotal}
        </strong>
      </span>
      <span>
        AI processing: <strong>{aiEngine === 'operational' ? 'Active' : aiEngine}</strong>
      </span>
      <span>
        Events today: <strong className="mono">{eventsToday}</strong>
      </span>
      <span>
        Last synchronization: <strong>{formatClock(new Date(snapshot.lastSync))}</strong>
      </span>
      <span>
        System latency: <strong className="mono">{latencyMs} ms</strong>
      </span>
    </footer>
  )
}
