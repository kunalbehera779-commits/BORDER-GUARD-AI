import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react'
import type { ThreatSummary } from '../../types'

type ThreatSummaryCardsProps = {
  summary: ThreatSummary
}

const cards = [
  { key: 'critical' as const, label: 'Critical', icon: AlertOctagon },
  { key: 'high' as const, label: 'High', icon: ShieldAlert },
  { key: 'medium' as const, label: 'Medium', icon: AlertTriangle },
  { key: 'low' as const, label: 'Low', icon: Info },
]

export function ThreatSummaryCards({ summary }: ThreatSummaryCardsProps) {
  return (
    <div className="threat-grid">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <article key={card.key} className={`threat-card threat-${card.key}`}>
            <div className="threat-icon">
              <Icon size={20} />
            </div>
            <div>
              <p className="threat-label">{card.label}</p>
              <p className="threat-value">{summary[card.key]}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
