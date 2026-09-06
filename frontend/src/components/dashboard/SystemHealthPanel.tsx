import { Activity, Camera, Cpu, HardDrive, Wifi } from 'lucide-react'
import { SectionCard } from '../shared/SectionCard'
import type { SystemHealth } from '../../types'

type SystemHealthPanelProps = {
  health: SystemHealth
}

export function SystemHealthPanel({ health }: SystemHealthPanelProps) {
  const cameraOk = health.camerasOnline === health.camerasTotal

  return (
    <SectionCard title="System Health" subtitle="Infrastructure and analytics services">
      <ul className="health-list">
        <li>
          <Camera size={16} />
          <span>CCTV Cameras</span>
          <strong className={cameraOk ? 'ok' : 'warn'}>
            {health.camerasOnline}/{health.camerasTotal} online
          </strong>
        </li>
        <li>
          <Cpu size={16} />
          <span>AI Engine</span>
          <strong className="ok">{health.aiEngine}</strong>
        </li>
        <li>
          <HardDrive size={16} />
          <span>Storage</span>
          <div className="storage">
            <div className="storage-bar">
              <span style={{ width: `${health.storagePercent}%` }} />
            </div>
            <strong>{health.storagePercent}%</strong>
          </div>
        </li>
        <li>
          <Wifi size={16} />
          <span>Network</span>
          <strong className="ok">{health.network}</strong>
        </li>
        <li>
          <Activity size={16} />
          <span>Last model update</span>
          <strong>{health.lastModelUpdate}</strong>
        </li>
      </ul>
      <div className="health-legend">
        <span>
          <i className="pulse pulse-green" /> Online
        </span>
        <span>
          <i className="dot-offline" /> Offline (2 cameras)
        </span>
      </div>
    </SectionCard>
  )
}
