import { useMemo, useRef, useState } from 'react'
import { DetailDrawer } from '../components/shared/DetailDrawer'
import { SeverityBadge, StatusBadge } from '../components/shared/Badges'
import { AiEventsPanel } from '../components/surveillance/AiEventsPanel'
import { CameraFilters } from '../components/surveillance/CameraFilters'
import { CameraWall } from '../components/surveillance/CameraWall'
import { SelectedCameraPanel } from '../components/surveillance/SelectedCameraPanel'
import { SurveillanceControls } from '../components/surveillance/SurveillanceControls'
import { SurveillanceFooter } from '../components/surveillance/SurveillanceFooter'
import { SurveillanceTopBar } from '../components/surveillance/SurveillanceTopBar'
import { cameraMatchesFilter, filterBoxes } from '../components/surveillance/surveillanceUtils'
import { EVENTS_TODAY, SURVEILLANCE_LATENCY_MS, surveillanceEvents } from '../data/surveillanceMock'
import { formatDateTime } from '../utils/format'
import type {
  AiEvent,
  CameraFeed,
  CameraWallFilter,
  CommandCenterSnapshot,
  DetectionFilter,
  GridLayoutMode,
} from '../types'

type LiveSurveillancePageProps = {
  snapshot: CommandCenterSnapshot
  now: Date
}

export function LiveSurveillancePage({ snapshot, now }: LiveSurveillancePageProps) {
  const [selectedId, setSelectedId] = useState(snapshot.cameras[0]?.id ?? 'CAM-01')
  const [paused, setPaused] = useState(false)
  const [pausedAt, setPausedAt] = useState(now)
  const [muted, setMuted] = useState(true)
  const [showOverlays, setShowOverlays] = useState(true)
  const [layout, setLayout] = useState<GridLayoutMode>('wall')
  const [detectionFilter, setDetectionFilter] = useState<DetectionFilter>('all')
  const [cameraFilter, setCameraFilter] = useState<CameraWallFilter>('all')
  const [reviewEvent, setReviewEvent] = useState<AiEvent | null>(null)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const selectedFeedRef = useRef<HTMLDivElement>(null)

  const feedTime = paused ? pausedAt : now
  const criticalCameraIds = useMemo(
    () => new Set(surveillanceEvents.filter((event) => event.severity === 'critical').map((event) => event.cameraId)),
    [],
  )

  const filteredCameras = useMemo(
    () => snapshot.cameras.filter((camera) => cameraMatchesFilter(camera, cameraFilter, criticalCameraIds)),
    [snapshot.cameras, cameraFilter, criticalCameraIds],
  )

  const selectedCamera =
    snapshot.cameras.find((camera) => camera.id === selectedId) ?? snapshot.cameras[0] ?? null

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handlePause() {
    setPaused((current) => {
      if (!current) setPausedAt(now)
      return !current
    })
  }

  async function handleFullscreen() {
    const node = selectedFeedRef.current
    if (!node) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
        return
      }
      await node.requestFullscreen()
    } catch {
      showToast('Fullscreen is not available in this browser session.')
    }
  }

  function handleSnapshot() {
    if (!selectedCamera) return
    showToast(`Snapshot captured · ${selectedCamera.id} ${selectedCamera.name} (simulated)`)
  }

  function handleReviewEvent(event: AiEvent) {
    setSelectedId(event.cameraId)
    setActiveEventId(event.id)
    setReviewEvent(event)
  }

  function boxesFor(camera: CameraFeed) {
    return filterBoxes(camera.boxes, detectionFilter)
  }

  const environmentSummary = snapshot.cameras.map((camera) => ({
    camera,
    visibility: camera.environment === 'Fog' ? 'Reduced' : camera.environment === 'Low Light' ? 'Limited' : 'Clear',
    impact: camera.environment === 'Fog' ? '−12%' : camera.environment === 'Low Light' ? '−16%' : 'Nominal',
  }))

  return (
    <div className="surv-page">
      <SurveillanceTopBar
        sector={snapshot.sector}
        camerasOnline={snapshot.systemHealth.camerasOnline}
        camerasTotal={snapshot.systemHealth.camerasTotal}
        aiEngine={snapshot.systemHealth.aiEngine}
        now={now}
        autoRefresh={!paused}
      />

      <CameraFilters value={cameraFilter} onChange={setCameraFilter} />

      <SurveillanceControls
        cameras={snapshot.cameras}
        selectedId={selectedId}
        paused={paused}
        muted={muted}
        showOverlays={showOverlays}
        layout={layout}
        detectionFilter={detectionFilter}
        onTogglePause={handlePause}
        onSnapshot={handleSnapshot}
        onFullscreen={handleFullscreen}
        onToggleMute={() => setMuted((value) => !value)}
        onLayout={setLayout}
        onToggleOverlays={() => setShowOverlays((value) => !value)}
        onDetectionFilter={setDetectionFilter}
        onSelectCamera={setSelectedId}
      />

      <section className="surv-awareness" aria-label="Environment awareness">
        <div className="surv-awareness-title">
          <span className="eyebrow">Environment awareness</span>
          <strong>Model confidence context</strong>
        </div>
        <div className="surv-awareness-items">
          {environmentSummary.map(({ camera, visibility, impact }) => (
            <div key={camera.id} className="surv-awareness-item">
              <span className={`environment-dot env-dot-${camera.environment.toLowerCase().replace(/[^a-z]+/g, '-')}`} />
              <span className="mono">{camera.id}</span>
              <span>{camera.environment}</span>
              <span className="muted">{visibility} visibility</span>
              <strong className={impact === 'Nominal' ? 'confidence-nominal' : 'confidence-reduced'}>
                AI {impact === 'Nominal' ? 'nominal' : `${impact} confidence`}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <div className="surv-workspace">
        <div className="surv-main">
          <section className="panel surv-wall-panel">
            <header className="panel-header">
              <div>
                <h2>Surveillance wall</h2>
                <p className="panel-subtitle">
                  CSS-simulated CCTV scenes with prototype AI overlays. Feeds are not live cameras.
                </p>
              </div>
            </header>
            <div className="surv-decision-rail" aria-label="AI decision flow">
              <span className="is-complete">Object detected</span>
              <i />
              <span className="is-complete">Object tracked</span>
              <i />
              <span className="is-complete">Zone / environment check</span>
              <i />
              <span>Risk assessed</span>
              <i />
              <span>Event generated</span>
              <i />
              <span>Operator review</span>
            </div>
            <CameraWall
              cameras={filteredCameras}
              selectedId={selectedId}
              now={feedTime}
              paused={paused}
              muted={muted}
              showOverlays={showOverlays}
              layout={layout}
              boxesFor={boxesFor}
              activeEventId={activeEventId}
              activeTrackId={activeEventId ? snapshot.cameras.find((camera) => camera.id === selectedId)?.boxes.find((box) => box.kind === 'person')?.trackId : undefined}
              onSelect={(camera) => setSelectedId(camera.id)}
              selectedFeedRef={selectedFeedRef}
            />
          </section>
          {selectedCamera ? <SelectedCameraPanel camera={selectedCamera} /> : null}
        </div>
        <AiEventsPanel events={surveillanceEvents} activeEventId={activeEventId} onReview={handleReviewEvent} />
      </div>

      <SurveillanceFooter
        snapshot={snapshot}
        eventsToday={EVENTS_TODAY}
        latencyMs={SURVEILLANCE_LATENCY_MS}
      />

      {toast ? <div className="surv-toast">{toast}</div> : null}

      {reviewEvent ? (
        <DetailDrawer
          title={reviewEvent.name}
          subtitle={reviewEvent.id}
          onClose={() => setReviewEvent(null)}
        >
          <dl className="detail-list">
            <div>
              <dt>Severity</dt>
              <dd>
                <SeverityBadge severity={reviewEvent.severity} />
              </dd>
            </div>
            <div>
              <dt>Camera</dt>
              <dd className="mono">{reviewEvent.cameraName}</dd>
            </div>
            <div>
              <dt>Timestamp</dt>
              <dd>{formatDateTime(reviewEvent.timestamp)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={reviewEvent.status} />
              </dd>
            </div>
          </dl>
          <p className="lede">{reviewEvent.detail}</p>
          <p className="lede">
            Detection does not establish identity, intent, or guilt. An unverified person is not treated as a
            confirmed threat.
          </p>
        </DetailDrawer>
      ) : null}
    </div>
  )
}
