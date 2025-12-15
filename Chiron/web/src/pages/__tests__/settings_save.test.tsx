import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Settings from '../Settings'
import React from 'react'
import { vi } from 'vitest'


// ---- Mocks
const mockUpdateProfile = vi.fn()
const mockUpdateEmail = vi.fn()
const mockSetDoc = vi.fn()
const mockGetDoc = vi.fn().mockResolvedValue({ exists: () => false })

vi.mock('../../firebase', () => ({
  isFirebaseConfigured: true,
  auth: { currentUser: { uid: 'u1', email: 'old@x.com', displayName: 'Old Name' } },
  db: {} as any,
}))

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual<any>('firebase/auth')
  return {
    ...actual,
    updateProfile: (...args: any[]) => mockUpdateProfile(...args),
    updateEmail: (...args: any[]) => mockUpdateEmail(...args),
    EmailAuthProvider: { credential: vi.fn() },
    reauthenticateWithCredential: vi.fn(),
  }
})

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<any>('firebase/firestore')
  return {
    ...actual,
    doc: (_db: any, _c: string, _id: string) => ({ path: `users/u1` }),
    getDoc: (...args: any[]) => mockGetDoc(...args),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    serverTimestamp: () => new Date(),
  }
})

// ---- Test
it('saves name & email to Auth and Firestore', async () => {
  render(<Settings />)

  fireEvent.click(screen.getByText('Account'))
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'New Name' } })
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'new@x.com' } })
  fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

  await waitFor(() => {
    expect(mockUpdateProfile).toHaveBeenCalled()
    expect(mockUpdateEmail).toHaveBeenCalled()
    expect(mockSetDoc).toHaveBeenCalledWith(
      { path: 'users/u1' },
      expect.objectContaining({ fullName: 'New Name', email: 'new@x.com' }),
      { merge: true }
    )
  })
})