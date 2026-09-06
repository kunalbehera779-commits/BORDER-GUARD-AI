import { Bell, UserRound } from 'lucide-react'
import { formatClock } from '../../utils/format'
import type { CommandCenterSnapshot } from '../../types'

type HeaderProps = {
  snapshot: CommandCenterSnapshot
  now: Date
  unreadCount: number
  onOpenAlerts: () => void
}

export function Header({ snapshot, now, unreadCount, onOpenAlerts }: HeaderProps) {
  const statusLabel = snapshot.systemStatus.toUpperCase()

  return (
    <header className="topbar">
      <div>
        <p className="topbar-kicker">Ministry of Home Affairs · Prototype</p>
        <h2>Border Surveillance Command Center</h2>
        <p className="topbar-meta">
          Current sector: <strong>{snapshot.sector}</strong>
          <span className="dot">·</span>
          Last sync: {formatClock(new Date(snapshot.lastSync))}
        </p>
      </div>

      <div className="topbar-actions">
        <div className="status-pill">
          <span className="pulse pulse-green" />
          System status: <strong>{statusLabel}</strong>
        </div>
        <time className="clock" dateTime={now.toISOString()}>
          {formatClock(now)}
        </time>
        <button type="button" className="icon-btn" onClick={onOpenAlerts} aria-label="Open alerts">
          <Bell size={18} />
          {unreadCount > 0 ? <span className="notif-count">{unreadCount}</span> : null}
        </button>
        <div className="user-chip">
          <div className="user-avatar" aria-hidden="true">
            <UserRound size={16} />
          </div>
          <div>
            <p className="user-name">Duty Officer</p>
            <p className="user-role">Command Post · Alpha</p>
          </div>
        </div>
      </div>
    </header>
  )
}
