import React from 'react'
import { render, screen } from '@testing-library/react'
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

import { AppStateProvider } from '../context/AppStateContext'
import FanAssistant from './FanAssistant'

describe('FanAssistant Page', () => {
  it('renders the chatbot assistant, feedback rating, and incident report components', () => {
    render(
      <AppStateProvider>
        <FanAssistant />
      </AppStateProvider>
    )

    // Verify Chatbot container elements exist
    expect(screen.getByText(/StadiumAssist AI Assistant/i)).toBeInTheDocument()

    // Verify feedback panel
    expect(screen.getByText(/Rate Your Stadium Experience/i)).toBeInTheDocument()

    // Verify incident reporting section
    expect(screen.getByText(/Report Stadium Incident/i)).toBeInTheDocument()
  })
})
