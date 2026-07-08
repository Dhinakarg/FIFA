import React from "react";
import { Sliders, Radio } from "lucide-react";

/**
 * RoleSimulationWidget component displaying controls to swap simulated user roles 
 * and inject mock data/scenarios.
 * 
 * @param {Object} props
 * @param {string} props.userRole - Currently active user role
 * @param {Function} props.handleRoleChange - Callback to update active role state
 * @param {Function} props.handleQuickIncident - Callback to inject a simulated incident ticket
 * @param {Function} props.seedTestData - Callback to re-seed mock database collections
 */
export function RoleSimulationWidget({ userRole, handleRoleChange, handleQuickIncident, seedTestData }) {
  return (
    <div className="glass-panel" style={{ padding: "24px", marginBottom: "30px" }}>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-indigo)", display: "flex", alignItems: "center", gap: "8px" }}>
        <Sliders size={20} />
        Role & Simulation Controls
      </h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
        Dynamically swap between user roles to view how Role-Based Access Control (RBAC) gates specific navigation routes and buttons.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {["fan", "staff", "organizer", "admin"].map(role => (
          <label 
            key={role} 
            className="glass-panel glow-cyan-hover"
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: "12px 16px", 
              cursor: "pointer",
              background: userRole === role ? "rgba(37, 99, 235, 0.1)" : "rgba(255, 255, 255, 0.01)",
              borderColor: userRole === role ? "var(--color-cyan)" : "var(--border-glass)"
            }}
          >
            <input 
              type="radio" 
              name="user-role" 
              value={role} 
              checked={userRole === role} 
              onChange={() => handleRoleChange(role)}
              style={{ cursor: "pointer" }}
            />
            <div>
              <span style={{ textTransform: "capitalize", fontWeight: 600, display: "block" }}>{role} Role</span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {role === "fan" && "Read wait times, file cleanups"}
                {role === "staff" && "Acknowledge / resolve incidents, edit knowledge base"}
                {role === "organizer" && "Manage event details, open/close ingress gates"}
                {role === "admin" && "Access all consoles & override database grids"}
              </span>
            </div>
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
        <button onClick={handleQuickIncident} className="interactive-btn danger" style={{ padding: "10px 20px" }}>
          <Radio size={16} style={{ marginRight: "8px" }} />
          Inject Test Incident
        </button>
        <button onClick={seedTestData} className="interactive-btn secondary" style={{ padding: "10px 20px" }}>
          Re-seed Firestore Database
        </button>
      </div>
    </div>
  );
}
