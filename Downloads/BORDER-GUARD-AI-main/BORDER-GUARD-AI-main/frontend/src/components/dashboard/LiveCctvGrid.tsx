import { useState } from 'react'
import { CameraPanel } from './CameraPanel'
import { SectionCard } from '../shared/SectionCard'
import { AddCameraModal } from '../cameras/AddCameraModal'
import { Plug, Plus } from 'lucide-react'
import type { CameraFeed } from '../../types'
import { mapCamerasTo4Channels } from '../../utils/cameraUtils'

type LiveCctvGridProps = {
  cameras: CameraFeed[]
  now: Date
  onViewCamera: (camera: CameraFeed) => void
  onRefreshCameras?: () => void
}

export function LiveCctvGrid({ cameras, now, onViewCamera, onRefreshCameras }: LiveCctvGridProps) {
  const [activeConnectModal, setActiveConnectModal] = useState(false)

  // Map 4 fixed channels with active/uploaded cameras prioritized to Channel 01
  const channels = mapCamerasTo4Channels(cameras)

  return (
    <SectionCard
      title="Live CCTV Command Grid"
      subtitle="4 Primary Border Monitoring Channels — AI Target Scanning & Risk Index"
    >
      <div className="cctv-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {channels.map((ch) => (
          <div key={ch.slotLabel} style={{ borderRadius: '8px', overflow: 'hidden' }}>
            {ch.camera ? (
              <CameraPanel camera={ch.camera} now={now} onView={onViewCamera} onRefreshCameras={onRefreshCameras} />
            ) : (
              <div style={{
                background: '#070c18',
                border: '1px dashed #1e3a68',
                borderRadius: '8px',
                padding: '2.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                minHeight: '260px'
              }}>
                <Plug size={34} style={{ color: '#334155' }} />
                <div>
                  <strong style={{ color: '#e2e8f0', fontSize: '0.95rem', display: 'block' }}>{ch.slotLabel} Unlinked</strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>No stream assigned to this channel</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveConnectModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1.1rem',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <Plus size={15} />
                  Connect to {ch.slotLabel}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {activeConnectModal && (
        <AddCameraModal
          onClose={() => setActiveConnectModal(false)}
          onCameraAdded={() => {
            setActiveConnectModal(false)
            if (onRefreshCameras) onRefreshCameras()
          }}
        />
      )}
    </SectionCard>
  )
}
