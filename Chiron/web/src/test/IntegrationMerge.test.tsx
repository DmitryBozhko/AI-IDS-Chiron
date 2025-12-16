import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UnifiedSettings from '../pages/UnifiedSettings'

// Mock the IDS API wrapper (this is the integration seam)
vi.mock('../services/idsApi', () => {
  return {
    idsSettings: vi.fn(),
    idsUpdateSettings: vi.fn(),
  }
})

import { idsSettings, idsUpdateSettings } from '../services/idsApi'

describe('UnifiedSettings (merge: Chiron ↔ AI-IDS)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads IDS settings and populates fields', async () => {
    ;(idsSettings as any).mockResolvedValue({
      settings: {
        'Logging.LogLevel': 'INFO',
      },
      defaults: {
        'Signatures.Enable': 'true',
        'Logging.LogLevel': 'WARNING',
        'Logging.EnableFileLogging': 'false',
        'Monitoring.AlertThresholds': '-0.10, -0.05',
        'Retention.AlertsDays': 7,
        'Retention.BlocksDays': 14,
      },
    })

    render(<UnifiedSettings />)

    fireEvent.click(screen.getByText('AI-IDS Settings'))

    await waitFor(() => {
      expect(screen.getByText('IDS Configuration')).toBeInTheDocument()
    })

    const logLevelInput = screen.getByLabelText(/Logging\.LogLevel/i) as HTMLInputElement
    expect(logLevelInput.value).toBe('INFO')

    const thresholdsInput = screen.getByLabelText(/Monitoring\.AlertThresholds/i) as HTMLInputElement
    expect(thresholdsInput.value).toBe('-0.10, -0.05')
  })

  it('blocks save when validation fails and shows error message', async () => {
    ;(idsSettings as any).mockResolvedValue({
      settings: {},
      defaults: {
        'Signatures.Enable': 'true',
        'Logging.LogLevel': 'INFO',
        'Logging.EnableFileLogging': 'false',
        'Monitoring.AlertThresholds': '-0.10, -0.05',
        'Retention.AlertsDays': 7,
        'Retention.BlocksDays': 14,
      },
    })

    render(<UnifiedSettings />)
    fireEvent.click(screen.getByText('AI-IDS Settings'))

    await waitFor(() => {
      expect(screen.getByText('IDS Configuration')).toBeInTheDocument()
    })

    const thresholdsInput = screen.getByLabelText(/Monitoring\.AlertThresholds/i) as HTMLInputElement
    fireEvent.change(thresholdsInput, { target: { value: '0.1' } })

    fireEvent.click(screen.getByText('Save'))

    expect(await screen.findByText(/Please check the highlighted values/i)).toBeInTheDocument()
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)

    expect(idsUpdateSettings).not.toHaveBeenCalled()
  })

  it('calls idsUpdateSettings when all values are valid', async () => {
    ;(idsSettings as any).mockResolvedValue({
      settings: {},
      defaults: {
        'Signatures.Enable': 'true',
        'Logging.LogLevel': 'INFO',
        'Logging.EnableFileLogging': 'false',
        'Monitoring.AlertThresholds': '-0.10, -0.05',
        'Retention.AlertsDays': 7,
        'Retention.BlocksDays': 14,
      },
    })
    ;(idsUpdateSettings as any).mockResolvedValue({ ok: true })

    render(<UnifiedSettings />)
    fireEvent.click(screen.getByText('AI-IDS Settings'))

    await waitFor(() => {
      expect(screen.getByText('IDS Configuration')).toBeInTheDocument()
    })

    // Fix/confirm values are valid
    fireEvent.change(screen.getByLabelText(/Logging\.LogLevel/i), { target: { value: 'DEBUG' } })
    fireEvent.change(screen.getByLabelText(/Monitoring\.AlertThresholds/i), { target: { value: '-0.12, -0.06' } })
    fireEvent.change(screen.getByLabelText(/Retention\.AlertsDays/i), { target: { value: '10' } })

    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(idsUpdateSettings).toHaveBeenCalledTimes(1)
    })

    const payload = (idsUpdateSettings as any).mock.calls[0][0]
    expect(payload['Logging.LogLevel']).toBe('DEBUG')
    expect(payload['Monitoring.AlertThresholds']).toBe('-0.12, -0.06')
    expect(payload['Retention.AlertsDays']).toBe('10')
  })

  it('reset restores defaults and shows message', async () => {
    ;(idsSettings as any).mockResolvedValue({
      settings: {
        'Logging.LogLevel': 'ERROR',
      },
      defaults: {
        'Signatures.Enable': 'true',
        'Logging.LogLevel': 'INFO',
        'Logging.EnableFileLogging': 'false',
        'Monitoring.AlertThresholds': '-0.10, -0.05',
        'Retention.AlertsDays': 7,
        'Retention.BlocksDays': 14,
      },
    })

    render(<UnifiedSettings />)
    fireEvent.click(screen.getByText('AI-IDS Settings'))

    await waitFor(() => {
      expect(screen.getByText('IDS Configuration')).toBeInTheDocument()
    })

    // confirm it starts with settings override
    expect((screen.getByLabelText(/Logging\.LogLevel/i) as HTMLInputElement).value).toBe('ERROR')

    fireEvent.click(screen.getByText('Reset'))

    expect((screen.getByLabelText(/Logging\.LogLevel/i) as HTMLInputElement).value).toBe('INFO')
    expect(await screen.findByText(/Settings reset to defaults/i)).toBeInTheDocument()
  })
})
