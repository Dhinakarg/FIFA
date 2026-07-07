import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppStateProvider } from '../context/AppStateContext'
import Home from './Home'
import StadiumMap from './StadiumMap'
import CrowdDashboard from './CrowdDashboard'
import StaffOperations from './StaffOperations'
import OrganizerDashboard from './OrganizerDashboard'
import AdminPanel from './AdminPanel'

// Mock Firebase SDKs
jest.mock('../firebase', () => ({
  isFirebaseSupported: false,
  db: null,
  auth: null,
  functions: null,
  askGenieCallable: null,
  translateResponseCallable: null,
  generateGateSummaryCallable: null,
  generateTacticalDispatchCallable: null,
  classifyEmergencyCallable: null,
  generateStadiumReportCallable: null,
  summarizeFeedbackCallable: null
}))

// Mock Recharts for JSDom compatibility in Jest
jest.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />
  };
});

describe('Pages Rendering Tests', () => {
  const renderWithProviders = (component) => {
    return render(
      <AppStateProvider>
        <MemoryRouter>
          {component}
        </MemoryRouter>
      </AppStateProvider>
    )
  }

  it('renders Home page correctly', () => {
    renderWithProviders(<Home />)
    expect(screen.getByText(/Welcome to StadiumAssist/i)).toBeInTheDocument()
  })

  it('renders StadiumMap page correctly', () => {
    renderWithProviders(<StadiumMap />)
    expect(screen.getByText(/Vector Egress Layout/i)).toBeInTheDocument()
  })

  it('renders CrowdDashboard page correctly', () => {
    renderWithProviders(<CrowdDashboard />)
    expect(screen.getByText(/Crowd Operations Dashboard/i)).toBeInTheDocument()
  })

  it('renders StaffOperations page correctly', () => {
    renderWithProviders(<StaffOperations />)
    expect(screen.getByText(/Staff Operations & Dispatch/i)).toBeInTheDocument()
  })

  it('renders OrganizerDashboard page correctly', () => {
    renderWithProviders(<OrganizerDashboard />)
    expect(screen.getByText(/Event Organizer Console/i)).toBeInTheDocument()
  })

  it('renders AdminPanel page correctly', () => {
    renderWithProviders(<AdminPanel />)
    expect(screen.getByText(/Developer & Admin Control Panel/i)).toBeInTheDocument()
  })
})
