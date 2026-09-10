import { SeverityBadge, StatusBadge } from '../shared/Badges'
import { formatTime } from '../../utils/format'
import type { AiEvent } from '../../types'

type AiEventsPanelProps = {
  events: AiEvent[]
  activeEventId: string | null
  onReview: (event: AiEvent) => void
}

export function AiEventsPanel({ events, activeEventId, onReview }: AiEventsPanelProps) {
  const openCount = events.filter((event) => event.status === 'open').length

  return (
    <section className="panel surv-events">
      <header className="panel-header">
        <div>
          <div className="surv-events-heading">
            <h2>AI Events</h2>
            <span className="surv-event-count">{openCount} open</span>
          </div>
          <p className="panel-subtitle">Simulated detections queued for operator review</p>
        </div>
        <span className="surv-queue-live"><span className="pulse pulse-green" /> QUEUE LIVE</span>
      </header>
      <div className="surv-event-list">
        {events.map((event) => (
          <article
            key={event.id}
            className={`surv-event sev-${event.severity} ${event.name.toLowerCase().includes('fence') ? 'is-breach-event' : ''} ${activeEventId === event.id ? 'is-focused' : ''}`}
          >
            <div className="surv-event-top">
              <SeverityBadge severity={event.severity} />
              <span className="mono muted surv-event-time">{formatTime(event.timestamp)}</span>
            </div>
            <h3>{event.name}</h3>
            <p className="surv-event-meta">
              <span className="mono">{event.cameraName}</span>
              <span className="surv-event-camera-dot" />
              <span>{event.name.toLowerCase().includes('fence') ? 'Restricted zone linked' : 'AI track linked'}</span>
            </p>
            <div className="surv-event-stats">
              <span>Confidence <strong className="mono">{event.confidence}%</strong></span>
              <span className="mono surv-event-id">{event.id}</span>
            </div>
            <div className="surv-event-bottom">
              <StatusBadge
                status={event.status}
                tone={event.status === 'open' ? 'warning' : event.status === 'resolved' ? 'success' : 'neutral'}
              />
              <button type="button" className="btn-secondary surv-review-btn" onClick={() => onReview(event)}>
                {event.status === 'open' ? 'Review now' : 'Open review'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
