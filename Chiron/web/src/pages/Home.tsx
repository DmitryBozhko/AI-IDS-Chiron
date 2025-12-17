import type { Control } from '../types'

type Slice = { label: string; value: number; color: string }

export default function Home({ controls }: { controls: Control[] }) {
  const counts = summarize(controls)
  const slices: Slice[] = [
    { label: 'not implemented', value: counts.notImplemented, color: '#ff5a67' },
    { label: 'partially implemented', value: counts.partiallyImplemented, color: '#ffbf47' },
    { label: 'implemented', value: counts.implemented, color: '#2fbf71' },
    { label: 'unanswered', value: counts.unanswered, color: '#8c95a1' },
  ]
  const total = slices.reduce((a, b) => a + b.value, 0)

  return (
    <>
      <div className="toolbar">
        <h1 style={{marginRight:'auto'}}>Overview</h1>
      </div>

      <section className="card card--padded">
        <div className="chart" style={{ gridTemplateColumns: 'minmax(260px,360px) 1fr' }}>
          <PieChart slices={slices} size={260} innerRadius={80} />
          <Legend slices={slices} total={total} />
        </div>
      </section>
    </>
  )
}

function summarize(controls: Control[]) {
  let implemented = 0, partially = 0, not = 0, unanswered = 0
  for (const c of controls) {
    switch (c.status) {
      case 'fully_implemented': implemented++; break
      case 'partially_implemented': partially++; break
      case 'not_implemented': not++; break
      default: unanswered++
    }
  }
  return { implemented, partiallyImplemented: partially, notImplemented: not, unanswered }
}

function PieChart({ slices, size, innerRadius }: { slices: Slice[]; size: number; innerRadius: number }) {
  const radius = size / 2
  const ring = radius - innerRadius
  const total = Math.max(1, slices.reduce((a, b) => a + b.value, 0))
  let offset = 0
  const circumference = 2 * Math.PI * ring

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${radius} ${radius})`}>
        {slices.map((slice, i) => {
          const length = (slice.value / total) * circumference
          const dash = `${length} ${circumference - length}`
          const el = (
            <circle
              key={i}
              r={ring}
              cx={radius}
              cy={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={innerRadius}
              strokeDasharray={dash}
              strokeDashoffset={-offset}
            />
          )
          offset += length
          return el
        })}
      </g>
    </svg>
  )
}

function Legend({ slices, total }: { slices: Slice[]; total: number }) {
  return (
    <div className="legend">
      {slices.map((s, i) => {
        const pct = total > 0 ? Math.round((s.value / total) * 100) : 0
        const swatchClass =
          s.label.startsWith('not') ? 'swatch--not'
          : s.label.startsWith('part') ? 'swatch--part'
          : s.label.startsWith('impl') ? 'swatch--impl'
          : 'swatch--unans'
        return (
          <div key={i} className="legend__row">
            <span className={`legend__swatch ${swatchClass}`} />
            {s.label} <strong>{s.value}</strong> ({pct}%)
          </div>
        )
      })}
    </div>
  )
}
