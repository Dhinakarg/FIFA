import React from "react";
import { Navigation, Info, User, X } from "lucide-react";

/**
 * FacilityPanel component rendering concourse route controls, selected location
 * telemetry diagnostics, and nearest volunteer crew details.
 * 
 * @param {Object} props
 * @param {Object|null} props.activeFac - Currently selected facility pin details
 * @param {string} props.selectedGate - Starting entry gate ID
 * @param {Function} props.setSelectedGate - Switch gate ID selector state callback
 * @param {boolean} props.showDirections - Display calculated trajectory paths trigger state
 * @param {Function} props.setShowDirections - Toggle showing walking directions path state
 * @param {Object} props.gateCoords - Absolute coordinate configs map of gates A-D
 * @param {string} props.activeZone - Proximity zone of selected facility
 * @param {Object|null} props.telemetry - Line queue wait times details for the active facility
 * @param {Array} props.localVolunteers - List of staff members free inside target proximity zone
 */
export function FacilityPanel({
  activeFac,
  selectedGate,
  setSelectedGate,
  showDirections,
  setShowDirections,
  gateCoords,
  activeZone,
  telemetry,
  localVolunteers
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Path Finding Control Panel */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Navigation size={18} />
          Concourse Directions
        </h3>

        <div className="input-group">
          <label className="input-label">Select Starting Gate</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {Object.keys(gateCoords).map(gId => (
              <button
                key={gId}
                onClick={() => {
                  setSelectedGate(gId);
                  setShowDirections(false);
                }}
                className="interactive-btn secondary"
                style={{
                  padding: "8px 0",
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  borderColor: selectedGate === gId ? "var(--color-cyan)" : "var(--border-glass)",
                  background: selectedGate === gId ? "rgba(6, 182, 212, 0.15)" : "var(--bg-tertiary)",
                  color: selectedGate === gId ? "var(--color-cyan)" : "var(--text-primary)"
                }}
              >
                {gateCoords[gId].name.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Active Destination</label>
          <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "10px", fontSize: "0.9rem" }}>
            📍 {activeFac ? activeFac.name : "Select a marker on map"}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button 
            onClick={() => setShowDirections(true)} 
            className="interactive-btn" 
            style={{ flexGrow: 1, padding: "10px", fontSize: "0.85rem" }}
            disabled={!activeFac}
          >
            Find Walking Path
          </button>
          {showDirections && (
            <button 
              onClick={() => setShowDirections(false)} 
              className="interactive-btn secondary" 
              style={{ padding: "10px" }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Details & Telemetry */}
      {activeFac && (
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", textTransform: "capitalize" }}>
            {activeFac.name}
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "16px" }}>
            {activeFac.description}
          </p>
          
          <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Proximity Zone:</span>
              <span style={{ fontWeight: 600, color: "var(--color-indigo)" }}>{activeZone}</span>
            </div>
            {telemetry ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Line Wait Estimate:</span>
                  <span style={{ fontWeight: 600, color: telemetry.status === 'high' ? 'var(--color-rose)' : telemetry.status === 'medium' ? 'var(--color-amber)' : 'var(--color-emerald)' }}>
                    {telemetry.waitTime} minutes
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Capacity Load:</span>
                  <span style={{ fontWeight: 600 }}>{telemetry.capacity}%</span>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.02)", padding: "8px", borderRadius: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                <Info size={12} />
                <span>No wait times telemetry active for this sector.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proximity Support Volunteers */}
      {activeFac && (
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: "12px", color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "6px" }}>
            <User size={16} />
            Zone Support Crew
          </h3>
          
          {localVolunteers.length === 0 ? (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No staff currently assigned to this immediate zone.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {localVolunteers.map(vol => (
                <div 
                  key={vol.id}
                  style={{ 
                    padding: "10px", 
                    borderRadius: "8px", 
                    background: "rgba(255,255,255,0.02)", 
                    border: "1px solid var(--border-glass)", 
                    fontSize: "0.8rem" 
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                    <span>{vol.name}</span>
                    <span style={{ fontSize: "0.7rem", color: vol.status === "available" ? "var(--color-emerald)" : "var(--color-amber)" }}>
                      ● {vol.status === "available" ? "Active" : "Busy"}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "2px" }}>
                    Role: {vol.role} | Contact: {vol.contactMethod}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
