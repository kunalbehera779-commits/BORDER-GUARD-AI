import { useEffect, useMemo, useState } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { CameraPanel } from './components/dashboard/CameraPanel'
import { DetailDrawer } from './components/shared/DetailDrawer'
import { SeverityBadge, StatusBadge } from './components/shared/Badges'
import { mockSnapshot } from './data/mock'
import { AlertsPage } from './pages/AlertsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { CamerasPage } from './pages/CamerasPage'
import { DashboardPage } from './pages/DashboardPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { LiveSurveillancePage } from './pages/LiveSurveillancePage'
import { PersonnelPage } from './pages/PersonnelPage'
import { SettingsPage } from './pages/SettingsPage'
import { VehiclesPage } from './pages/VehiclesPage'
import { getAlerts, getCameras, getDetectionEvents, getIncidents } from './services/api'
import { formatDateTime } from './utils/format'
import type { AiEvent, Alert, CameraFeed, CommandCenterSnapshot, NavView } from './types'
import './App.css'

function App() {
  const [view, setView] = useState<NavView>('dashboard')
  const [now, setNow] = useState(() => new Date())
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [snapshot, setSnapshot] = useState<CommandCenterSnapshot>(mockSnapshot)
  const [detectionEvents, setDetectionEvents] = useState<AiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadLiveData() {
      try {
        const [cameras, alerts, incidents, events] = await Promise.all([
          getCameras(),
          getAlerts(),
          getIncidents(),
          getDetectionEvents(),
        ])

        if (cancelled) return

        setSnapshot({
          ...mockSnapshot,
          cameras,
          alerts,
          incidents,
        })
        setDetectionEvents(events)
        setApiError(null)
      } catch (error) {
        if (!cancelled) {
          console.warn('Failed to load live backend data, using fallback mock data:', error)
          setApiError('Live backend data is currently unavailable. Showing cached prototype data.')
          setSnapshot(mockSnapshot)
          setDetectionEvents([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadLiveData()

    return () => {
      cancelled = true
    }
  }, [])

  const unreadCount = useMemo(
    () => snapshot.alerts.filter((alert) => alert.status === 'open').length,
    [snapshot.alerts],
  )

  const relatedIncident = selectedAlert
    ? snapshot.incidents.find((incident) => incident.cameraId === selectedAlert.cameraId)
    : null

  function handleViewIncident(alert: Alert) {
    setSelectedAlert(alert)
    setView('incidents')
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={view} onNavigate={setView} />
      <div className="app-main">
        <Header
          snapshot={snapshot}
          now={now}
          unreadCount={unreadCount}
          onOpenAlerts={() => setView('alerts')}
        />
        <main className="content">
          {loading ? <div className="lede" style={{ padding: '0.75rem 0' }}>Loading live border surveillance data…</div> : null}
          {apiError ? <div className="lede" style={{ padding: '0.75rem 0', color: '#f5c3c3' }}>{apiError}</div> : null}
          {view === 'dashboard' && (
            <DashboardPage
              snapshot={snapshot}
              now={now}
              onViewCamera={setSelectedCamera}
              onSelectAlert={setSelectedAlert}
              onViewIncident={handleViewIncident}
            />
          )}
          {view === 'surveillance' && (
            <LiveSurveillancePage snapshot={snapshot} now={now} detectionEvents={detectionEvents} />
          )}
          {view === 'alerts' && (
            <AlertsPage
              snapshot={snapshot}
              onSelectAlert={setSelectedAlert}
              onViewIncident={handleViewIncident}
            />
          )}
          {view === 'incidents' && <IncidentsPage snapshot={snapshot} />}
          {view === 'cameras' && <CamerasPage snapshot={snapshot} onViewCamera={setSelectedCamera} />}
          {view === 'personnel' && <PersonnelPage snapshot={snapshot} />}
          {view === 'vehicles' && <VehiclesPage snapshot={snapshot} />}
          {view === 'analytics' && <AnalyticsPage snapshot={snapshot} />}
          {view === 'settings' && <SettingsPage />}
        </main>
      </div>

      {selectedCamera ? (
        <DetailDrawer
          title={`${selectedCamera.id} ${selectedCamera.name}`}
          subtitle={`${selectedCamera.sector} · AI ${selectedCamera.aiStatus}`}
          onClose={() => setSelectedCamera(null)}
        >
          <CameraPanel camera={selectedCamera} now={now} />
          <p className="lede">
            Feed is simulated for this prototype. Bounding boxes represent model output for
            predefined event classes and require operator confirmation.
          </p>
        </DetailDrawer>
      ) : null}

      {selectedAlert ? (
        <DetailDrawer
          title={selectedAlert.title}
          subtitle={selectedAlert.id}
          onClose={() => setSelectedAlert(null)}
        >
          <dl className="detail-list">
            <div>
              <dt>Severity</dt>
              <dd>
                <SeverityBadge severity={selectedAlert.severity} />
              </dd>
            </div>
            <div>
              <dt>Camera</dt>
              <dd>{selectedAlert.cameraName}</dd>
            </div>
            <div>
              <dt>Timestamp</dt>
              <dd>{formatDateTime(selectedAlert.timestamp)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={selectedAlert.status} />
              </dd>
            </div>
            {relatedIncident ? (
              <div>
                <dt>Linked incident</dt>
                <dd>
                  {relatedIncident.id} · {relatedIncident.eventType}
                </dd>
              </div>
            ) : null}
          </dl>
          <p className="lede">
            This event is flagged for review. Detection does not establish identity, intent, or
            guilt.
          </p>
        </DetailDrawer>
      ) : null}
    </div>
  )
}

export default App
