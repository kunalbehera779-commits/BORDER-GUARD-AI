import { forwardRef } from 'react'
import { formatClock, formatTime } from '../../utils/format'
import type { BoundingBox, CameraFeed } from '../../types'
import { signalLabel } from './surveillanceUtils'

type CctvFeedProps = {
  camera: CameraFeed
  now: Date
  paused: boolean
  muted: boolean
  showOverlays: boolean
  boxes: BoundingBox[]
  active?: boolean
  activeTrackId?: string
  compact?: boolean
}

export const CctvFeed = forwardRef<HTMLDivElement, CctvFeedProps>(function CctvFeed(
  { camera, now, paused, muted, showOverlays, boxes, active = false, activeTrackId, compact = false },
  ref,
) {
  const envClass = camera.environment.toLowerCase().replace(/[^a-z]+/g, '-')

  return (
    <div
      ref={ref}
      className={`cctv-frame scene-${camera.scene} surv-feed env-${envClass} ${paused ? 'is-paused' : ''} ${compact ? 'is-compact' : ''} ${active ? 'is-event-focused' : ''}`}
    >
      <div className={`surv-noise ${paused ? '' : 'is-live'}`} />
      <div className={`scanlines ${paused ? '' : 'is-scrolling'}`} />
      <div className="cctv-vignette" />
      <div className={`surv-silhouettes scene-${camera.scene}`} aria-hidden="true">
        {camera.scene === 'gate' ? (
          <>
            <span className="surv-person left" />
            <span className="surv-vehicle right" />
          </>
        ) : null}
        {camera.scene === 'river' ? <span className="surv-person river" /> : null}
        {camera.scene === 'river' ? <span className="surv-animal river" /> : null}
        {camera.scene === 'checkpoint' ? <span className="surv-vehicle checkpoint" /> : null}
        {camera.scene === 'hill' ? <span className="surv-aerial" /> : null}
      </div>
      <div className="surv-depth-grid" aria-hidden="true" />

      {camera.virtualFence ? (
        <div className={`surv-fence ${camera.fenceBreached ? 'is-breach' : ''}`}>
          <span>RESTRICTED ZONE</span>
        </div>
      ) : null}

      {showOverlays
        ? boxes.map((box) => (
            <div
              key={box.id}
              className={`bbox surv-bbox kind-${box.kind ?? 'other'} ${active && box.trackId === activeTrackId ? 'is-track-focused' : ''}`}
              style={{
                top: box.top,
                left: box.left,
                width: box.width,
                height: box.height,
              }}
            >
              <span className="surv-bbox-label">
                <strong>{box.kind === 'aerial' ? 'Aerial object' : box.kind === 'person' ? 'Person' : box.kind === 'vehicle' ? 'Vehicle' : box.label}</strong>
                <em>{box.confidence}%</em>
                {box.trackId ? <small>{box.trackId}</small> : null}
              </span>
            </div>
          ))
        : null}

      {camera.fenceBreached && showOverlays ? (
        <div className="surv-breach-banner">VIRTUAL FENCE BREACH</div>
      ) : null}

      {camera.scene === 'hill' && camera.currentEvent ? (
        <div className="surv-airspace-tag">RESTRICTED AIRSPACE</div>
      ) : null}

      <div className="cctv-overlay top">
        <span className="surv-feed-title">
          <span className="mono">{camera.id}</span>
          <span>{camera.name}</span>
        </span>
        <span className={paused ? 'live-chip paused' : 'live-chip'}>
          <span className={paused ? 'dot-offline' : 'pulse pulse-red'} />
          {paused ? 'PAUSED' : 'LIVE'}
        </span>
      </div>
      <div className="cctv-overlay bottom">
        <span className="surv-timecode">
          <span className="mono">{formatClock(now)}</span>
          <span className="surv-timezone">IST</span>
        </span>
        <span className="surv-feed-status">
          <span className="surv-ai-chip">AI {camera.aiStatus.toUpperCase()}</span>
          <span className="surv-signal">
            <span className="signal-bars" aria-hidden="true"><i /><i /><i /><i /></span>
            SIG {camera.signalQuality}%
          </span>
          {muted ? <span>MUTED</span> : null}
        </span>
      </div>
      <div className="surv-feed-footer mono">
        <span>{camera.resolution} · {camera.fps} FPS</span>
        <span>{camera.environment.toUpperCase()} · {signalLabel(camera.signalQuality)}</span>
      </div>
      {!compact && camera.currentEvent ? (
        <div className="surv-event-chip">{camera.currentEvent}</div>
      ) : null}
      <span className="surv-clock-corner mono">{formatTime(now)}</span>
    </div>
  )
})
