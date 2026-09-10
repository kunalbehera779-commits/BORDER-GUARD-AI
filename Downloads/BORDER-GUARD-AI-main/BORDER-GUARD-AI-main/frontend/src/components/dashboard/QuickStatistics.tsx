import { CarFront, Fence, ScanLine, ShieldCheck, Users } from 'lucide-react'
import { SectionCard } from '../shared/SectionCard'
import type { QuickStats } from '../../types'

type QuickStatisticsProps = {
  stats: QuickStats
}

const items = [
  { key: 'peopleDetectedToday' as const, label: 'People detected today', icon: Users },
  { key: 'vehiclesDetectedToday' as const, label: 'Vehicles detected today', icon: CarFront },
  { key: 'virtualFenceBreaches' as const, label: 'Virtual fence breaches', icon: Fence },
  { key: 'anprDetections' as const, label: 'ANPR detections', icon: ScanLine },
  { key: 'incidentsResolved' as const, label: 'Incidents resolved', icon: ShieldCheck },
]

export function QuickStatistics({ stats }: QuickStatisticsProps) {
  return (
    <SectionCard title="Quick Statistics" subtitle="Operational counts for the current duty cycle">
      <div className="stat-grid">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.key} className="stat-card">
              <Icon size={18} />
              <p>{item.label}</p>
              <strong>{stats[item.key]}</strong>
            </article>
          )
        })}
      </div>
    </SectionCard>
  )
}
