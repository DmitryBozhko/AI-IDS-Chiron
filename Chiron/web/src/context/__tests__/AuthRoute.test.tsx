import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

// We'll reset modules and set up mocks per-test so AuthRoute reads mocked values

describe('AuthRoute', () => {
  const originalConsoleError = console.error
  const navigateMock = { fn: vi.fn() }

  beforeEach(() => {
    vi.resetModules()
    console.error = (..._args: any[]) => {}
    navigateMock.fn = vi.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
    vi.restoreAllMocks()
  })

  it('bypasses auth when firebase is not configured and calls onAuthSuccess', async () => {
    vi.doMock('../../firebase', () => ({
      isFirebaseConfigured: false,
      auth: undefined,
    }))

    
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual<any>('react-router-dom')
      return {
        ...actual,
        useNavigate: () => navigateMock.fn,
      }
    })

    vi.doMock('firebase/auth', () => ({
      onAuthStateChanged: vi.fn(),
      signOut: vi.fn(),
    }))

    const { default: AuthRoute } = await import('../AuthRoute')

    const onAuthSuccess = vi.fn()

    render(
      <AuthRoute onAuthSuccess={onAuthSuccess}>
        <div>protected-child</div>
      </AuthRoute>,
    )

    expect(screen.getByText('protected-child')).toBeDefined()
    // onAuthSuccess should be invoked for bypass
    await waitFor(() => expect(onAuthSuccess).toHaveBeenCalled())
  })

  it('renders children when user is authenticated', async () => {
    vi.doMock('../../firebase', () => ({
      isFirebaseConfigured: true,
      auth: {},
    }))

    // const mockNavigate = vi.fn()
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual<any>('react-router-dom')
      return {
        ...actual,
        useNavigate: () => navigateMock.fn,
      }
    })

    vi.doMock('firebase/auth', () => ({
      onAuthStateChanged: (auth: any, cb: (u: any) => void) => {
        // simulate an authenticated user
        cb({ uid: 'user-1', displayName: 'Tester' })
        return () => {}
      },
      signOut: vi.fn(),
    }))

    const { default: AuthRoute } = await import('../AuthRoute')

    render(
      <AuthRoute>
        <div>protected-child</div>
      </AuthRoute>,
    )

    await waitFor(() => expect(screen.getByText('protected-child')).toBeDefined())
  })

  it('navigates to /login and shows loading when user is unauthenticated', async () => {
    vi.doMock('../../firebase', () => ({
      isFirebaseConfigured: true,
      auth: {},
    }))

    // const mockNavigate = vi.fn()
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual<any>('react-router-dom')
      return {
        ...actual,
        useNavigate: () => navigateMock.fn,
      }
    })

    vi.doMock('firebase/auth', () => ({
      onAuthStateChanged: (auth: any, cb: (u: any) => void) => {
        // simulate unauthenticated
        cb(null)
        return () => {}
      },
      signOut: vi.fn(),
    }))

    const { default: AuthRoute } = await import('../AuthRoute')

    render(
      <AuthRoute>
        <div>protected-child</div>
      </AuthRoute>,
    )

    // should show loading text while unauthenticated
    expect(screen.getByText(/loading/i)).toBeDefined()
    // navigate should be called to send user to /login
    await waitFor(() => expect(navigateMock.fn).toHaveBeenCalledWith('/login'))
  })
})
