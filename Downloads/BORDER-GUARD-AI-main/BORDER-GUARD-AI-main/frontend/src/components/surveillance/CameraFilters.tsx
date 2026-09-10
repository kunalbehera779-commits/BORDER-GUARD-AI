import type { CameraWallFilter } from '../../types'

type CameraFiltersProps = {
  value: CameraWallFilter
  onChange: (value: CameraWallFilter) => void
}

const filters: { id: CameraWallFilter; label: string }[] = [
  { id: 'all', label: 'All Cameras' },
  { id: 'online', label: 'Online' },
  { id: 'offline', label: 'Offline' },
  { id: 'critical', label: 'Critical Event' },
  { id: 'ai-active', label: 'AI Active' },
]

export function CameraFilters({ value, onChange }: CameraFiltersProps) {
  return (
    <div className="surv-filters" role="tablist" aria-label="Camera filters">
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          role="tab"
          aria-selected={value === filter.id}
          className={`surv-filter ${value === filter.id ? 'is-on' : ''}`}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
