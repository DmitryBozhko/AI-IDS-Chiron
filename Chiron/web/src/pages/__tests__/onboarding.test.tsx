import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import { BusinessProvider } from '../../context/BusinessContext'
import { vi } from 'vitest'

// Mock firebase module used by the app to avoid real network calls.
// We'll set isFirebaseConfigured=false so the app runs in offline/demo mode and
// the Login page navigates to the dashboard without performing OAuth.
vi.mock('../../firebase', () => ({
  isFirebaseConfigured: false,
  auth: undefined,
  provider: undefined,
  db: undefined,
}))

describe('Onboarding — create account and quick start', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetAllMocks()
  })

  it('allows a user to sign in and land on their default company automatically', async () => {
    // Stub fetch to return sample businesses used by BusinessProvider when firebase is disabled.
    const sampleBusinesses = [
      { id: 'b1', name: 'Alpha Co', members: [{ uid: 'demo-owner', role: 'owner', displayName: 'Demo Owner' }], controlState: [] },
      { id: 'b2', name: 'Beta LLC', members: [], controlState: [] },
    ]
    const sampleControls: any[] = [] // minimal controls so mergeControls does not crash
    vi.stubGlobal('fetch', (url: string) => {
      if (typeof url === 'string' && url.includes('cmmc-l2.controls.json')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => sampleControls })
      }
      if (typeof url === 'string' && url.includes('businesses.json')) {
        return Promise.resolve({ ok: true, status: 200, json: async () => sampleBusinesses })
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) })
    })

    window.localStorage.clear()

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <BusinessProvider>
          <App />
        </BusinessProvider>
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: /Chiron/i })

    const googleButton = await screen.findByRole('button', { name: /sign in with google/i })
    await act(async () => userEvent.click(googleButton))

    // After sign-in the app should navigate to the dashboard and auto-select the first company
    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
