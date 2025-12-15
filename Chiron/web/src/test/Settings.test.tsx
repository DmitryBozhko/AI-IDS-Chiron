import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Settings from '../pages/Settings' // adjust path as needed

describe('Settings Page', () => {
  it('renders the Settings navigation menu', () => {
    render(<Settings />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument()
    expect(screen.getByText('Support')).toBeInTheDocument()
  })

  it('switches between sections correctly', () => {
    render(<Settings />)

    expect(screen.getByText('Account Information')).toBeInTheDocument()

    // Click “Change Password”
    fireEvent.click(screen.getAllByText('Change Password')[0])
    expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument()

    // Click “Support”
    fireEvent.click(screen.getByText('Support'))
    expect(screen.getByText('Contact Support')).toBeInTheDocument()
  })

  it('toggles password visibility correctly', () => {
    render(<Settings />)
    fireEvent.click(screen.getByText('Change Password'))

    const eyeButton = screen.getAllByRole('button', { name: /toggle current password visibility/i })
    const passwordField = screen.getByLabelText('Current Password')

    // Initially hidden
    expect(passwordField).toHaveAttribute('type', 'password')

    // Toggle visibility
    // just one needed
    fireEvent.click(eyeButton[0])
    expect(passwordField).toHaveAttribute('type', 'text')
  })

  it('toggles MFA on and off', () => {
    render(<Settings />)
    fireEvent.click(screen.getByText('Multi-Factor Authentication'))

    const toggle = screen.getByRole('button', { name: '' })
    fireEvent.click(toggle)

    // Check if "MFA is enabled!" message appears
    expect(screen.getByText(/MFA is enabled!/i)).toBeInTheDocument()

    // Toggle off again
    fireEvent.click(toggle)
    expect(screen.queryByText(/MFA is enabled!/i)).toBeNull()
  })
})