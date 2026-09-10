import React, { useState } from 'react'
import { apiService } from '../../services/api'
import type { CameraData } from '../../services/api'
import { Video, CheckCircle2, AlertTriangle, RefreshCw, X, UploadCloud } from 'lucide-react'

interface AddCameraModalProps {
  onClose: () => void
  onCameraAdded: (camera: CameraData) => void
}

export function AddCameraModal({ onClose, onCameraAdded }: AddCameraModalProps) {
  const [name, setName] = useState('')
  const [sector, setSector] = useState('Sector Alpha')
  const [streamType, setStreamType] = useState<'rtsp' | 'mjpeg' | 'webcam' | 'file' | 'synthetic'>('rtsp')
  const [streamUrl, setStreamUrl] = useState('rtsp://admin:12345@192.168.1.100:554/stream1')
  const [testing, setTesting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; resolution?: string; fps?: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleStreamTypeChange = (type: 'rtsp' | 'mjpeg' | 'webcam' | 'file' | 'synthetic') => {
    setStreamType(type)
    setTestResult(null)
    if (type === 'rtsp') setStreamUrl('rtsp://admin:12345@192.168.1.100:554/stream1')
    else if (type === 'webcam') setStreamUrl('0')
    else if (type === 'mjpeg') setStreamUrl('http://192.168.1.50:8080/video')
    else if (type === 'file') setStreamUrl('')
    else if (type === 'synthetic') setStreamUrl('synthetic')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setErrorMsg('')
    try {
      const res = await apiService.uploadVideoFile(file)
      const filePath = res.file_path || ''
      setStreamUrl(filePath)
      
      const fileNameStr = file.name || (res as any).filename || 'Uploaded Video'
      if (!name) {
        const cleanName = typeof fileNameStr === 'string' ? fileNameStr.replace(/\.[^/.]+$/, '') : 'Uploaded Video'
        setName(cleanName)
      }
      
      // Auto test connection on uploaded video
      const test = await apiService.testConnection({
        stream_url: filePath,
        stream_type: 'file',
      })
      setTestResult({
        success: test.success,
        message: `Video "${fileNameStr}" uploaded & ready for AI scanning!`,
        resolution: test.frame_width && test.frame_height ? `${test.frame_width}x${test.frame_height}` : undefined,
        fps: test.fps ? Math.round(test.fps) : undefined,
      })
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload video file.')
    } finally {
      setUploading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!streamUrl.trim()) return
    setTesting(true)
    setTestResult(null)
    setErrorMsg('')
    try {
      const res = await apiService.testConnection({
        stream_url: streamUrl,
        stream_type: streamType,
      })
      setTestResult({
        success: res.success,
        message: res.message,
        resolution: res.frame_width && res.frame_height ? `${res.frame_width}x${res.frame_height}` : undefined,
        fps: res.fps ? Math.round(res.fps) : undefined,
      })
    } catch (e: any) {
      setTestResult({
        success: false,
        message: 'Could not connect to stream server.',
      })
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Please enter a camera name.')
      return
    }

    if (!streamUrl.trim()) {
      setErrorMsg('Please select a video file or enter a stream URL.')
      return
    }

    try {
      const newCam = await apiService.addCamera({
        name: name.trim(),
        sector: sector,
        stream_url: streamUrl.trim(),
        stream_type: streamType,
        status: 'online',
        ai_status: 'active',
        fps: testResult?.fps || 25,
        resolution: testResult?.resolution || '1080p',
      })
      onCameraAdded(newCam)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save camera feed.')
    }
  }

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 10, 18, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="modal-content" style={{
        background: '#0d1525',
        border: '1px solid #1e2d4a',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        color: '#e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #1e2d4a',
          background: '#090e1a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Video style={{ color: '#38bdf8' }} size={22} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Link CCTV / Video Feed</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              {errorMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
              Camera / Feed Name
            </label>
            <input
              type="text"
              placeholder="e.g. North Gate Perimeter Cam 04"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: '#040812',
                border: '1px solid #1e2d4a',
                borderRadius: '6px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                Sector / Location
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: '#040812',
                  border: '1px solid #1e2d4a',
                  borderRadius: '6px',
                  color: '#fff',
                  outline: 'none'
                }}
              >
                <option value="Sector Alpha">Sector Alpha (North)</option>
                <option value="Sector Bravo">Sector Bravo (East)</option>
                <option value="Sector Charlie">Sector Charlie (West)</option>
                <option value="Sector Delta">Sector Delta (South)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                Source Type
              </label>
              <select
                value={streamType}
                onChange={(e) => handleStreamTypeChange(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: '#040812',
                  border: '1px solid #1e2d4a',
                  borderRadius: '6px',
                  color: '#fff',
                  outline: 'none'
                }}
              >
                <option value="rtsp">RTSP CCTV Stream (rtsp://)</option>
                <option value="file">Upload Video File (MP4/AVI/MOV)</option>
                <option value="webcam">Local USB / Laptop Webcam</option>
                <option value="mjpeg">HTTP / MJPEG Stream</option>
                <option value="synthetic">Synthetic Test Pattern</option>
              </select>
            </div>
          </div>

          {streamType === 'file' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                Browse & Upload MP4 Video File
              </label>
              <div style={{
                border: '2px dashed #1e3a68',
                borderRadius: '8px',
                padding: '1.25rem',
                textAlign: 'center',
                background: '#040812',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <UploadCloud size={32} style={{ color: '#38bdf8', marginBottom: '0.35rem' }} />
                <div style={{ fontWeight: 600, color: '#f1f5f9' }}>
                  {uploading ? 'Uploading Video File...' : 'Click or Drag & Drop MP4 Video File'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  Supports .mp4, .avi, .mov, .mkv format files up to 500MB
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                Stream URL / Device Index
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="rtsp://admin:pass@ip:554/stream"
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    background: '#040812',
                    border: '1px solid #1e2d4a',
                    borderRadius: '6px',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  style={{
                    padding: '0.65rem 1rem',
                    background: '#1e2d4a',
                    border: '1px solid #38bdf8',
                    borderRadius: '6px',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontWeight: 500,
                    fontSize: '0.85rem'
                  }}
                >
                  {testing ? <RefreshCw className="spin" size={16} /> : null}
                  Test Stream
                </button>
              </div>
            </div>
          )}

          {testResult && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              background: testResult.success ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${testResult.success ? '#22c55e' : '#ef4444'}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              fontSize: '0.85rem'
            }}>
              {testResult.success ? (
                <CheckCircle2 style={{ color: '#22c55e', marginTop: '2px' }} size={18} />
              ) : (
                <AlertTriangle style={{ color: '#ef4444', marginTop: '2px' }} size={18} />
              )}
              <div>
                <div style={{ fontWeight: 600, color: testResult.success ? '#4ade80' : '#fca5a5' }}>
                  {testResult.message}
                </div>
                {testResult.resolution && (
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>
                    Resolution: {testResult.resolution} | Est. FPS: {testResult.fps || 25}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #1e2d4a'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                background: 'transparent',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: '0.65rem 1.5rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.4)'
              }}
            >
              {uploading ? 'Uploading Video...' : 'Connect & Start Scanning'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
