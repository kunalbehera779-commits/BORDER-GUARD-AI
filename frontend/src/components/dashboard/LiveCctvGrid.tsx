import { CameraPanel } from './CameraPanel'
import { SectionCard } from '../shared/SectionCard'
import type { CameraFeed } from '../../types'

type LiveCctvGridProps = {
  cameras: CameraFeed[]
  now: Date
  onViewCamera: (camera: CameraFeed) => void
}

export function LiveCctvGrid({ cameras, now, onViewCamera }: LiveCctvGridProps) {
  return (
    <SectionCard
      title="Live CCTV Grid"
      subtitle="AI-assisted monitoring of existing camera infrastructure"
    >
      <div className="cctv-grid">
        {cameras.map((camera) => (
          <CameraPanel key={camera.id} camera={camera} now={now} onView={onViewCamera} />
        ))}
      </div>
    </SectionCard>
  )
}
