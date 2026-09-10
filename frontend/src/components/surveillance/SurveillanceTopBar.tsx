type SurveillanceTopBarProps = {
  sector: string
  sectorOptions: string[]
  environment: string
  visibility: string
  camerasOnline: number
  camerasTotal: number
  aiEngine: string
  now: Date
  lastSync: string
  autoRefresh: boolean
  onSectorChange: (sector: string) => void
}

export function SurveillanceTopBar({
  sector,
  sectorOptions,
  environment,
  visibility,
  camerasOnline,
  camerasTotal,
  aiEngine,
  now,
  lastSync,
  autoRefresh,
  onSectorChange,
}: SurveillanceTopBarProps) {
  const dateLabel = now.toLocaleString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <section className="surv-topbar">
      <div>
        <p className="topbar-kicker">Operational wall · command post alpha</p>
        <h2>Live Surveillance</h2>
        <p className="topbar-meta">
          <label className="surv-sector-select">
            <span className="sr-only">Sector</span>
            <select value={sector} onChange={(event) => onSectorChange(event.target.value)}>
              {sectorOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <span className="dot">·</span>
          <span className="mono">
            {camerasOnline}/{camerasTotal} Cameras Online
          </span>
          <span className="dot">·</span>
          <span>{environment} · {visibility} visibility</span>
        </p>
      </div>
      <div className="surv-topbar-meta">
        <div className="status-pill">
          <span className="pulse pulse-green" />
          AI Engine: <strong>{aiEngine.toUpperCase()}</strong>
        </div>
        <div className="surv-demo-pill">SIMULATED FEED</div>
        <div className="surv-live-pill">
          <span className="pulse pulse-red" />
          LIVE
        </div>
        <time className="clock" dateTime={now.toISOString()}>
          {dateLabel}
        </time>
        <div className="surv-update">Updated {lastSync}</div>
        <div className={`surv-refresh ${autoRefresh ? 'is-on' : ''}`}>
          <span className="pulse pulse-green" />
          Auto-refresh
        </div>
      </div>
    </section>
  )
}
