import type { Control } from '../types'
import { buildWeightMap, controlContribution } from '../scoring'

interface FamilyAggregate {
  family: string
  score: number
  max: number
}

interface WeightedModel {
  total: number
  positives: number
  negatives: number
  max: number
  totalControls: number
  byFamily: FamilyAggregate[]
}

export default function SprScore({ controls }: { controls: Control[] }) {
  const model = buildWeightedModel(controls)
  const pct = model.max > 0 ? Math.round((model.total / model.max) * 100) : 0

  return (
    <>
      <div className="toolbar">
        <h1 style={{ marginRight: 'auto' }}>SPR Score (Weighted, Prototype)</h1>
      </div>

      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'minmax(280px, 420px) 1fr',
        }}
      >
        <div className="card card--padded">
          <ScoreBadge score={model.total} max={model.max} min={-model.max} pct={pct} />
          <ul style={{ marginTop: '1rem', color: 'var(--muted)' }}>
            <li>Total controls: {model.totalControls}</li>
            <li>Weighted max: {model.max.toFixed(1)}</li>
            <li>Weighted min: {-model.max.toFixed(1)}</li>
            <li>
              Positives: {model.positives.toFixed(1)} | Negatives: {model.negatives.toFixed(1)}
            </li>
          </ul>
        </div>

        <div className="card card--padded">
          <h3 style={{ marginBottom: '.75rem' }}>By Family (Weighted)</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {model.byFamily.map((fam) => (
              <Bar key={fam.family} label={fam.family} value={fam.score} max={fam.max} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

function ScoreBadge({ score, max, min, pct }: { score: number; max: number; min: number; pct: number }) {
  const tone = score >= 0 ? 'var(--success)' : 'var(--danger)'
  return (
    <div>
      <div style={{ fontSize: '.875rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Weighted Score</div>
      <div style={{ fontSize: '2.25rem', fontWeight: 700, color: tone }}>
        {score.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--muted)' }}>({pct}% of max)</span>
      </div>
      <div style={{ color: 'var(--muted)' }}>Range {min.toFixed(1)} to {max.toFixed(1)}</div>
    </div>
  )
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (Math.abs(value) / max) * 100)) : 0
  const barColor = value >= 0 ? 'var(--success)' : 'var(--danger)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <strong>{label}</strong>
        <span style={{ color: 'var(--muted)' }}>{value.toFixed(1)} / {max.toFixed(1)}</span>
      </div>
      <div style={{ height: 10, background: 'rgba(140,149,161,.25)', borderRadius: 999 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: barColor }} />
      </div>
    </div>
  )
}

function buildWeightedModel(controls: Control[]): WeightedModel {
  const weightMap = buildWeightMap(controls)
  const familyTotals = new Map<string, { score: number; max: number }>()
  let total = 0
  let positives = 0
  let negatives = 0
  let max = 0

  for (const control of controls) {
    const weight = weightMap.get(control.code) ?? 1
    const contribution = controlContribution(control, weight)

    max += weight
    total += contribution
    if (contribution > 0) positives += contribution
    if (contribution < 0) negatives += contribution

    const family = control.family ?? '—'
    const agg = familyTotals.get(family) ?? { score: 0, max: 0 }
    agg.score += contribution
    agg.max += weight
    familyTotals.set(family, agg)
  }

  const byFamily = Array.from(familyTotals.entries())
    .map(([family, agg]) => ({ family, score: agg.score, max: agg.max }))
    .sort((a, b) => a.family.localeCompare(b.family))

  return {
    total,
    positives,
    negatives,
    max,
    totalControls: controls.length,
    byFamily,
  }
}
