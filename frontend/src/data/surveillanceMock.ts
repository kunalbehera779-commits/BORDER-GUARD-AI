import type { AiEvent } from '../types'

export const surveillanceEvents: AiEvent[] = [
  {
    id: 'EVT-4408',
    severity: 'critical',
    name: 'Possible aerial object in restricted airspace',
    cameraId: 'CAM-04',
    cameraName: 'CAM-04 Hill Sector',
    timestamp: '2026-09-06T09:21:43+05:30',
    confidence: 76,
    status: 'open',
    detail:
      'Simulated detection of a possible aerial object near restricted airspace. Operator review is required. This prototype is not analyzing a live camera.',
  },
  {
    id: 'EVT-4404',
    severity: 'high',
    name: 'Virtual fence breach detected',
    cameraId: 'CAM-02',
    cameraName: 'CAM-02 River Sector',
    timestamp: '2026-09-06T09:20:18+05:30',
    confidence: 87,
    status: 'reviewing',
    detail:
      'An unverified person appears near a restricted-zone overlay on CAM-02. The virtual fence is a visual monitoring aid and cannot physically prevent intrusion.',
  },
  {
    id: 'EVT-4399',
    severity: 'medium',
    name: 'Vehicle entered monitored zone',
    cameraId: 'CAM-01',
    cameraName: 'CAM-01 North Gate',
    timestamp: '2026-09-06T09:19:52+05:30',
    confidence: 81,
    status: 'acknowledged',
    detail:
      'A vehicle was detected entering the North Gate monitored zone. Classification is simulated for this prototype and does not confirm identity or intent.',
  },
  {
    id: 'EVT-4388',
    severity: 'low',
    name: 'Animal detected near perimeter',
    cameraId: 'CAM-03',
    cameraName: 'CAM-03 Checkpoint',
    timestamp: '2026-09-06T09:18:41+05:30',
    confidence: 68,
    status: 'resolved',
    detail:
      'Low-priority wildlife movement near the checkpoint perimeter. Logged for operator awareness only.',
  },
]

export const SURVEILLANCE_LATENCY_MS = 42
export const EVENTS_TODAY = 46
