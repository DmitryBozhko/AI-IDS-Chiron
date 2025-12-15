import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SidebarShell from '../SidebarShell'
import { BusinessProvider } from '../../context/BusinessContext'

describe('SidebarShell', () => {
  it('renders title, children, and role badge', () => {
    render(
      <MemoryRouter>
        <BusinessProvider>
          <SidebarShell title="Controls">
            <div>content-here</div>
          </SidebarShell>
        </BusinessProvider>
      </MemoryRouter>
    )
    expect(screen.getByText(/content-here/i)).toBeInTheDocument()
    // role label should be present (Guest/Owner/Editor/Viewer etc.)
    expect(screen.getByText(/Guest|Owner|Editor|Viewer/i)).toBeInTheDocument()
    // nav links should exist
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
  })
})
