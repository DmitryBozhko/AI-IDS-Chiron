import type { Control, Status } from './types'

export type WeightOverrides = Record<string, number>

export function parseCodeRank(code: string): number {
  const m = code.match(/(\d+)\.(\d+)\.(\d+)/)
  if (!m) return Number.MAX_SAFE_INTEGER
  return Number(m[1]) * 10000 + Number(m[2]) * 100 + Number(m[3])
}

export function buildWeightMap(controls: Control[], overrides: WeightOverrides = {}): Map<string, number> {
  const byFam: Record<string, Control[]> = {}
  for (const c of controls) {
    (byFam[c.family] ||= []).push(c)
  }
  const map = new Map<string, number>()
  for (const fam of Object.keys(byFam)) {
    const list = byFam[fam].sort((a,b) => parseCodeRank(a.code) - parseCodeRank(b.code))
    list.forEach((c, idx) => {
      const ov = overrides[c.code]
      const w = typeof ov === 'number' ? ov : idx < 2 ? 5 : idx < 4 ? 3 : 1
      map.set(c.code, w)
    })
  }
  return map
}

export function controlWeight(controls: Control[], control: Control, overrides: WeightOverrides = {}): number {
  const map = buildWeightMap(controls, overrides)
  return map.get(control.code) ?? 1
}

export function controlContribution(control: Control, weight: number): number {
  const s = control.status as Status | undefined
  if (!s || s === 'not_implemented') return -weight
  if (s === 'fully_implemented') return +weight
  return +(weight * 0.5) // partially
}

