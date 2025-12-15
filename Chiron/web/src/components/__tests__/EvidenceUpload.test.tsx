import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { EvidenceUploader } from '../EvidenceUpload'
import * as BusinessContext from '../../context/BusinessContext'
import { EvidenceList } from '../EvidenceUpload'

// Mock firebase modules
vi.mock('firebase/storage', () => {
  return {
    ref: vi.fn(() => ({})),
    uploadBytesResumable: vi.fn(() => ({
      snapshot: { ref: {} },
      on: (_state: any, _progress: any, _err: any, complete: any) => {
        // immediately call complete to simulate upload
        complete()
      }
    })),
    getDownloadURL: vi.fn(async () => 'https://example.com/file.pdf')
  }
})

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  runTransaction: vi.fn(async (_db: any, fn: any) => { await fn({ get: async () => ({ exists: () => true, data: () => ({ evidence: [] }) }), update: async () => {} }) }),
  arrayUnion: vi.fn((entry: any) => [entry])
}))

vi.mock('../../firebase', () => ({
  db: {},
  storage: {},
  isFirebaseConfigured: true,
  auth: undefined,
}))

vi.mock('../../context/AuthRoute', () => ({
  getCurrentUserID: () => 'test-user'
}))

// Mock the BusinessContext so we can control selectedBusiness/currentUserId/canManageSelected per test
vi.mock('../../context/BusinessContext', () => ({
  useBusinessContext: vi.fn()
}))

describe('EvidenceUploader', () => {
  it('uploads file and updates firestore', async () => {
    const { container } = render(<EvidenceUploader businessId={'biz'} controlId={'ctrl'} />)
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['hello'], 'test.pdf', { type: 'application/pdf' })

    Object.defineProperty(fileInput, 'files', { value: [file] })
    fireEvent.change(fileInput)

    // wait until the upload completes and the input cleared
    await waitFor(() => expect((fileInput as HTMLInputElement).value).toBe(''))
  })

  it('displays evidence items for a control and shows metadata', async () => {
    // arrange: make BusinessContext return a business with evidence items
    const evidenceItem = {
      id: '1',
      controlId: 'ctrl',
      name: 'report.pdf',
      path: 'evidence/ctrl/test-user/report.pdf',
      url: 'https://example.com/report.pdf',
      uploadedBy: 'test-user',
      uploadedAt: new Date().toISOString()
    }
    ;(BusinessContext.useBusinessContext as unknown as any).mockReturnValue({
      selectedBusiness: { id: 'biz', evidence: [evidenceItem] },
      currentUserId: 'test-user',
      canManageSelected: false
    })

    render(<EvidenceList controlId={'ctrl'} />)

    // filename shown
    expect(await screen.findByText('report.pdf')).toBeInTheDocument()
    // uploaded by text shown
    expect(screen.getByText(/Uploaded by test-user/i)).toBeInTheDocument()
    // Download button present
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument()
    // Remove button present for uploader
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('shows remove for manager even if not uploader', async () => {
    const evidenceItem = {
      id: '2',
      controlId: 'ctrl',
      name: 'other.pdf',
      path: 'evidence/ctrl/other/other.pdf',
      url: 'https://example.com/other.pdf',
      uploadedBy: 'someone-else',
      uploadedAt: new Date().toISOString()
    }
    ;(BusinessContext.useBusinessContext as unknown as any).mockReturnValue({
      selectedBusiness: { id: 'biz', evidence: [evidenceItem] },
      currentUserId: 'test-user',
      canManageSelected: true
    })

    render(<EvidenceList controlId={'ctrl'} />)

    expect(await screen.findByText('other.pdf')).toBeInTheDocument()
    // Remove button should be visible to manager
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })
})
