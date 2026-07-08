import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAppState } from "../context/AppStateContext";
import Home from "../pages/Home";
import FanAssistant from "../pages/FanAssistant";
import StadiumMap from "../pages/StadiumMap";
import CrowdDashboard from "../pages/CrowdDashboard";
import StaffOperations from "../pages/StaffOperations";
import { SidebarNavigation } from "./SidebarNavigation";
import { EmergencyModal } from "./EmergencyModal";
import { useEmergencyHandler } from "../hooks/useEmergencyHandler";
import { 
  Home as HomeIcon, 
  MessageSquare, 
  Map, 
  BarChart3, 
  Settings, 
  Shield, 
  Calendar,
  AlertTriangle
} from "lucide-react";

const OrganizerDashboard = React.lazy(() => import("../pages/OrganizerDashboard"));
const AdminPanel = React.lazy(() => import("../pages/AdminPanel"));

const navigationItems = [
  { name: "Home Dashboard", path: "/", icon: HomeIcon },
  { name: "Fan Assistant", path: "/assistant", icon: MessageSquare },
  { name: "Stadium Map", path: "/map", icon: Map },
  { name: "Crowd Dashboard", path: "/crowd", icon: BarChart3 },
  { name: "Staff Operations", path: "/operations", icon: Settings },
  { name: "Organizer Console", path: "/organizer", icon: Calendar },
  { name: "Admin Panel", path: "/admin", icon: Shield }
];

const predefinedSOPs = {
  "fire": "🚨 SOP-FIRE:\n1. Pull the nearest fire alarm station.\n2. Evacuate the sector immediately.\n3. Call Fire Dispatch.\n4. Guide fans to Gate A & D exits.",
  "medical": "✙ SOP-MEDICAL:\n1. Deploy the nearest zone first aider with AED.\n2. Clear the aisle for paramedic ingress.\n3. Provide CPR/First Aid if trained.",
  "lost child": "👦 SOP-LOST-CHILD:\n1. Alert all zone gate ushers.\n2. Lock down exit turnstiles.\n3. Escort parent to Customer Help Hub Section 101.\n4. Initiate child description broadcast.",
  "fight": "👊 SOP-CROWD-FIGHT:\n1. Dispatch Zone Security squad.\n2. Avoid physical intervention until squad arrives.\n3. Monitor via CCTV Section.\n4. Alert local police unit.",
  "power failure": "🔌 SOP-POWER-FAILURE:\n1. Activate backup generators.\n2. Guard gates and emergency exits manually.\n3. Re-establish comms loop.\n4. Advise fans via PA."
};

/**
 * NavigationWrapper layout shell manager.
 * Handles app loading state, side routing maps, global critical notifications, 
 * and emergency reports triggers.
 * 
 * @returns {JSX.Element} The active operations UI layout
 */
export default function NavigationWrapper() {
  const { 
    userRole, 
    evacuationAlarm, 
    triggerEvacuationAlarm, 
    reportIncident, 
    volunteers, 
    addLog 
  } = useAppState();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [appLoaded, setAppLoaded] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoaded(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const getRoleLabel = () => {
    switch (userRole) {
      case "fan": return "Fan View";
      case "staff": return "Staff View";
      case "organizer": return "Organizer View";
      case "admin": return "System Admin";
      default: return "User View";
    }
  };

  const {
    isModalOpen,
    setIsModalOpen,
    emergencyDesc,
    setEmergencyDesc,
    emergencyType,
    setEmergencyType,
    emergencyLoc,
    setEmergencyLoc,
    isSubmitting,
    activeAlert,
    handleEmergencySubmit,
    closeEmergencyModal
  } = useEmergencyHandler(volunteers, reportIncident, addLog, predefinedSOPs);

  if (!appLoaded) {
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#f8fafc",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px"
      }}>
        <div style={{ position: "relative", width: "80px", height: "80px" }}>
          <div style={{
            position: "absolute", width: "100%", height: "100%",
            border: "4px solid rgba(37, 99, 235, 0.1)", borderTop: "4px solid #2563eb",
            borderRadius: "50%", animation: "spin 1s linear infinite"
          }} />
          <div style={{
            position: "absolute", width: "70%", height: "70%", top: "15%", left: "15%",
            border: "4px solid rgba(16, 185, 129, 0.1)", borderBottom: "4px solid #10b981",
            borderRadius: "50%", animation: "spin 1.5s linear infinite reverse"
          }} />
        </div>
        <h2 style={{
          fontFamily: "var(--font-heading)", fontSize: "1.4rem", color: "#0f172a",
          letterSpacing: "0.1em", animation: "pulse-border 2s infinite alternate"
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
    <div className={`app-container ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="bg-ambient-glow" />

      <SidebarNavigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenEmergencyModal={() => setIsModalOpen(true)}
        evacuationAlarm={evacuationAlarm}
        userRole={userRole}
        getRoleLabel={getRoleLabel}
        navigationItems={navigationItems}
        theme={theme}
        setTheme={setTheme}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      <main className="main-content">
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
            <button className="global-alert-btn" onClick={() => triggerEvacuationAlarm(false)}>
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
          <Route path="/organizer" element={
            <React.Suspense fallback={<div style={{ padding: "24px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading Organizer Console...</div>}>
              <OrganizerDashboard />
            </React.Suspense>
          } />
          <Route path="/admin" element={
            <React.Suspense fallback={<div style={{ padding: "24px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>Loading Admin Panel...</div>}>
              <AdminPanel />
            </React.Suspense>
          } />
        </Routes>
      </main>

      <EmergencyModal
        isOpen={isModalOpen}
        activeAlert={activeAlert}
        emergencyType={emergencyType}
        setEmergencyType={setEmergencyType}
        emergencyLoc={emergencyLoc}
        setEmergencyLoc={setEmergencyLoc}
        emergencyDesc={emergencyDesc}
        setEmergencyDesc={setEmergencyDesc}
        isSubmitting={isSubmitting}
        onSubmit={handleEmergencySubmit}
        onClose={closeEmergencyModal}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
