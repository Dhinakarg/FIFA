import React from "react";
import { useAppState } from "../context/AppStateContext";
import { Sliders } from "lucide-react";
import { AuthSimulator } from "../components/AuthSimulator";
import { VolunteerSimulator } from "../components/VolunteerSimulator";
import { SystemLogsView } from "../components/SystemLogsView";
import { RoleSimulationWidget } from "../components/RoleSimulationWidget";

/**
 * AdminPanel component displays developer authentication simulators, 
 * RBAC role overrides, mock database seed tools, and live telemetry log flows.
 * Delegates CRUD database edit views to the VolunteerSimulator component.
 * 
 * @returns {JSX.Element} The active AdminPanel page
 */
export default function AdminPanel() {
  const { 
    userRole, 
    setUserRole, 
    systemLogs, 
    seedTestData, 
    reportIncident,
    faqs,
    saveFaq,
    deleteFaq,
    facilities,
    saveFacility,
    deleteFacility,
    gates,
    saveGate,
    deleteGate,
    volunteers,
    saveVolunteer,
    deleteVolunteer,
    currentUser,
    loginWithEmail,
    registerWithEmail,
    logout,
    isFirebaseActive 
  } = useAppState();

  const handleRoleChange = (role) => {
    setUserRole(role);
  };

  const handleQuickIncident = () => {
    const titles = ["Spill at Gate B Entrance", "Damaged seat row 4", "Restroom cleanup required", "Suspicious bag Zone D"];
    const locs = ["Gate B Entrance", "Zone C (Seating)", "North Plaza Washrooms", "Zone D (Seating)"];
    const types = ["maintenance", "facility", "maintenance", "security"];
    const idx = Math.floor(Math.random() * titles.length);
    reportIncident(titles[idx], "Auto-generated test alert for developer checking.", types[idx], locs[idx], "System Tester", "High");
  };

  const isAuthorized = userRole === "admin";

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Developer & Admin Control Panel</h1>
        <p className="page-description">Configure database parameters, verify AI knowledge bases, and simulate user security scopes.</p>
      </div>

      {!isAuthorized && (
        <div className="global-alert" style={styles.unauthAlert}>
          <span>⚠️ Viewing in <strong>Fan Read-Only mode</strong>. Switch roles to <strong>Admin</strong> below to configure database parameters.</span>
        </div>
      )}

      <div className="grid-cols-2" style={{ gap: "30px", marginBottom: "30px" }}>
        <AuthSimulator 
          currentUser={currentUser}
          loginWithEmail={loginWithEmail}
          registerWithEmail={registerWithEmail}
          logout={logout}
          isFirebaseActive={isFirebaseActive}
        />

        <RoleSimulationWidget 
          userRole={userRole}
          handleRoleChange={handleRoleChange}
          handleQuickIncident={handleQuickIncident}
          seedTestData={seedTestData}
        />
      </div>

      <div className="grid-cols-2" style={{ gap: "30px", marginBottom: "30px" }}>
        {/* Environment Telemetry */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sliders size={18} />
            Active SDK Environment
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
            Check backend bindings and network routing active status:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>Firebase Sync:</span>
              <span style={{ fontWeight: 600, color: isFirebaseActive ? "var(--color-emerald)" : "var(--color-amber)" }}>
                {isFirebaseActive ? "CONNECTED (Firestore)" : "SIMULATION Fallback"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>Gemini AI Router:</span>
              <span style={{ fontWeight: 600 }}>Cloud Functions isolation</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Auto-Approval:</span>
              <span style={{ fontWeight: 600, color: "var(--color-amber)" }}>Admin approval required</span>
            </div>
          </div>
        </div>

        <SystemLogsView systemLogs={systemLogs} />
      </div>

      <VolunteerSimulator 
        isAuthorized={isAuthorized}
        faqs={faqs}
        saveFaq={saveFaq}
        deleteFaq={deleteFaq}
        gates={gates}
        saveGate={saveGate}
        deleteGate={deleteGate}
        facilities={facilities}
        saveFacility={saveFacility}
        deleteFacility={deleteFacility}
        volunteers={volunteers}
        saveVolunteer={saveVolunteer}
        deleteVolunteer={deleteVolunteer}
      />
    </div>
  );
}

const styles = {
  unauthAlert: { background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--color-amber)", color: "var(--color-amber)", padding: "12px 18px", marginBottom: "24px" }
};
