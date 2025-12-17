import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ControlDetail from '../ControlDetail'
import { BusinessProvider } from '../../context/BusinessContext'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// mock fetch for control definitions used in BusinessProvider
global.fetch = vi.fn(async (input: any) => {
  if (String(input).endsWith('/data/cmmc-l2.controls.json')) {
    return { ok: true, json: async () => [] }
  }
  if (String(input).endsWith('/data/businesses.json')) {
    return { ok: true, json: async () => [] }
  }
  return { ok: false }
}) as any

// Mock dependencies used by ControlDetail
vi.mock('../../components/EvidenceUpload', () => ({
  EvidenceUploader: ({ businessId, controlId }: any) => <div data-testid="uploader">uploader {controlId}</div>,
  EvidenceList: ({ controlId }: any) => <div>No evidence uploaded yet.</div>
}))

vi.mock('../../firebase', async () => ({
  db: undefined,
  storage: undefined,
  isFirebaseConfigured: false,
  auth: undefined,
}))

// Mock BusinessContext by rendering with provider and setting localStorage selected business id
beforeEach(() => {
  // ensure selected business id stored
  window.localStorage.setItem('chiron:selectedBusinessId', 'biz-1')
})

afterEach(() => {
  window.localStorage.removeItem('chiron:selectedBusinessId')
})

test('renders uploader and evidence list placeholder', async () => {
  const fakeControls = [{ id: 'ctrl-1', code: '1.1.1', family: 'AC', title: 'Test control', objectives: [] }]
  render(
    <MemoryRouter initialEntries={["/controls/ctrl-1"]}>
      <BusinessProvider>
        <Routes>
          <Route path="/controls/:id" element={<ControlDetail allControls={fakeControls} onUpdateControl={() => {}} />} />
        </Routes>
      </BusinessProvider>
    </MemoryRouter>
  )
  expect(await screen.findByTestId('uploader')).toBeTruthy()
  expect(screen.getByText(/No evidence uploaded yet/i)).toBeTruthy()
})
