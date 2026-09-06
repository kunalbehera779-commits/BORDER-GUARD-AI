import { SectionCard } from '../shared/SectionCard'
import { SeverityBadge, StatusBadge } from '../shared/Badges'
import { formatDateTime } from '../../utils/format'
import type { Alert } from '../../types'

type ActiveAlertsProps = {
  alerts: Alert[]
  onViewIncident: (alert: Alert) => void
  onSelect: (alert: Alert) => void
}

function statusTone(status: Alert['status']) {
  if (status === 'resolved') return 'success' as const
  if (status === 'open') return 'warning' as const
  return 'neutral' as const
}

export function ActiveAlerts({ alerts, onViewIncident, onSelect }: ActiveAlertsProps) {
  return (
    <SectionCard title="Active Alerts" subtitle="Predefined events requiring operator review">
      <div className="alert-list">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className="alert-card"
            onClick={() => onSelect(alert)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onSelect(alert)
            }}
            role="button"
            tabIndex={0}
          >
            <div className="alert-card-top">
              <SeverityBadge severity={alert.severity} />
              <span className="muted">{alert.id}</span>
            </div>
            <h3>{alert.title}</h3>
            <p className="alert-meta">
              {alert.cameraName}
              <span className="dot">·</span>
              {formatDateTime(alert.timestamp)}
            </p>
            <div className="alert-card-bottom">
              <StatusBadge status={alert.status} tone={statusTone(alert.status)} />
              <button
                type="button"
                className="btn-primary"
                onClick={(event) => {
                  event.stopPropagation()
                  onViewIncident(alert)
                }}
              >
                View Incident
              </button>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  )
}
