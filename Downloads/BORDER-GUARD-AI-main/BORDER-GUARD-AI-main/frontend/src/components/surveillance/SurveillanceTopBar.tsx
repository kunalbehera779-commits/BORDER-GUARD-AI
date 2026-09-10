type SurveillanceTopBarProps = {
  sector: string
  camerasOnline: number
  camerasTotal: number
  aiEngine: string
  now: Date
  autoRefresh: boolean
}

export function SurveillanceTopBar({
  sector,
  camerasOnline,
  camerasTotal,
  aiEngine,
  now,
  autoRefresh,
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
        <p className="topbar-kicker">Operational wall</p>
        <h2>Live Surveillance</h2>
        <p className="topbar-meta">
          {sector}
          <span className="dot">·</span>
          <span className="mono">
            {camerasOnline}/{camerasTotal} Cameras Online
          </span>
        </p>
      </div>
      <div className="surv-topbar-meta">
        <div className="status-pill">
          <span className="pulse pulse-green" />
          AI Engine: <strong>{aiEngine.toUpperCase()}</strong>
        </div>
        <div className="surv-live-pill">
          <span className="pulse pulse-red" />
          LIVE
        </div>
        <time className="clock" dateTime={now.toISOString()}>
          {dateLabel}
        </time>
        <div className={`surv-refresh ${autoRefresh ? 'is-on' : ''}`}>
          <span className="pulse pulse-green" />
          Auto-refresh
        </div>
      </div>
    </section>
  )
}
