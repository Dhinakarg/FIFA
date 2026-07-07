import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { AppStateProvider, useAppState } from "./context/AppStateContext";
import { classifyEmergencyCallable } from "./firebase";
import Home from "./pages/Home";
import FanAssistant from "./pages/FanAssistant";
import StadiumMap from "./pages/StadiumMap";
import CrowdDashboard from "./pages/CrowdDashboard";
import StaffOperations from "./pages/StaffOperations";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminPanel from "./pages/AdminPanel";
import { 
  Home as HomeIcon, 
  MessageSquare, 
  Map, 
  BarChart3, 
  Settings, 
  Shield, 
  Calendar,
  AlertTriangle,
  Menu,
  X,
  ShieldAlert,
  Loader2,
  Users,
  Compass,
  CheckCircle
} from "lucide-react";

function NavigationWrapper() {
  const { 
    userRole, 
    evacuationAlarm, 
    triggerEvacuationAlarm, 
    reportIncident, 
    volunteers, 
    isFirebaseActive,
    addLog 
  } = useAppState();

  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appLoaded, setAppLoaded] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoaded(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Emergency Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emergencyDesc, setEmergencyDesc] = useState("");
  const [emergencyType, setEmergencyType] = useState("unclear"); // Default to auto-classify
  const [emergencyLoc, setEmergencyLoc] = useState("Zone A (Concourse)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null); // Displays SOP/Volunteer directions when set

  const navigationItems = [
    { name: "Home Dashboard", path: "/", icon: HomeIcon },
    { name: "Fan Assistant", path: "/assistant", icon: MessageSquare },
    { name: "Stadium Map", path: "/map", icon: Map },
    { name: "Crowd Dashboard", path: "/crowd", icon: BarChart3 },
    { name: "Staff Operations", path: "/operations", icon: Settings },
    { name: "Organizer Console", path: "/organizer", icon: Calendar },
    { name: "Admin Panel", path: "/admin", icon: Shield }
  ];

  const getRoleLabel = () => {
    switch (userRole) {
      case "fan": return "Fan View";
      case "staff": return "Staff View";
      case "organizer": return "Organizer View";
      case "admin": return "System Admin";
      default: return "User View";
    }
  };

  // Predefined SOPs
  const predefinedSOPs = {
    "fire": "🚨 SOP-FIRE:\n1. Pull the nearest fire alarm station.\n2. Evacuate the sector immediately.\n3. Call Fire Dispatch.\n4. Guide fans to Gate A & D exits.",
    "medical": "✙ SOP-MEDICAL:\n1. Deploy the nearest zone first aider with AED.\n2. Clear the aisle for paramedic ingress.\n3. Provide CPR/First Aid if trained.",
    "lost child": "👦 SOP-LOST-CHILD:\n1. Alert all zone gate ushers.\n2. Lock down exit turnstiles.\n3. Escort parent to Customer Help Hub Section 101.\n4. Initiate child description broadcast.",
    "fight": "👊 SOP-CROWD-FIGHT:\n1. Dispatch Zone Security squad.\n2. Avoid physical intervention until squad arrives.\n3. Monitor via CCTV Section.\n4. Alert local police unit.",
    "power failure": "🔌 SOP-POWER-FAILURE:\n1. Activate backup generators.\n2. Guard gates and emergency exits manually.\n3. Re-establish comms loop.\n4. Advise fans via PA."
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    if (!emergencyDesc.trim()) return;

    setIsSubmitting(true);
    addLog(`Emergency Trigger: Initiating critical response procedures...`);

    let resolvedCategory = emergencyType;

    // Call Gemini Cloud Function to classify if category is unclear
    if (emergencyType === "unclear") {
      addLog("Unclear category. Running Gemini classification Cloud Function...");
      try {
        if (classifyEmergencyCallable) {
          const result = await classifyEmergencyCallable({ description: emergencyDesc });
          resolvedCategory = result.data.type;
        } else {
          // Simulation keyword matcher fallback
          const text = emergencyDesc.toLowerCase();
          if (text.includes("fire") || text.includes("smoke") || text.includes("burn")) resolvedCategory = "fire";
          else if (text.includes("fight") || text.includes("hit") || text.includes("beat")) resolvedCategory = "fight";
          else if (text.includes("child") || text.includes("kid") || text.includes("lost")) resolvedCategory = "lost child";
          else if (text.includes("power") || text.includes("light") || text.includes("dark")) resolvedCategory = "power failure";
          else resolvedCategory = "medical";
        }
        addLog(`Gemini Classification result: "${resolvedCategory}"`);
      } catch (err) {
        console.warn("Gemini classification failed, running local keyword rule checks:", err);
        addLog(`Gemini Classification failed: ${err.message}. Running local rules...`);
        
        const text = emergencyDesc.toLowerCase();
        if (text.includes("fire") || text.includes("smoke") || text.includes("burn")) resolvedCategory = "fire";
        else if (text.includes("fight") || text.includes("hit") || text.includes("beat")) resolvedCategory = "fight";
        else if (text.includes("child") || text.includes("kid") || text.includes("lost")) resolvedCategory = "lost child";
        else if (text.includes("power") || text.includes("light") || text.includes("dark")) resolvedCategory = "power failure";
        else resolvedCategory = "medical";
        
        addLog(`Local rules classified category as: "${resolvedCategory}"`);
      }
    }

    // Determine the volunteer in the zone
    const targetZone = emergencyLoc.includes("Zone A") ? "Zone A" 
                    : emergencyLoc.includes("Zone B") ? "Zone B"
                    : emergencyLoc.includes("Zone C") ? "Zone C"
                    : emergencyLoc.includes("Zone D") ? "Zone D"
                    : "Zone E";

    // Find nearest available volunteer in the zone, or fallback to any available overall
    const zoneVolunteers = volunteers.filter(v => v.zone === targetZone && v.status === "available");
    const nearestVol = zoneVolunteers[0] || volunteers.find(v => v.status === "available") || { name: "Response Team Alpha", contactMethod: "Emergency Broadcast Channel 1" };

    const titleText = `CRITICAL ALERT: ${resolvedCategory.toUpperCase()} in ${targetZone}`;
    
    // Submit Critical Incident. This automatically updates Firestore, which dispatches to Staff Operations via real-time listeners.
    await reportIncident(
      titleText, 
      emergencyDesc, 
      resolvedCategory, 
      emergencyLoc, 
      "Emergency Console Trigger", 
      "Critical"
    );

    // Set active alert parameters to display SOP and routing details in the modal
    setActiveAlert({
      category: resolvedCategory,
      location: emergencyLoc,
      sopText: predefinedSOPs[resolvedCategory] || "SOP-GENERAL:\n1. Alert Security supervisors.\n2. Advise guests to follow nearest exits.",
      volunteer: nearestVol,
      evacuationRoute: resolvedCategory === "fire" || resolvedCategory === "power failure"
        ? "⚠️ HIGH HAZARD EVACUATION: Evacuate the sector immediately. Go through Gate A (West) or Gate D (East)."
        : "STANDARD EVACUATION: Egress routes are clear. Follow concourse directional path to Gate A, B, C, or D exits."
    });

    setIsSubmitting(false);
  };

  const closeEmergencyModal = () => {
    setIsModalOpen(false);
    setActiveAlert(null);
    setEmergencyDesc("");
    setEmergencyType("unclear");
  };

  if (!appLoaded) {
    return (
      <div style={{
        width: "100vw",
        height: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px"
      }}>
        <div style={{ position: "relative", width: "80px", height: "80px" }}>
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            border: "4px solid rgba(37, 99, 235, 0.1)",
            borderTop: "4px solid #2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <div style={{
            position: "absolute",
            width: "70%",
            height: "70%",
            top: "15%",
            left: "15%",
            border: "4px solid rgba(16, 185, 129, 0.1)",
            borderBottom: "4px solid #10b981",
            borderRadius: "50%",
            animation: "spin 1.5s linear infinite reverse"
          }} />
        </div>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.4rem",
          color: "#0f172a",
          letterSpacing: "0.1em",
          animation: "pulse-border 2s infinite alternate"
        }}>
          STADIUMASSIST OPERATIONS
        </h2>
        <span style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase" }}>
          Initializing telemetry loops...
        </span>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Background ambient light */}
      <div className="bg-ambient-glow" />

      {/* Top Navbar */}
      <header className="top-navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button 
            className="mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
            Operations Control Panel
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* CRITICAL EMERGENCY NAVIGATION BUTTON */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="interactive-btn danger"
            style={{ 
              padding: "8px 16px", 
              fontSize: "0.85rem", 
              borderRadius: "8px", 
              boxShadow: "var(--glow-rose)",
              animation: "pulse-border 1s infinite alternate" 
            }}
          >
            <ShieldAlert size={14} style={{ marginRight: "6px" }} />
            EMERGENCY
          </button>

          {evacuationAlarm && (
            <span 
              className="badge-status badge-high" 
              style={{ animation: "pulse-border 1.5s infinite alternate", display: "flex", gap: "6px", alignItems: "center" }}
            >
              <AlertTriangle size={14} />
              EVAC WARNING
            </span>
          )}
          {!isFirebaseActive && (
            <span 
              className="badge-status badge-high" 
              style={{ 
                background: "rgba(245, 158, 11, 0.1)", 
                borderColor: "rgba(245, 158, 11, 0.25)", 
                color: "var(--color-amber)", 
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                animation: "pulse-border 1.5s infinite alternate"
              }}
              title="Running on offline local mock states"
            >
              ● OFFLINE (SIMULATOR)
            </span>
          )}
          <span className={`role-badge role-${userRole}`}>
            {getRoleLabel()}
          </span>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <span>🧞‍♂️ StadiumAssist</span>
        </div>

        <ul className="sidebar-menu">
          {navigationItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="sidebar-item">
                <Link 
                  to={item.path} 
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ padding: "20px", borderTop: "1px solid var(--border-glass)", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
          StadiumAssist Telemetry v1.0
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        {/* Global Emergency Evacuation Alert */}
        {evacuationAlarm && (
          <div className="global-alert" style={{ animation: "pulse-border 1s infinite alternate" }}>
            <div>
              <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={20} />
                CRITICAL EMERGENCY SYSTEM ALERT
              </h4>
              <p style={{ marginTop: "4px" }}>
                A stadium-wide evacuation alarm has been triggered. Please calmly head to the nearest exit gate. Operational staff is standing by to coordinate.
              </p>
            </div>
            <button 
              className="global-alert-btn" 
              onClick={() => triggerEvacuationAlarm(false)}
            >
              Acknowledge & Mute
            </button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/assistant" element={<FanAssistant />} />
          <Route path="/map" element={<StadiumMap />} />
          <Route path="/crowd" element={<CrowdDashboard />} />
          <Route path="/operations" element={<StaffOperations />} />
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>

      {/* EMERGENCY MODAL POPUP DISPLAY */}
      {isModalOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(5, 8, 17, 0.85)",
            backdropFilter: "blur(12px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: "100%", 
              maxWidth: "550px", 
              padding: "30px",
              boxShadow: "0 0 30px rgba(244, 63, 94, 0.2)",
              border: "1px solid rgba(244, 63, 94, 0.4)"
            }}
          >
            {activeAlert ? (
              // STEP 2: DISPLAY EMERGENCY DATA: PREDEFINED SOP, NEAREST VOLUNTEER, EVAC INFO
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ color: "var(--color-rose)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "1.3rem" }}>
                    <ShieldAlert size={22} />
                    Critical Emergency Initiated
                  </h3>
                  <span className="badge-status badge-critical">Critical</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* Category confirmation details */}
                  <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Report Location:</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: "2px" }}>{activeAlert.location}</div>
                  </div>

                  {/* SOP Checklist */}
                  <div style={{ background: "rgba(245, 158, 11, 0.03)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-amber)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
                      Emergency Procedure (SOP)
                    </div>
                    <p style={{ fontSize: "0.85rem", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                      {activeAlert.sopText}
                    </p>
                  </div>

                  {/* Nearest Volunteer display */}
                  <div style={{ background: "rgba(16, 185, 129, 0.03)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-emerald)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
                      Nearest Active Volunteer Dispatched
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>{activeAlert.volunteer.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                          Zone: {activeAlert.volunteer.zone} | Contact: {activeAlert.volunteer.contactMethod}
                        </div>
                      </div>
                      <span className="badge-status badge-resolved" style={{ fontSize: "0.7rem" }}>
                        Assigned
                      </span>
                    </div>
                  </div>

                  {/* Evacuation instructions */}
                  <div style={{ background: "rgba(244, 63, 94, 0.03)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(244, 63, 94, 0.2)" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-rose)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" }}>
                      Evacuation Routing Egress
                    </div>
                    <p style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                      {activeAlert.evacuationRoute}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={closeEmergencyModal} 
                  className="interactive-btn secondary"
                  style={{ width: "100%", marginTop: "24px" }}
                >
                  Dismiss Advisory
                </button>
              </div>
            ) : (
              // STEP 1: RENDER DISPATCH SUBMISSION FORM (SELECT TYPE OR AUTO-CLASSIFY VIA GEMINI)
              <form onSubmit={handleEmergencySubmit}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ color: "var(--color-rose)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "1.3rem" }}>
                    <ShieldAlert size={22} />
                    Report Critical Emergency
                  </h3>
                  <button 
                    type="button" 
                    onClick={closeEmergencyModal}
                    style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
                  Logging here flags a Critical incident immediately. Firestore listeners will dispatch real-time warning indicators to Staff Operations boards.
                </p>

                <div className="input-group">
                  <label className="input-label">Emergency Category</label>
                  <select 
                    className="form-input" 
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="unclear">Unsure / Unclear (Auto-classify via Gemini AI)</option>
                    <option value="medical">Medical Medical</option>
                    <option value="fire">Fire Emergency</option>
                    <option value="lost child">Lost Child Alert</option>
                    <option value="fight">Physical Altercation</option>
                    <option value="power failure">Power Failure</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Location / Sector</label>
                  <select 
                    className="form-input" 
                    value={emergencyLoc}
                    onChange={(e) => setEmergencyLoc(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="Zone A (Concourse)">Zone A (West Stand)</option>
                    <option value="Zone B (Concourse)">Zone B (North Stand)</option>
                    <option value="Zone C (Seating)">Zone C (East Stand)</option>
                    <option value="Zone D (Seating)">Zone D (South Stand)</option>
                    <option value="Zone E (Suites)">Zone E (VIP Suites)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Unstructured Incident Description</label>
                  <textarea 
                    className="form-input" 
                    rows="4" 
                    placeholder="Provide details. (If Category is set to Unclear, Gemini will parse keywords like 'smoke', 'heart attack', or 'kid lost' to classify it)."
                    value={emergencyDesc}
                    onChange={(e) => setEmergencyDesc(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <button 
                  type="submit" 
                  className="interactive-btn danger" 
                  style={{ width: "100%", marginTop: "10px" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ marginRight: "8px", animation: "spin 1s linear infinite" }} />
                      Classifying emergency profiles...
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={16} style={{ marginRight: "8px" }} />
                      Raise Critical Alert
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      
      {/* Keyframe animation for spinner */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <Router>
        <NavigationWrapper />
      </Router>
    </AppStateProvider>
  );
}
