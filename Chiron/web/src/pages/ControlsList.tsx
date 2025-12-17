import { Link } from 'react-router-dom'
import type { Control } from '../types'

export default function ControlsList({ controls }: { controls: Control[] }) {
  return (
    <>
      <div className="toolbar">
        <h1 style={{ marginRight: 'auto' }}>Controls</h1>
        <button className="chip">All families</button>
        <button className="chip">Compliance</button>
        <button className="chip">Type</button>
        <button className="btn" style={{ marginLeft: 'auto' }}>Reset filters</button>
      </div>

      <div className="table">
        <div className="table__head">
          <div>Title</div>
          <div>Timestamp</div>
          <div>Category</div>
          <div>Compliance</div>
          <div></div>
        </div>

        {controls.map((c) => (
          <div className="table__row" key={c.id}>
            <div>
              <div className="table__cell--title">{c.code} — {c.title}</div>
              <div className="table__cell--sub">{c.description ?? '—'}</div>
            </div>

            <div className="table__cell--sub">—</div>
            <div className="table__cell--sub">{c.family ?? '—'}</div>
            <div><StatusBadge status={c.status} /></div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to={`/controls/${encodeURIComponent(c.id)}`} className="btn">›</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function StatusBadge({ status }: { status: Control['status'] }) {
  const label = !status
    ? 'unanswered'
    : status === 'fully_implemented'
    ? 'fully implemented'
    : status === 'partially_implemented'
    ? 'partially implemented'
    : status === 'not_implemented'
    ? 'not implemented'
    : 'unanswered'

  const cls = !status
    ? 'badge--muted'
    : status === 'fully_implemented'
    ? 'badge--ok'
    : status === 'partially_implemented'
    ? 'badge--warn'
    : status === 'not_implemented'
    ? 'badge--bad'
    : 'badge--muted'

  return <span className={`badge ${cls}`}>{label}</span>
}
