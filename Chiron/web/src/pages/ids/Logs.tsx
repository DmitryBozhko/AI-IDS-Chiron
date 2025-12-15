import React, { useEffect, useState } from 'react'
import { idsLogs, idsExportLogs } from '../../services/idsApi'

interface LogEntry {
  id: string
  ts: string
  ip: string
  type: string
  label: string
  severity?: string
  kind?: string
}

const IDSLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await idsLogs({ limit: 200 })
      const items = Array.isArray(data) ? data : data.items || []
      setLogs(items)
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setError(null)
      await idsExportLogs({}, format)
    } catch (e: any) {
      setError(e?.error || e?.message || 'Failed to export logs')
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const formatDate = (ts: string) => {
    if (!ts) return ''
    return ts.split('T')[0]
  }

  const formatTime = (ts: string) => {
    if (!ts) return ''
    const timePart = ts.split('T')[1]
    return timePart ? timePart.slice(0, 5) : ''
  }

  const getSeverityBadgeClass = (severity?: string) => {
    if (!severity) return 'low'
    const lower = severity.toLowerCase()
    if (lower === 'critical' || lower === 'high') return 'high'
    if (lower === 'medium') return 'medium'
    return 'low'
  }

  return (
    <div className="ids-layout-shell">
      <div className="ids-view-header">
        <div>
          <h1>Log History</h1>
          <p>List of recent events</p>
        </div>
        <div className="ids-actions-row">
          <button className="ids-btn" onClick={() => handleExport('csv')}>
            Export CSV
          </button>
          <button className="ids-btn" onClick={() => handleExport('json')}>
            Export JSON
          </button>
        </div>
      </div>
      {error && (
        <div className="ids-alert-banner" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}
      <section className="ids-surface ids-table-card ids-fade-in" style={{ animationDelay: '0s' }}>
        {loading && logs.length === 0 ? (
          <div className="ids-small">Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>IP</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="ids-small" style={{ textAlign: 'center', padding: '18px' }}>
                      No events yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="ids-small">{formatDate(log.ts)}</td>
                      <td className="ids-small">{formatTime(log.ts)}</td>
                      <td className="ids-mono" style={{ color: 'var(--ids-accent)' }}>{log.ip}</td>
                      <td style={{ textTransform: 'capitalize' }}>{log.type}</td>
                      <td>
                        {log.severity ? (
                          <span className={`ids-badge ${getSeverityBadgeClass(log.severity)}`}>
                            {log.severity}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{log.label || log.kind || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

export default IDSLogs
