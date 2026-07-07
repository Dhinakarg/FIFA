import React from 'react'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Enforce Local Simulation Mode by mocking isFirebaseSupported to false
vi.mock('../firebase', () => ({
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

import { AppStateProvider, useAppState } from './AppStateContext'

// Dummy component that consumes context for testing
function TestConsumer() {
  const { 
    userRole, 
    setUserRole, 
    evacuationAlarm, 
    triggerEvacuationAlarm,
    incidents,
    reportIncident
  } = useAppState();

  return (
    <div>
      <span data-testid="role">{userRole}</span>
      <span data-testid="alarm">{evacuationAlarm ? 'ACTIVE' : 'SECURE'}</span>
      <span data-testid="incidents-count">{incidents.length}</span>
      <button data-testid="btn-set-role" onClick={() => setUserRole('organizer')}>Set Role</button>
      <button data-testid="btn-toggle-alarm" onClick={() => triggerEvacuationAlarm(true)}>Trigger Alarm</button>
      <button data-testid="btn-add-incident" onClick={() => reportIncident('Test Title', 'Test Desc', 'medical', 'Zone A', 'Test User', 'Medium')}>Add Incident</button>
    </div>
  )
}

describe('AppStateContext', () => {
  it('initializes with default values and allows simulation controls', async () => {
    render(
      <AppStateProvider>
        <TestConsumer />
      </AppStateProvider>
    )

    // Wait for the async Auth check to complete and settle the role (usually defaults to fan if offline)
    await waitFor(() => {
      const roleText = screen.getByTestId('role').textContent;
      expect(roleText === 'admin' || roleText === 'fan').toBe(true);
    });

    expect(screen.getByTestId('alarm').textContent).toBe('SECURE')

    // Modify user role
    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-set-role'))
    })
    expect(screen.getByTestId('role').textContent).toBe('organizer')

    // Modify alarm status
    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-toggle-alarm'))
    })
    expect(screen.getByTestId('alarm').textContent).toBe('ACTIVE')

    // Add incident and verify list count increases
    const initialCount = parseInt(screen.getByTestId('incidents-count').textContent, 10)
    await act(async () => {
      fireEvent.click(screen.getByTestId('btn-add-incident'))
    })
    expect(parseInt(screen.getByTestId('incidents-count').textContent, 10)).toBe(initialCount + 1)
  })
})
