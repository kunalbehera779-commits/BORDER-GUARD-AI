import type { ReactNode } from 'react'

type SectionCardProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({ title, subtitle, action, children, className = '' }: SectionCardProps) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="panel-subtitle">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
