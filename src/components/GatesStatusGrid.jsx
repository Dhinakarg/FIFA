import React from "react";

/**
 * GatesStatusGrid component managing gate lock state controls.
 * 
 * @param {Object} props
 * @param {Object} props.gateStates - Lock profiles state map
 * @param {Function} props.onToggleGate - Callback to unlock/lock gates RFID scanner turnstiles
 * @param {boolean} props.isAuthorized - Verification flag of organizer roles
 */
export function GatesStatusGrid({ gateStates, onToggleGate, isAuthorized }) {
  return (
    <div className="glass-panel" style={{ padding: "24px" }}>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)" }}>
        Gate Entry Lock Profiles
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        {Object.keys(gateStates).map(gId => {
          const isClosed = gateStates[gId] === "closed";
          const gateName = gId === "gate-a" ? "Main Gate A" 
                        : gId === "gate-b" ? "North Gate B" 
                        : gId === "gate-c" ? "South Gate C"
                        : "East Gate D";

          return (
            <div 
              key={gId} 
              className="glass-panel" 
              style={{ 
                padding: "16px", 
                textAlign: "center",
                borderColor: isClosed ? "var(--color-rose)" : "var(--border-glass)",
                background: isClosed ? "rgba(244, 63, 94, 0.01)" : "rgba(255,255,255,0.01)"
              }}
            >
              <h4 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "8px" }}>{gateName}</h4>
              <div style={{ marginBottom: "12px" }}>
                <span className={`badge-status ${isClosed ? 'badge-high' : 'badge-resolved'}`}>
                  {isClosed ? "LOCkED (RFID Disabled)" : "OPEN (Ingress Active)"}
                </span>
              </div>
              <button
                onClick={() => onToggleGate(gId, gateStates[gId])}
                className={`interactive-btn ${isClosed ? 'success' : 'danger'}`}
                style={{ width: "100%", padding: "8px", fontSize: "0.8rem", borderRadius: "8px" }}
                disabled={!isAuthorized}
                aria-label={`${isClosed ? 'Unlock' : 'Lock'} turnstiles for ${gateName}`}
              >
                {isClosed ? "Unlock Turnstiles" : "Lock Turnstiles"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
