import { useEffect, useState } from 'react'
import { SectionCard } from '../components/shared/SectionCard'
import { StatusBadge } from '../components/shared/Badges'
import { AddCameraModal } from '../components/cameras/AddCameraModal'
import { LiveStreamCanvas } from '../components/cameras/LiveStreamCanvas'
import { apiService } from '../services/api'
import type { CameraData } from '../services/api'
import { Plus, Video, Radio, Trash2, Plug, Play } from 'lucide-react'
import type { CameraFeed, CommandCenterSnapshot } from '../types'

import { mapCamerasTo4Channels } from '../utils/cameraUtils'

type CamerasPageProps = {
  snapshot: CommandCenterSnapshot
  onViewCamera: (camera: CameraFeed) => void
  onRefreshCameras?: () => void
}

export function CamerasPage({ snapshot, onViewCamera, onRefreshCameras }: CamerasPageProps) {
  const [activeSlotModal, setActiveSlotModal] = useState<string | null>(null)

  const cameras = snapshot.cameras

  const handleCameraAdded = (_newCam: CameraData) => {
    if (onRefreshCameras) onRefreshCameras()
  }

  const handleDeleteCamera = async (id: string) => {
    if (!window.confirm(`Disconnect and remove camera endpoint ${id}?`)) return
    await apiService.deleteCamera(id)
    if (onRefreshCameras) onRefreshCameras()
  }

  // Create slot mapping for 4 fixed channels with connected/uploaded cameras prioritized to Channel 01
  const channels = mapCamerasTo4Channels(cameras)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#f8fafc' }}>
            Camera Feed Management
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            4 Primary Border Command Channels — Connect RTSP CCTV, USB Webcam, or MP4 Video Files
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActiveSlotModal('NEW')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: 'none',
            borderRadius: '6px',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
          }}
        >
          <Plus size={18} />
          Connect CCTV Camera
        </button>
      </div>

      {/* 4 Camera Channel Visual Wall */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {channels.map((ch) => (
          <div
            key={ch.slotId}
            style={{
              background: '#0a0f1d',
              border: ch.camera ? '1px solid #1e293b' : '1px dashed #1e3a68',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '0.75rem 1rem',
              background: '#070c18',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong style={{ color: '#f1f5f9', fontSize: '0.95rem' }}>{ch.slotLabel}</strong>
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>
                  {ch.camera ? ch.camera.name : 'Unlinked Slot'}
                </span>
              </div>
              {ch.camera ? (
                <StatusBadge status="online" tone="success" />
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  EMPTY
                </span>
              )}
            </div>

            {ch.camera ? (
              <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <LiveStreamCanvas
                  cameraId={ch.camera.id}
                  cameraName={ch.camera.name}
                  streamType={ch.camera.streamType}
                  streamUrl={ch.camera.streamUrl}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Type: <strong style={{ color: '#38bdf8' }}>{ch.camera.feedType}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCamera(ch.camera!.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #ef4444',
                      color: '#fca5a5',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.78rem'
                    }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '2.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                textAlign: 'center'
              }}>
                <Plug size={36} style={{ color: '#334155' }} />
                <div>
                  <h4 style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem' }}>{ch.slotLabel} Idle</h4>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                    No camera stream assigned to this channel.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSlotModal(ch.slotId)}
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
                  Connect Camera to {ch.slotLabel}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <SectionCard title="Connected Camera Registry Table" subtitle="Detailed endpoint metrics and hardware configurations">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Camera ID</th>
                <th>Name & Sector</th>
                <th>Source Type</th>
                <th>Status</th>
                <th>AI Detection</th>
                <th>Resolution / FPS</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cameras.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    No active cameras connected. Click "Connect Camera" on any channel slot above.
                  </td>
                </tr>
              ) : (
                cameras.map((camera) => (
                  <tr key={camera.id}>
                    <td className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>{camera.id}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{camera.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{camera.sector}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: '#1e293b',
                        fontSize: '0.8rem',
                        color: '#cbd5e1'
                      }}>
                        <Radio size={12} style={{ color: '#38bdf8' }} />
                        {camera.feedType}
                      </span>
                    </td>
                    <td>
                      <StatusBadge
                        status={camera.status}
                        tone={camera.status === 'online' ? 'success' : camera.status === 'offline' ? 'warning' : 'neutral'}
                      />
                    </td>
                    <td>
                      <StatusBadge
                        status={camera.aiStatus}
                        tone={camera.aiStatus === 'active' ? 'success' : 'neutral'}
                      />
                    </td>
                    <td className="mono" style={{ fontSize: '0.85rem' }}>{camera.resolution} @ {camera.fps}fps</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => onViewCamera(camera)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <Video size={14} />
                          View Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCamera(camera.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid #ef4444',
                            color: '#fca5a5',
                            borderRadius: '6px',
                            padding: '0.4rem 0.6rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.8rem'
                          }}
                          title="Remove camera endpoint"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {activeSlotModal && (
        <AddCameraModal
          onClose={() => setActiveSlotModal(null)}
          onCameraAdded={handleCameraAdded}
        />
      )}
    </div>
  )
}
