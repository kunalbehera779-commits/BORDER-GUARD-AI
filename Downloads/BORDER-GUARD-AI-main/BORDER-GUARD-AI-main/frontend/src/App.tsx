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
import { apiService } from './services/api'
import type { Alert, CameraFeed, NavView } from './types'
import './App.css'

import { sortCamerasPrioritized } from './utils/cameraUtils'

function App() {
  const [view, setView] = useState<NavView>('dashboard')
  const [now, setNow] = useState(() => new Date())
  const [snapshot, setSnapshot] = useState(mockSnapshot)
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const refreshCameras = async () => {
    const [realCams, realAlerts, realIncidents] = await Promise.all([
      apiService.getCameras(),
      apiService.getAlerts(),
      apiService.getIncidents()
    ])

    const formattedCams: CameraFeed[] = (realCams || []).map((c) => ({
      id: c.id,
      name: c.name,
      sector: c.sector,
      status: c.status as any,
      aiStatus: c.ai_status as any,
      fps: c.fps || 25,
      latencyMs: c.latency_ms || 18,
      resolution: c.resolution || '1080p',
      feedType: c.stream_type.toUpperCase(),
      streamUrl: c.stream_url,
      streamType: c.stream_type,
      model: 'BORDER-GUARD YOLOv8',
      lastAlert: 'Feed active',
      scene: 'checkpoint',
      environment: 'Clear',
      signalQuality: 98,
      detections: [],
      boxes: []
    }))
    const sortedCams = sortCamerasPrioritized(formattedCams)

    const formattedAlerts: Alert[] = (realAlerts || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      cameraName: a.camera_name || a.camera_id,
      cameraId: a.camera_id,
      severity: a.severity || 'high',
      timestamp: new Date(a.timestamp || Date.now()),
      status: a.status || 'open',
      acknowledged: a.status !== 'open'
    }))

    const formattedIncidents: Incident[] = (realIncidents || []).map((i: any) => ({
      id: i.id,
      title: i.title,
      eventType: i.event_type || 'Perimeter Security Event',
      cameraName: i.camera_id || 'System',
      cameraId: i.camera_id,
      severity: i.severity || 'high',
      timestamp: new Date(i.timestamp || Date.now()),
      status: i.status || 'open',
      operatorNotes: i.notes || ''
    }))

    const activeAlertsList = formattedAlerts.length > 0 ? formattedAlerts : snapshot.alerts
    const counts = { critical: 0, high: 0, medium: 0, low: 0 }
    activeAlertsList.forEach((a) => {
      const s = (a.severity || 'low').toLowerCase()
      if (s === 'critical') counts.critical++
      else if (s === 'high') counts.high++
      else if (s === 'medium') counts.medium++
      else counts.low++
    })

    setSnapshot((prev) => ({
      ...prev,
      cameras: sortedCams,
      alerts: formattedAlerts.length > 0 ? formattedAlerts : prev.alerts,
      incidents: formattedIncidents.length > 0 ? formattedIncidents : prev.incidents,
      threatSummary: counts
    }))
  }

  // Sync real camera feeds, alerts, and incidents from backend on load
  useEffect(() => {
    refreshCameras()

    let ws: WebSocket | null = null
    try {
      ws = new WebSocket('ws://localhost:8000/ws/alerts')
      ws.onmessage = (evt) => {
        try {
          const newAlertData = JSON.parse(evt.data)
          if (newAlertData && newAlertData.id) {
            const formatted: Alert = {
              id: newAlertData.id,
              title: newAlertData.title,
              cameraName: newAlertData.camera_name || newAlertData.camera_id,
              cameraId: newAlertData.camera_id,
              severity: newAlertData.severity || 'high',
              timestamp: new Date(newAlertData.timestamp || Date.now()),
              status: newAlertData.status || 'open',
              acknowledged: false
            }
            setSnapshot((prev) => {
              const updatedAlerts = [formatted, ...prev.alerts]
              const counts = { critical: 0, high: 0, medium: 0, low: 0 }
              updatedAlerts.forEach((a) => {
                const s = (a.severity || 'low').toLowerCase()
                if (s === 'critical') counts.critical++
                else if (s === 'high') counts.high++
                else if (s === 'medium') counts.medium++
                else counts.low++
              })
              return {
                ...prev,
                alerts: updatedAlerts,
                threatSummary: counts
              }
            })
          }
        } catch (e) {}
      }
    } catch (e) {}

    return () => {
      if (ws) ws.close()
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
          {view === 'dashboard' && (
            <DashboardPage
              snapshot={snapshot}
              now={now}
              onViewCamera={setSelectedCamera}
              onSelectAlert={setSelectedAlert}
              onViewIncident={handleViewIncident}
              onRefreshCameras={refreshCameras}
            />
          )}
          {view === 'surveillance' && (
            <LiveSurveillancePage
              snapshot={snapshot}
              now={now}
              onRefreshCameras={refreshCameras}
            />
          )}
          {view === 'alerts' && (
            <AlertsPage
              snapshot={snapshot}
              onSelectAlert={setSelectedAlert}
              onViewIncident={handleViewIncident}
            />
          )}
          {view === 'incidents' && <IncidentsPage snapshot={snapshot} />}
          {view === 'cameras' && (
            <CamerasPage
              snapshot={snapshot}
              onViewCamera={setSelectedCamera}
              onRefreshCameras={refreshCameras}
            />
          )}
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
          <CameraPanel camera={selectedCamera} now={now} onRefreshCameras={refreshCameras} />
          <p className="lede">
            Live stream from camera endpoint with automated YOLO threat detection and virtual fence tracking.
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
            This event is flagged for review. Detection does not establish identity, intent, or guilt.
          </p>
        </DetailDrawer>
      ) : null}
    </div>
  )
}

export default App
