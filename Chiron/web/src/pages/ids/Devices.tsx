import React, { useEffect, useState } from 'react'
import { idsDevices, idsStartDeviceScan, idsDeviceScanStatus } from '../../services/idsApi'

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

const IDSDevices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanInfo, setScanInfo] = useState<ScanInfo | null>(null)
  const [scanCompleteHold, setScanCompleteHold] = useState(false)
  const loadDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await idsDevices()
      setDevices(Array.isArray(data) ? data : data.items || [])
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to load devices')
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
      setError(null)
      await idsStartDeviceScan()
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to start scan')
      setScanning(false)
    }
  }

  useEffect(() => {
    loadDevices()
    checkScanStatus()
  }, [])

  useEffect(() => {
    if (!scanning) return
    const interval = setInterval(async () => {
      const stillRunning = await checkScanStatus()
      if (!stillRunning) {
        setScanning(false)
        loadDevices()
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [scanning])

  const scanProgress = scanInfo ? Math.min(100, Math.max(0, scanInfo.progress)) : 0

  let scanStatusText = 'Idle'
  let scanDotClass = 'is-idle'

  if (scanCompleteHold) {
    scanStatusText = 'Scan complete!'
    scanDotClass = 'is-done'
  } else if (scanning) {
    scanStatusText = 'Scanning network...'
    scanDotClass = 'is-running'
  }

  return (
    <div className="ids-layout-shell">
      <div className="ids-view-header">
          <div>
            <h1>Network Devices</h1>
            <p>Discover and monitor devices on your network</p>
          </div>
        </div>
        {error && (
          <div className="ids-alert-banner" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}
        <div className="ids-surface ids-scan-status-card ids-fade-in" style={{ animationDelay: '0s' }}>
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
        <div className="ids-surface ids-table-card ids-fade-in" style={{ animationDelay: '0.1s', marginTop: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.25rem', color: 'var(--ids-fg)' }}>
            Detected Devices ({devices.length})
          </h2>
          {loading ? (
            <div className="ids-small">Loading devices...</div>
          ) : devices.length === 0 ? (
            <div className="ids-small">No devices found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Device Name</th>
                    <th>First Seen</th>
                    <th>Last Seen</th>
                    <th>Open Ports</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device, idx) => (
                    <tr key={idx}>
                      <td className="ids-mono" style={{ color: 'var(--ids-accent)' }}>{device.ip}</td>
                      <td>{device.name || <span className="ids-small">Unknown</span>}</td>
                      <td className="ids-small">
                        {device.first_seen ? new Date(device.first_seen).toLocaleString() : '—'}
                      </td>
                      <td className="ids-small">
                        {device.last_seen ? new Date(device.last_seen).toLocaleString() : '—'}
                      </td>
                      <td className="ids-mono ids-small">{device.open_ports || '—'}</td>
                      <td>
                        {device.risk && (
                          <span className={`ids-badge ${device.risk}`}>
                            {device.risk}
                          </span>
                        )}
                      </td>
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

export default IDSDevices
