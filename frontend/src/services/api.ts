import { mockSnapshot } from '../data/mock'
import { surveillanceEvents } from '../data/surveillanceMock'
import type { AiEvent, Alert, CameraFeed, CommandCenterSnapshot, Incident } from '../types'

const API_BASE = 'http://localhost:8000'

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as T
}

const fallbackCamera = (cameraId: string) =>
  mockSnapshot.cameras.find((camera) => camera.id === cameraId)

function mapCamera(camera: Partial<CameraFeed> & { id: string; name: string }): CameraFeed {
  const fallback = fallbackCamera(camera.id)

  return {
    id: camera.id,
    name: camera.name,
    sector: camera.sector ?? fallback?.sector ?? 'Sector Alpha',
    status: camera.status ?? fallback?.status ?? 'online',
    aiStatus: camera.aiStatus ?? fallback?.aiStatus ?? 'active',
    scene: camera.scene ?? fallback?.scene ?? 'gate',
    detections: camera.detections ?? fallback?.detections ?? [],
    boxes: camera.boxes ?? fallback?.boxes ?? [],
    signalQuality: camera.signalQuality ?? fallback?.signalQuality ?? 100,
    resolution: camera.resolution ?? fallback?.resolution ?? '1920×1080',
    fps: camera.fps ?? fallback?.fps ?? 25,
    environment: camera.environment ?? fallback?.environment ?? 'Daylight',
    currentEvent: camera.currentEvent ?? fallback?.currentEvent ?? null,
    virtualFence: camera.virtualFence ?? fallback?.virtualFence ?? false,
    fenceBreached: camera.fenceBreached ?? fallback?.fenceBreached ?? false,
  }
}

export async function getCameras(): Promise<CameraFeed[]> {
  try {
    const data = await fetchJson<Array<Partial<CameraFeed> & { id: string; name: string }>>('/api/cameras')
    return data.map((camera) => mapCamera(camera))
  } catch (error) {
    console.warn('Falling back to mock camera data:', error)
    return mockSnapshot.cameras
  }
}

export async function getAlerts(): Promise<Alert[]> {
  try {
    return await fetchJson<Alert[]>('/api/alerts')
  } catch (error) {
    console.warn('Falling back to mock alert data:', error)
    return mockSnapshot.alerts
  }
}

export async function getIncidents(): Promise<Incident[]> {
  try {
    return await fetchJson<Incident[]>('/api/incidents')
  } catch (error) {
    console.warn('Falling back to mock incident data:', error)
    return mockSnapshot.incidents
  }
}

export async function getDetectionEvents(): Promise<AiEvent[]> {
  try {
    const data = await fetchJson<Array<Partial<AiEvent> & { id: string; name: string }>>('/api/detection-events')
    return data.map((event) => ({
      id: event.id,
      severity: event.severity ?? 'medium',
      name: event.name,
      cameraId: event.cameraId ?? 'CAM-01',
      cameraName: event.cameraName ?? 'CAM-01 North Gate',
      timestamp: event.timestamp ?? new Date().toISOString(),
      confidence: event.confidence ?? 0,
      status: event.status ?? 'open',
      detail: event.detail ?? 'Detection event details unavailable.',
    }))
  } catch (error) {
    console.warn('Falling back to mock detection event data:', error)
    return surveillanceEvents
  }
}

export async function getHealth(): Promise<{ status: string; service: string }> {
  return fetchJson<{ status: string; service: string }>('/health')
}

export function buildSnapshot(
  cameras: CameraFeed[],
  alerts: Alert[],
  incidents: Incident[],
): CommandCenterSnapshot {
  return {
    ...mockSnapshot,
    cameras,
    alerts,
    incidents,
  }
}
