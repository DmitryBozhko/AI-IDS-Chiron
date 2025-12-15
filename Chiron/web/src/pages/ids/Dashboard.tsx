import React, { useEffect, useState } from 'react'
import { idsStats, idsAlerts, idsDevices, idsStartDeviceScan, idsDeviceScanStatus } from '../../services/idsApi'

interface Stats {
  counts: {
    alerts_200?: number
    blocks_200?: number
  }
  ts?: string
}

interface Alert {
  id: string
  ts: string
  src_ip: string
  label: string
  severity: string
  kind: string
}

interface Device {
  ip: string
  first_seen?: string
  last_seen?: string
  name?: string
  open_ports?: string
  risk?: string
}

interface ScanInfo {
  status: string
  progress: number
  done: number
  targets: number
}

const IDSDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanInfo, setScanInfo] = useState<ScanInfo | null>(null)
  const [scanCompleteHold, setScanCompleteHold] = useState(false)
  const unknownDevices = devices.filter(d => !d?.name).length
  const alertCount = stats?.counts?.alerts_200 ?? 0
  const blockCount = stats?.counts?.blocks_200 ?? 0
  const scanProgress = scanInfo ? Math.min(100, Math.max(0, scanInfo.progress)) : 0

  let scanStatus = 'idle'
  let scanStatusText = 'Idle'
  let scanDotClass = 'is-idle'

  if (scanCompleteHold) {
    scanStatus = 'done'
    scanStatusText = 'Scan complete!'
    scanDotClass = 'is-done'
  } else if (scanning) {
    scanStatus = 'running'
    scanStatusText = 'Scanning network...'
    scanDotClass = 'is-running'
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [statsData, alertsData, devicesData] = await Promise.all([
        idsStats(),
        idsAlerts(5),
        idsDevices(),
      ])
      setStats(statsData)
      setAlerts(Array.isArray(alertsData) ? alertsData : alertsData.items || [])
      setDevices(Array.isArray(devicesData) ? devicesData : devicesData.items || [])
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const checkScanStatus = async () => {
    try {
      const data = await idsDeviceScanStatus()
      if (data?.scan) {
        setScanInfo(data.scan)
        const isRunning = data.scan.status === 'running'
        setScanning(isRunning)
        if (!isRunning && scanning && data.scan.progress === 100) {
          setScanCompleteHold(true)
          setTimeout(() => {
            setScanCompleteHold(false)
          }, 3500)
        }
        return isRunning
      }
      return false
    } catch (e) {
      return false
    }
  }

  const startScan = async () => {
    try {
      setScanning(true)
      setScanCompleteHold(false)
      await idsStartDeviceScan()
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to start scan')
      setScanning(false)
    }
  }

  useEffect(() => {
    loadData()
    checkScanStatus()
  }, [])

  useEffect(() => {
    if (!scanning) return
    const interval = setInterval(async () => {
      const stillRunning = await checkScanStatus()
      if (!stillRunning) {
        setScanning(false)
        loadData()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [scanning])

  return (
    <div className="ids-layout-shell">
        <div className="ids-view-header">
          <div>
            <h1>AI-IDS Dashboard</h1>
            <p>Intrusion Detection and Network Security</p>
          </div>
        </div>

        {error && (
          <div className="ids-alert-banner">
            {error}
          </div>
        )}
        <div className="ids-card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div className="ids-surface ids-fade-in" style={{ animationDelay: '0s' }}>
            <div className="ids-small" style={{ marginBottom: '8px' }}>Recent Alerts (200d)</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--ids-danger)' }}>
              {alertCount}
            </div>
          </div>
          <div className="ids-surface ids-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="ids-small" style={{ marginBottom: '8px' }}>Active Blocks (200d)</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--ids-warning)' }}>
              {blockCount}
            </div>
          </div>
          <div className="ids-surface ids-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="ids-small" style={{ marginBottom: '8px' }}>Total Devices</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--ids-accent)' }}>
              {devices.length}
            </div>
          </div>
          <div className="ids-surface ids-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="ids-small" style={{ marginBottom: '8px' }}>Unknown Devices</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--ids-warning)' }}>
              {unknownDevices}
            </div>
          </div>
        </div>
        <div className="ids-surface ids-scan-status-card ids-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="ids-scan-status-card__meta">
            <div className="ids-scan-status-card__status">
              <div className={`ids-scan-status-card__dot ${scanDotClass}`}></div>
              <div className="ids-scan-status-card__text">
                <div className="ids-scan-status-card__label">Network Scanner</div>
                <div className="ids-scan-status-card__status-text">{scanStatusText}</div>
              </div>
            </div>
            {scanInfo && (
              <div className="ids-scan-status-card__time">
                <div className="ids-small">
                  {scanInfo.done} / {scanInfo.targets} targets
                </div>
              </div>
            )}
          </div>
          {(scanning || scanCompleteHold) && (
            <div className="ids-scan-status-card__progress">
              <div className="ids-progress-bar">
                <div
                  className={`ids-progress-bar__fill ${scanCompleteHold ? 'ids-progress-bar__fill--complete' : 'ids-progress-bar__fill--active'}`}
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <div className="ids-small">{Math.round(scanProgress)}%</div>
            </div>
          )}
          <div className="ids-actions-row">
            <button
              onClick={startScan}
              disabled={scanning || scanCompleteHold}
              className="ids-btn ids-btn--primary"
            >
              {scanning || scanCompleteHold ? 'Scanning...' : 'Start Network Scan'}
            </button>
          </div>
        </div>
        <div className="ids-surface ids-fade-in" style={{ animationDelay: '0.5s', marginTop: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.25rem', color: 'var(--ids-fg)' }}>Recent Alerts</h2>
          {loading ? (
            <div className="ids-small">Loading...</div>
          ) : alerts.length === 0 ? (
            <div className="ids-small">No recent alerts</div>
          ) : (
            <ul className="ids-recent-alerts">
              {alerts.map((alert) => (
                <li key={alert.id} className="ids-recent-alert">
                  <div className="ids-recent-alert__top">
                    <span className="ids-recent-alert__ip ids-mono">{alert.src_ip}</span>
                    <span className={`ids-badge ${alert.severity}`}>{alert.severity}</span>
                  </div>
                  <div className="ids-recent-alert__label">{alert.label}</div>
                  <div className="ids-recent-alert__time">
                    {new Date(alert.ts).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="ids-surface ids-table-card ids-fade-in" style={{ animationDelay: '0.6s', marginTop: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.25rem', color: 'var(--ids-fg)' }}>
            Detected Devices ({devices.length})
          </h2>
          {loading ? (
            <div className="ids-small">Loading...</div>
          ) : devices.length === 0 ? (
            <div className="ids-small">No devices detected.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Device Name</th>
                    <th>Last Seen</th>
                    <th>Open Ports</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.slice(0, 10).map((device, idx) => (
                    <tr key={idx}>
                      <td className="ids-mono" style={{ color: 'var(--ids-accent)' }}>{device.ip}</td>
                      <td>{device.name || <span className="ids-small">Unknown</span>}</td>
                      <td className="ids-small">
                        {device.last_seen ? new Date(device.last_seen).toLocaleString() : '—'}
                      </td>
                      <td className="ids-small">{device.open_ports || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  )
}

export default IDSDashboard
