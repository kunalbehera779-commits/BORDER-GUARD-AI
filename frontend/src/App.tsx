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
import { formatDateTime } from './utils/format'
import type { Alert, CameraFeed, NavView } from './types'
import './App.css'

function App() {
  const [view, setView] = useState<NavView>('dashboard')
  const [now, setNow] = useState(() => new Date())
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const unreadCount = useMemo(
    () => mockSnapshot.alerts.filter((alert) => alert.status === 'open').length,
    [],
  )

  const relatedIncident = selectedAlert
    ? mockSnapshot.incidents.find((incident) => incident.cameraId === selectedAlert.cameraId)
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
          snapshot={mockSnapshot}
          now={now}
          unreadCount={unreadCount}
          onOpenAlerts={() => setView('alerts')}
        />
        <main className="content">
          {view === 'dashboard' && (
            <DashboardPage
              snapshot={mockSnapshot}
              now={now}
              onViewCamera={setSelectedCamera}
              onSelectAlert={setSelectedAlert}
              onViewIncident={handleViewIncident}
            />
          )}
          {view === 'surveillance' && <LiveSurveillancePage snapshot={mockSnapshot} now={now} />}
          {view === 'alerts' && (
            <AlertsPage
              snapshot={mockSnapshot}
              onSelectAlert={setSelectedAlert}
              onViewIncident={handleViewIncident}
            />
          )}
          {view === 'incidents' && <IncidentsPage snapshot={mockSnapshot} />}
          {view === 'cameras' && (
            <CamerasPage snapshot={mockSnapshot} onViewCamera={setSelectedCamera} />
          )}
          {view === 'personnel' && <PersonnelPage snapshot={mockSnapshot} />}
          {view === 'vehicles' && <VehiclesPage snapshot={mockSnapshot} />}
          {view === 'analytics' && <AnalyticsPage snapshot={mockSnapshot} />}
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
