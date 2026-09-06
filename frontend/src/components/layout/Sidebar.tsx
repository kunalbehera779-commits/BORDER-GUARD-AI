import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Bell,
  Camera,
  FileWarning,
  LayoutDashboard,
  Settings,
  Shield,
  Truck,
  Users,
  Video,
} from 'lucide-react'
import type { NavView } from '../../types'

const items: { id: NavView; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'surveillance', label: 'Live Surveillance', icon: Video },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'incidents', label: 'Incidents', icon: FileWarning },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'personnel', label: 'Personnel', icon: Users },
  { id: 'vehicles', label: 'Vehicles', icon: Truck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

type SidebarProps = {
  activeView: NavView
  onNavigate: (view: NavView) => void
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <Shield size={22} strokeWidth={1.75} />
        </div>
        <div>
          <p className="brand-kicker">SIH26187</p>
          <h1>BORDERGUARD AI</h1>
        </div>
      </div>

      <nav className="nav" aria-label="Primary">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.id === activeView
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'is-active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <p>Assisted video analytics</p>
        <p>Existing CCTV infrastructure</p>
      </div>
    </aside>
  )
}
