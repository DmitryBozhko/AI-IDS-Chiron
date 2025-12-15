import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import * as firestore from 'firebase/firestore'

import SubmitCompany from '../submitCompany'

// Mock nanoid for deterministic id
vi.mock('nanoid', () => ({ nanoid: () => 'fixed-id' }))

// Mock firebase modules used by the component. Create mocks inside the factory to avoid hoisting issues.
vi.mock('firebase/firestore', () => ({
  setDoc: vi.fn(async () => Promise.resolve()),
  doc: vi.fn(() => ({})),
}))

vi.mock('../../firebase', () => ({
  db: {},
  auth: undefined,
  provider: undefined,
  isFirebaseConfigured: false,
}))

vi.mock('../../context/BusinessContext', () => ({
  useBusinessContext: () => ({
    currentUserId: 'test-owner',
  }),
}))

describe('SubmitCompany', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits a new company with invites and certificates', async () => {
    render(<SubmitCompany business={{ id: '', name: '', controlState: [], poams: [], evidence: [] }} />)

    // fill company name
    const nameInput = screen.getByPlaceholderText('Company name') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'Test Co' } })

    // add an invite with role editor
    const emailInput = screen.getByPlaceholderText('Add members by email (press Enter or comma to add)') as HTMLInputElement
    const roleSelect = screen.getByLabelText('Role for new invite') as HTMLSelectElement
    fireEvent.change(roleSelect, { target: { value: 'editor' } })

    fireEvent.change(emailInput, { target: { value: 'alice@example.com' } })
    // press Enter to add
    fireEvent.keyDown(emailInput, { key: 'Enter', code: 'Enter' })

    // select a certificate
    const certCheckbox = screen.getByLabelText('ISO 27001') as HTMLInputElement
    fireEvent.click(certCheckbox)

    // submit
    const submitButton = screen.getByRole('button', { name: /create company/i }) as HTMLButtonElement
    fireEvent.click(submitButton)

    // wait for setDoc to be called
    await waitFor(() => expect((firestore.setDoc as any)).toHaveBeenCalled())

    // assert doc was created using generated id
    expect((firestore.doc as any)).toHaveBeenCalledWith(expect.any(Object), 'businesses', 'fixed-id')

  const savedData = ((firestore.setDoc as any).mock.calls[0][1]) as any
    expect(savedData.name).toBe('Test Co')
    expect(Array.isArray(savedData.invites)).toBe(true)
    expect(savedData.invites.length).toBe(1)
    expect(savedData.invites[0].email).toBe('alice@example.com')
    expect(savedData.invites[0].role).toBe('editor')
    expect(Array.isArray(savedData.certificates)).toBe(true)
    expect(savedData.certificates).toContain('ISO 27001')
  })

  // TODO: test error for uploading certificates in comapany db, still in progress...
   
})
