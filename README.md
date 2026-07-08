# 🧞‍♂️ StadiumAssist - Operations & Telemetry Hub

StadiumAssist is a premium, real-time Single Page Application (SPA) designed to handle stadium crowd telemetry, safety coordination, and operations briefings. It connects to **Google Firebase** (Firestore database, Auth, and Functions) with a robust offline **Local Simulation Mode** fallback. It also integrates **Gemini AI** for decision-support briefings, FAQ verification, and emergency classification.

Live Demo:
- **GitHub Pages (Subfolder path)**: [https://dhinakarg.github.io/FIFA/](https://dhinakarg.github.io/FIFA/)

---

## 🚀 Key Features

- **🏠 Home Dashboard**: Real-time overview of active events, total attendance vs. stadium capacity load ratios, fastest/slowest gate flow rates, and key operational metrics.
- **🗺️ Interactive Vector Map**: A high-performance SVG layout mapping concessions, first aid hubs, restroom queues, gate checkpoints, and dynamic pathfinding trajectories.
- **📊 Crowd Dashboard**: Density charts, timeline logs, and gate load analytics. Highlights when gates exceed critical occupancy levels (80%).
- **⚙️ Staff Operations**: Interactive log dispatcher to submit new incidents. Features **Gemini-powered Tactical Dispatch** reports summarizing multiple concurrent incidents.
- **📅 Organizer Console**: Timeline event controllers, simulation scenarios, and gate status switches. Features **Gemini DSS Operational Briefings** and guest review summaries.
- **🛡️ Developer Admin Panel**: Full configuration settings for Gates, Volunteers, Facilities, and FAQs. Supports Firebase session auth.
- **💬 Fan Assistant Chatbot**: Rule-based & Gemini-assisted virtual assistant that resolves stadium questions, auto-updates the admin knowledge base, and tracks guest feedback.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, Vite 8, React Router DOM (HashRouter)
- **Styling**: Vanilla CSS (sleek dark mode, neon borders, glassmorphic layout)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database & Services**: Firebase Web SDK, Firestore database, Firebase Functions (Gemini API Integration)
- **Testing**: Vitest, JSDom, React Testing Library

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Dhinakarg/FIFA.git
   cd FIFA
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory and add the following config keys:
   ```env
   VITE_FIREBASE_API_KEY="<YOUR_BASE64_ENCODED_API_KEY>"
   VITE_FIREBASE_AUTH_DOMAIN="<YOUR_FIREBASE_AUTH_DOMAIN>"
   VITE_FIREBASE_PROJECT_ID="<YOUR_FIREBASE_PROJECT_ID>"
   VITE_FIREBASE_STORAGE_BUCKET="<YOUR_FIREBASE_STORAGE_BUCKET>"
   VITE_FIREBASE_MESSAGING_SENDER_ID="<YOUR_FIREBASE_MESSAGING_SENDER_ID>"
   VITE_FIREBASE_APP_ID="<YOUR_FIREBASE_APP_ID>"
   ```

4. **Run local development server**:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

To run the unit and integration test suites:
```bash
npm run test
```

---

## 🚀 Deploying

The app compiles into a universal relative bundle (`./` base path), making it compatible with any hosting layout.

- **Build client bundle**:
  ```bash
  npm run build
  ```
- **Deploy to GitHub Pages**:
  ```bash
  npm run deploy
  ```

---

## 🧪 Testing Strategy

Our testing strategy leverages **Jest** and **React Testing Library** to establish high-confidence coverage across all layers of our Single Page Application.

### 1. Test Architecture & Configuration
- **Test Runner**: Jest configures `jest-environment-jsdom` to run tests inside a mocked browser DOM.
- **Transpilation**: Babel (`babel.config.cjs`) transpiles ES Modules and JSX elements into CommonJS for Jest execution.
- **Globals & DOM Matchers**: `jest.setup.js` loads `@testing-library/jest-dom` for native-feeling UI assertions (e.g. `toBeInTheDocument`, `toBeDisabled`).

### 2. Mocking Strategy
- **Firebase Core SDK**: `src/firebase.js` is mocked globally (`jest.mock('../firebase')`) to default to `isFirebaseSupported: false` during tests. This intercepts all Firestore database connects and auth scripts to force local simulation mode.
- **Gemini API & Cloud Functions**: All callable functions (`askGenieCallable`, `generateGateSummaryCallable`, etc.) are mocked to verify fallback paths under network timeout or API offline errors.
- **Charts & Viewports**: Heavy layout packages (`recharts`) are mocked to return simple layout containers to avoid errors related to SVG viewport calculations in JSDom.

### 3. Tested Core Logic Blocks
- **Knowledge-Base Fallback (askGenie)**: Validates that when the Gemini AI Cloud Function fails, the chatbot falls back to loose keyword matching on verified FAQs, and falls back to generic Help Hub notices if no matches occur.
- **SVG Pathfinding (getPathDAttribute)**: Validates the trigonometric Bezier coordinate generation formula, ensuring it draws smooth, curve egress paths around the inner stadium bowl.
- **Gate Congestion Engine (suggestAlternateGate)**: Validates that when a gate exceeds the critical 80% occupancy limit, the rule engine sorts and recommends the safest gate with the lowest load ratio.
- **RBAC Role Gating**: Asserts that active user roles dynamically gate administrative panels, showing read-only warnings and blocking CRUD forms for regular fans, while enabling all controls for admins.

---

## 🎯 Problem Statement Alignment

This platform is architected to address the four required tracks of the smart stadium challenge:

| Track Required | Specific App Feature | Technical Implementation |
|---|---|---|
| **1. Dynamic Crowd Management** | [CrowdDashboard](file:///D:/dinak/FIFA/src/pages/CrowdDashboard.jsx) & [GatesStatsTable](file:///D:/dinak/FIFA/src/components/GatesStatsTable.jsx) | Tracks real-time gate occupancy load ratios. When any ingress turnstile exceeds **80% capacity**, the system sounds congestion alerts and triggers the alternate routing engine, dynamically sorting and recommending the gate with the lowest queue load to distribute crowd ingress. |
| **2. Smart Indoor Navigation** | [StadiumMap](file:///D:/dinak/FIFA/src/pages/StadiumMap.jsx) & [StadiumSvg](file:///D:/dinak/FIFA/src/components/StadiumSvg.jsx) | Renders a custom vector SVG layout. Implements a pathfinding algorithm (`getPathDAttribute`) that calculates smooth, curved Bezier egress paths hugging the concourses and avoiding the central seating bowl, alongside a zone lookup showing active nearby support volunteers. |
| **3. Real-Time Decision Support** | [OrganizerDashboard](file:///D:/dinak/FIFA/src/pages/OrganizerDashboard.jsx) & [StaffOperations](file:///D:/dinak/FIFA/src/pages/StaffOperations.jsx) | Integrates Gemini-powered Decision Support Systems (DSS). Features automatic briefing summaries, unstructured emergency incident classification (`classifyEmergency`), and automated task-generation mapping to emergency SOP response checklists. |
| **4. Multi-Language Assistance** | [FanAssistant](file:///D:/dinak/FIFA/src/pages/FanAssistant.jsx) & [ChatbotPanel](file:///D:/dinak/FIFA/src/components/ChatbotPanel.jsx) | Combines rule-based synonym search caching with Gemini `askGenie` Cloud Functions. Supports a language selection widget that translates responses end-to-end to targets like Spanish (es), French (fr), German (de), and Italian (it) via Firebase Callable functions. |


