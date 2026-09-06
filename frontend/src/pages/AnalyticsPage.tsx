import { QuickStatistics } from '../components/dashboard/QuickStatistics'
import { ThreatSummaryCards } from '../components/dashboard/ThreatSummaryCards'
import { SectionCard } from '../components/shared/SectionCard'
import type { CommandCenterSnapshot } from '../types'

type AnalyticsPageProps = {
  snapshot: CommandCenterSnapshot
}

export function AnalyticsPage({ snapshot }: AnalyticsPageProps) {
  const bars = [
    { label: '00–06', value: 18 },
    { label: '06–12', value: 42 },
    { label: '12–18', value: 36 },
    { label: '18–24', value: 58 },
  ]

  return (
    <div className="page-stack">
      <ThreatSummaryCards summary={snapshot.threatSummary} />
      <QuickStatistics stats={snapshot.quickStats} />
      <SectionCard title="Detection volume by watch" subtitle="Mock distribution for the last 24 hours">
        <div className="bar-chart" aria-hidden="true">
          {bars.map((bar) => (
            <div key={bar.label} className="bar-col">
              <div className="bar" style={{ height: `${bar.value}%` }} />
              <span>{bar.label}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
