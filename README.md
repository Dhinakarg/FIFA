# 🧞‍♂️ StadiumAssist - Operations & Telemetry Hub

StadiumAssist is a premium, real-time Single Page Application (SPA) designed to handle stadium crowd telemetry, safety coordination, and operations briefings. It connects to **Google Firebase** (Firestore database, Auth, and Functions) with a robust offline **Local Simulation Mode** fallback. It also integrates **Gemini AI** for decision-support briefings, FAQ verification, and emergency classification.

Live Demo:
- **Firebase Hosting (Root path)**: [https://carbon-footprint-awarene-542a4.web.app](https://carbon-footprint-awarene-542a4.web.app)
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
   VITE_FIREBASE_AUTH_DOMAIN="carbon-footprint-awarene-542a4.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="carbon-footprint-awarene-542a4"
   VITE_FIREBASE_STORAGE_BUCKET="carbon-footprint-awarene-542a4.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="915212873605"
   VITE_FIREBASE_APP_ID="1:915212873605:web:46f70f873f6d91ea441eec"
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
- **Deploy to Firebase Hosting**:
  ```bash
  npx firebase deploy --only hosting
  ```
- **Deploy to GitHub Pages**:
  ```bash
  npm run deploy
  ```
