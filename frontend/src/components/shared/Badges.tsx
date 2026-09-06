import type { IncidentStatus, Severity, AlertStatus } from '../../types'

type SeverityBadgeProps = {
  severity: Severity
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return <span className={`badge badge-${severity}`}>{severity}</span>
}

type StatusBadgeProps = {
  status: AlertStatus | IncidentStatus | string
  tone?: 'neutral' | 'success' | 'warning'
}

export function StatusBadge({ status, tone = 'neutral' }: StatusBadgeProps) {
  return <span className={`badge badge-status badge-${tone}`}>{status.replace('-', ' ')}</span>
}
