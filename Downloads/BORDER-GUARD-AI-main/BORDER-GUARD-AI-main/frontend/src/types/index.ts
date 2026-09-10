export type NavView =
  | 'dashboard'
  | 'surveillance'
  | 'alerts'
  | 'incidents'
  | 'cameras'
  | 'personnel'
  | 'vehicles'
  | 'analytics'
  | 'settings'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'reviewing'

export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed'

export type CameraStatus = 'online' | 'offline' | 'degraded'

export type DetectionKind = 'person' | 'vehicle' | 'animal' | 'anpr' | 'aerial' | 'other'

export type EnvironmentCondition = 'Daylight' | 'Low Light' | 'Fog' | 'Rain' | 'Dust/Haze'

export type DetectionLabel = {
  type: string
  confidence: number
  trackId?: string
  kind?: DetectionKind
}

export type BoundingBox = {
  id: string
  label: string
  confidence: number
  trackId?: string
  kind?: DetectionKind
  top: string
  left: string
  width: string
  height: string
}

export type CameraFeed = {
  id: string
  name: string
  sector: string
  status: CameraStatus
  aiStatus: 'active' | 'standby' | 'offline'
  scene: 'gate' | 'river' | 'checkpoint' | 'hill'
  streamUrl?: string
  streamType?: string
  feedType?: string
  detections: DetectionLabel[]
  boxes: BoundingBox[]
  signalQuality: number
  resolution: string
  fps: number
  environment: EnvironmentCondition
  currentEvent: string | null
  virtualFence: boolean
  fenceBreached: boolean
}

export type AiEvent = {
  id: string
  severity: Severity
  name: string
  cameraId: string
  cameraName: string
  timestamp: string
  confidence: number
  status: AlertStatus
  detail: string
}

export type DetectionFilter = 'all' | DetectionKind
export type CameraWallFilter = 'all' | 'online' | 'offline' | 'critical' | 'ai-active'
export type GridLayoutMode = 'wall' | 'focus' | 'strip'

export type Alert = {
  id: string
  title: string
  severity: Severity
  cameraId: string
  cameraName: string
  timestamp: string
  status: AlertStatus
}

export type Incident = {
  id: string
  eventType: string
  cameraId: string
  cameraName: string
  severity: Severity
  timestamp: string
  status: IncidentStatus
}

export type Personnel = {
  id: string
  name: string
  rank: string
  post: string
  status: 'on-duty' | 'standby' | 'off-duty'
}

export type VehicleRecord = {
  id: string
  plate: string
  type: string
  lastSeen: string
  cameraName: string
  status: 'cleared' | 'review'
}

export type SystemHealth = {
  camerasOnline: number
  camerasTotal: number
  aiEngine: 'operational' | 'degraded' | 'offline'
  storagePercent: number
  network: 'stable' | 'degraded' | 'offline'
  lastModelUpdate: string
}

export type QuickStats = {
  peopleDetectedToday: number
  vehiclesDetectedToday: number
  virtualFenceBreaches: number
  anprDetections: number
  incidentsResolved: number
}

export type ThreatSummary = {
  critical: number
  high: number
  medium: number
  low: number
}

export type CommandCenterSnapshot = {
  sector: string
  systemStatus: 'operational' | 'degraded' | 'alert'
  lastSync: string
  threatSummary: ThreatSummary
  cameras: CameraFeed[]
  alerts: Alert[]
  incidents: Incident[]
  personnel: Personnel[]
  vehicles: VehicleRecord[]
  systemHealth: SystemHealth
  quickStats: QuickStats
}
