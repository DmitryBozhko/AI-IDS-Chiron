import { describe, it, expect } from 'vitest'
import { parseCodeRank, controlContribution, controlWeight, buildWeightMap } from './scoring'
import type { Control } from './types'

const makeControl = (over: Partial<Control>): Control => ({
  id: over.id ?? 'id-1',
  code: over.code ?? '3.1.1',
  family: over.family ?? 'AC',
  title: over.title ?? 'Example Control',
  description: over.description,
  status: over.status,
  objectives: over.objectives ?? [],
})

describe('parseCodeRank', () => {
  it('parses dotted numeric codes', () => {
    expect(parseCodeRank('3.1.1')).toBe(30101)
    expect(parseCodeRank('10.2.17')).toBe(100217)
  })
  it('falls back for invalid format', () => {
    expect(parseCodeRank('AC-3')).toBe(Number.MAX_SAFE_INTEGER)
  })
})

describe('controlContribution', () => {
  it('is negative for not implemented or undefined', () => {
    const c1 = makeControl({ status: 'not_implemented' })
    const c2 = makeControl({ status: undefined })
    expect(controlContribution(c1, 2)).toBe(-2)
    expect(controlContribution(c2, 2)).toBe(-2)
  })
  it('is positive for fully implemented', () => {
    const c = makeControl({ status: 'fully_implemented' })
    expect(controlContribution(c, 3)).toBe(3)
  })
  it('is half for partially implemented', () => {
    const c = makeControl({ status: 'partially_implemented' })
    expect(controlContribution(c, 4)).toBe(2)
  })
})

describe('weights', () => {
  it('produces a weight map keyed by code and respects overrides', () => {
    const controls: Control[] = [
      makeControl({ id: '1', code: '3.1.1', family: 'AC' }),
      makeControl({ id: '2', code: '3.1.2', family: 'AC' }),
      makeControl({ id: '3', code: '3.2.1', family: 'AT' }),
    ]
    const map = buildWeightMap(controls, { '3.2.1': 5 })
    expect(map.get('3.2.1')).toBe(5)
    // non-overridden control should still have a numeric weight
    expect(typeof map.get('3.1.1')).toBe('number')
  })

  it('controlWeight returns the mapped value', () => {
    const controls: Control[] = [
      makeControl({ id: '1', code: '3.1.1', family: 'AC' }),
      makeControl({ id: '2', code: '3.2.1', family: 'AT' }),
    ]
    const w = controlWeight(controls, controls[1], { '3.2.1': 7 })
    expect(w).toBe(7)
  })
})
