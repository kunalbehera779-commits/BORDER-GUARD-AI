import { SectionCard } from '../components/shared/SectionCard'

export function SettingsPage() {
  return (
    <SectionCard title="Settings" subtitle="Local prototype configuration. Authentication and APIs are not connected.">
      <div className="settings-grid">
        <label>
          Sector
          <input defaultValue="Sector Alpha" readOnly />
        </label>
        <label>
          Command post
          <input defaultValue="Alpha HQ" readOnly />
        </label>
        <label>
          Alert retention
          <input defaultValue="30 days" readOnly />
        </label>
        <label>
          Detection language
          <input defaultValue="English" readOnly />
        </label>
      </div>
      <p className="lede">
        Backend integration points will include FastAPI endpoints for cameras, alerts, incidents,
        and health. This screen remains read-only until services are available.
      </p>
    </SectionCard>
  )
}
