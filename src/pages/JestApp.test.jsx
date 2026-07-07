import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppStateProvider } from '../context/AppStateContext';
import FanAssistant from './FanAssistant';
import StadiumMap from './StadiumMap';
import CrowdDashboard from './CrowdDashboard';
import AdminPanel from './AdminPanel';

// Mock Firebase SDKs and Cloud Functions
jest.mock('../firebase', () => ({
  isFirebaseSupported: false,
  db: null,
  auth: null,
  functions: null,
  askGenieCallable: jest.fn(),
  translateResponseCallable: jest.fn(),
  generateGateSummaryCallable: jest.fn(),
  generateTacticalDispatchCallable: jest.fn(),
  classifyEmergencyCallable: jest.fn(),
  generateStadiumReportCallable: jest.fn(),
  summarizeFeedbackCallable: jest.fn()
}));

// Mock Recharts ResponsiveContainer for JSDom compatibility in Jest
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

describe('StadiumAssist Jest Test Suite', () => {
  const renderWithProviders = (component) => {
    return render(
      <AppStateProvider>
        <MemoryRouter>
          {component}
        </MemoryRouter>
      </AppStateProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. FanAssistant Knowledge-Base Fallback Logic', () => {
    it('uses loose FAQ matching fallback when askGenie API fails', async () => {
      const { askGenieCallable } = require('../firebase');
      // Force askGenie to fail to trigger fallback path
      askGenieCallable.mockRejectedValueOnce(new Error('AI Service Offline'));

      renderWithProviders(<FanAssistant />);

      const input = screen.getByLabelText(/Chat input query/i);
      const sendButton = screen.getByLabelText(/Send message/i);

      // Query has "food" which loosely matches "food concession"
      fireEvent.change(input, { target: { value: 'Where can I find some food?' } });
      
      await act(async () => {
        fireEvent.click(sendButton);
        // Wait for connection fallback loose matching to resolve (wrapped in a timeout)
        await new Promise((r) => setTimeout(r, 1200));
      });

      // Verification: Fallback string containing verified FAQ contents is rendered
      expect(screen.getByText(/Connection Fallback/i)).toBeInTheDocument();
      expect(screen.getByText(/Eastern Grill, Arena Snacks, and Southern Pizza Hub are open/i)).toBeInTheDocument();
    });

    it('returns generic Customer Help Hub fallback if no loose matches are found', async () => {
      const { askGenieCallable } = require('../firebase');
      askGenieCallable.mockRejectedValueOnce(new Error('AI Service Offline'));

      renderWithProviders(<FanAssistant />);

      const input = screen.getByLabelText(/Chat input query/i);
      const sendButton = screen.getByLabelText(/Send message/i);

      // Query has random text with no matches in FAQ keywords
      fireEvent.change(input, { target: { value: 'random gibberish text query' } });
      
      await act(async () => {
        fireEvent.click(sendButton);
        await new Promise((r) => setTimeout(r, 1200));
      });

      // Verification: Generic fallback notice is rendered
      expect(screen.getByText(/We are experiencing connection issues reaching our AI assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/visit the closest Customer Help Hub located at Section 101/i)).toBeInTheDocument();
    });
  });

  describe('2. StadiumMap SVG Pathfinding Bezier Calculation', () => {
    it('generates a valid Bezier path string from gate to concession', () => {
      const { container } = renderWithProviders(<StadiumMap />);

      // Select starting Gate A (renders text 'A')
      const gateAButton = screen.getAllByText("A")[1];
      fireEvent.click(gateAButton);

      // Select a facility marker on the map (concession symbol is 🍗)
      const foodMarker = screen.getAllByText("🍗")[0];
      fireEvent.click(foodMarker);

      // Click "Find Walking Path" button to render the path directions
      const findPathButton = screen.getByText(/Find Walking Path/i);
      fireEvent.click(findPathButton);

      // Retrieve the routing path component
      const pathElement = container.querySelector('path.walking-route');
      expect(pathElement).toBeInTheDocument();

      const dAttribute = pathElement.getAttribute('d');
      // Assert that it uses M (Move to) and Q (Quadratic Bezier Curve) pathing characters
      expect(dAttribute).toMatch(/^M\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+Q\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?\s+\d+(\.\d+)?$/);
    });
  });

  describe('3. Gate Congestion Alternate Suggestion Rule Engine', () => {
    it('recommends the gate with the lowest occupancy when congestion occurs', () => {
      renderWithProviders(<CrowdDashboard />);

      // Gate B has 83% occupancy (1250/1500) which is congested (>80%).
      // Gate A is at 9% occupancy (140/1500) which is the lowest safe gate.
      // Expected suggestion should direct traffic to Main Gate A.
      expect(screen.getByText(/Divert to Main Gate A \(Operating at 9% load\)/i)).toBeInTheDocument();
    });
  });

  describe('4. RBAC Role Gating simulation', () => {
    it('restricts actions and displays warning in Fan view, enables Admin settings on role override', () => {
      renderWithProviders(<AdminPanel />);

      // Initially, default role is 'fan' (Read-Only)
      expect(screen.getByText(/Fan Read-Only mode/i)).toBeInTheDocument();

      // Sign In inputs should be visible but editing operations are blocked
      const faqInput = screen.getByLabelText(/Keyword \/ Intent/i);
      expect(faqInput).toBeDisabled();

      // Overrider radio buttons are rendered, switch role to 'admin'
      const adminRadio = screen.getByLabelText(/Admin Role/i);
      fireEvent.click(adminRadio);

      // Warning banner is removed
      expect(screen.queryByText(/Fan Read-Only mode/i)).not.toBeInTheDocument();
      // FAQ form is enabled
      expect(faqInput).not.toBeDisabled();
    });
  });
});
