import { useBusinessContext } from '../context/BusinessContext'

export default function Poams() {
  const { selectedBusiness } = useBusinessContext()

  if (!selectedBusiness) {
    return (
      <div className="card card--padded">
        <p>Select a company to review its plan of action and milestones.</p>
      </div>
    )
  }

  const poams = selectedBusiness.poams ?? []

  if (poams.length === 0) {
    return (
      <div className="card card--padded">
        <h2 style={{ marginTop: 0 }}>POAMs</h2>
        <p style={{ color: 'var(--muted)' }}>No plan of action items are tracked for this company yet.</p>
      </div>
    )
  }

  return (
    <section className="card card--padded" style={{ padding: '1.5rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>POAMs</h2>
          <p style={{ margin: 0, color: 'var(--muted)' }}>{selectedBusiness.name}</p>
        </div>
        <button type="button" disabled style={{ padding: '0.5rem 1rem', cursor: 'not-allowed' }}>
          + New POAM
        </button>
      </header>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: '.85rem', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Title</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Control</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Owner</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Risk</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Due</th>
            </tr>
          </thead>
          <tbody>
            {poams.map(poam => (
              <tr key={poam.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{poam.title}</td>
                <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>{poam.controlId ?? '—'}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{poam.owner ?? 'Unassigned'}</td>
                <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize' }}>{poam.status ? poam.status.replace(/_/g, ' ') : '—'}</td>
                <td style={{ padding: '0.75rem 0.5rem', textTransform: 'capitalize' }}>{poam.riskLevel ?? '—'}</td>
                <td style={{ padding: '0.75rem 0.5rem' }}>{poam.dueDate ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
