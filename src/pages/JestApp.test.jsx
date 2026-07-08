import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
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
      });

      // Verification: Fallback string containing verified FAQ contents is rendered
      await waitFor(() => {
        expect(screen.getByText(/Connection Fallback/i)).toBeInTheDocument();
        expect(screen.getByText(/Eastern Grill, Arena Snacks, and Southern Pizza Hub are open/i)).toBeInTheDocument();
      }, { timeout: 3000 });
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
      });

      // Verification: Generic fallback notice is rendered
      await waitFor(() => {
        expect(screen.getByText(/We are experiencing connection issues reaching our AI assistant/i)).toBeInTheDocument();
        expect(screen.getByText(/visit the closest Customer Help Hub located at Section 101/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('correctly queries Gemini via askGenieCallable for unknown queries', async () => {
      const { askGenieCallable } = require('../firebase');
      askGenieCallable.mockResolvedValueOnce({
        data: { response: "Gemini response for an unknown query." }
      });

      renderWithProviders(<FanAssistant />);

      const input = screen.getByLabelText(/Chat input query/i);
      const sendButton = screen.getByLabelText(/Send message/i);

      // Query has no FAQ matches
      fireEvent.change(input, { target: { value: 'What is the stadium weather policy?' } });
      
      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(askGenieCallable).toHaveBeenCalledWith({ query: 'What is the stadium weather policy?' });
        expect(screen.getByText("Gemini response for an unknown query.")).toBeInTheDocument();
      });
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

    it('blocks Fan-role user from triggering write submit actions on the forms', () => {
      renderWithProviders(<AdminPanel />);
      
      // Submit button should be disabled for Fans
      const createEntryBtn = screen.getByRole('button', { name: /Create Entry/i });
      expect(createEntryBtn).toBeDisabled();

      // Edit/Delete buttons on the first FAQ row should be disabled
      const editButtons = screen.getAllByLabelText(/Edit FAQ for/i);
      expect(editButtons[0]).toBeDisabled();

      const deleteButtons = screen.getAllByLabelText(/Delete FAQ for/i);
      expect(deleteButtons[0]).toBeDisabled();
    });
  });


  describe('5. Multi-Language Translation End-to-End Selector', () => {
    it('triggers translateResponseCallable when non-English languages are selected', async () => {
      const { translateResponseCallable, askGenieCallable } = require('../firebase');
      
      // Setup mocked responses
      askGenieCallable.mockResolvedValue({
        data: { response: "Mock English response from Gemini AI." }
      });
      translateResponseCallable
        .mockResolvedValueOnce({ data: { translatedText: "Este es un mensaje traducido al español." } })
        .mockResolvedValueOnce({ data: { translatedText: "Ceci est un message traduit en français." } });

      renderWithProviders(<FanAssistant />);

      const langSelect = screen.getByLabelText(/Language:/i);
      const input = screen.getByLabelText(/Chat input query/i);
      const sendButton = screen.getByLabelText(/Send message/i);

      // --- Test 1: Spanish (es) ---
      fireEvent.change(langSelect, { target: { value: 'es' } });
      fireEvent.change(input, { target: { value: 'Where is gate B?' } });
      
      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(translateResponseCallable).toHaveBeenCalledWith({
          text: "Mock English response from Gemini AI.",
          targetLanguage: "es"
        });
        expect(screen.getByText("Este es un mensaje traducido al español.")).toBeInTheDocument();
      });

      // --- Test 2: French (fr) ---
      fireEvent.change(langSelect, { target: { value: 'fr' } });
      fireEvent.change(input, { target: { value: 'Where is the food court?' } });

      await act(async () => {
        fireEvent.click(sendButton);
      });

      await waitFor(() => {
        expect(translateResponseCallable).toHaveBeenCalledWith({
          text: "Mock English response from Gemini AI.",
          targetLanguage: "fr"
        });
        expect(screen.getByText("Ceci est un message traduit en français.")).toBeInTheDocument();
      });
    });
  });

  describe('6. Congestion Gemini Summary Constraints', () => {
    it('does not trigger Gemini summary when only 1 gate exceeds 80% occupancy', async () => {
      const { generateGateSummaryCallable } = require('../firebase');
      
      const AppStateContext = require('../context/AppStateContext');
      
      // Mock gates: only Gate B is congested (850/1000 = 85%), others are low
      const mockGatesSingleCongested = [
        { id: "gate-a", name: "Main Gate A", currentCount: 100, capacity: 1000, status: "Low" },
        { id: "gate-b", name: "North Gate B", currentCount: 850, capacity: 1000, status: "High" },
        { id: "gate-c", name: "South Gate C", currentCount: 200, capacity: 1000, status: "Low" },
        { id: "gate-d", name: "East Gate D", currentCount: 100, capacity: 1000, status: "Low" }
      ];

      jest.spyOn(AppStateContext, 'useAppState').mockImplementation(() => ({
        gates: mockGatesSingleCongested,
        evacuationAlarm: false,
        activeEvent: { attendance: 41250, capacity: 50000 },
        addLog: jest.fn()
      }));

      renderWithProviders(<CrowdDashboard />);

      // Verify generateGateSummaryCallable is NOT called
      expect(generateGateSummaryCallable).not.toHaveBeenCalled();

      AppStateContext.useAppState.mockRestore();
    });

    it('triggers Gemini summary when 2 or more gates exceed 80% occupancy simultaneously', async () => {
      const { generateGateSummaryCallable } = require('../firebase');
      generateGateSummaryCallable.mockResolvedValueOnce({
        data: { summary: "Mocked Gemini Summary: Gate B and Gate C are congested." }
      });
      
      const AppStateContext = require('../context/AppStateContext');
      
      // Mock gates: Gate B (850/1000 = 85%) and Gate C (900/1000 = 90%) are congested
      const mockGatesDoubleCongested = [
        { id: "gate-a", name: "Main Gate A", currentCount: 100, capacity: 1000, status: "Low" },
        { id: "gate-b", name: "North Gate B", currentCount: 850, capacity: 1000, status: "High" },
        { id: "gate-c", name: "South Gate C", currentCount: 900, capacity: 1000, status: "High" },
        { id: "gate-d", name: "East Gate D", currentCount: 100, capacity: 1000, status: "Low" }
      ];

      jest.spyOn(AppStateContext, 'useAppState').mockImplementation(() => ({
        gates: mockGatesDoubleCongested,
        evacuationAlarm: false,
        activeEvent: { attendance: 41250, capacity: 50000 },
        addLog: jest.fn()
      }));

      renderWithProviders(<CrowdDashboard />);

      // Verify generateGateSummaryCallable IS called
      await waitFor(() => {
        expect(generateGateSummaryCallable).toHaveBeenCalled();
        expect(screen.getByText(/Mocked Gemini Summary: Gate B and Gate C are congested./i)).toBeInTheDocument();
      });

      AppStateContext.useAppState.mockRestore();
    });
  });
});

