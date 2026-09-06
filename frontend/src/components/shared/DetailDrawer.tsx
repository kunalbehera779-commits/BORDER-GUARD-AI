import { X } from 'lucide-react'
import type { ReactNode } from 'react'

type DetailDrawerProps = {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}

export function DetailDrawer({ title, subtitle, onClose, children }: DetailDrawerProps) {
  return (
    <div className="drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="drawer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <header className="drawer-header">
          <div>
            <h2 id="drawer-title">{title}</h2>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  )
}
