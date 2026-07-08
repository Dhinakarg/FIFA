import React from "react";

/**
 * GatesStatsTable component rendering real-time ingress progress loaders 
 * and alternate route suggestions for congested entrances.
 * 
 * @param {Object} props
 * @param {Array} props.gates - Active gates telemetry list
 * @param {Function} props.suggestAlternateGate - Helper function to fetch best route diversion target
 */
export function GatesStatsTable({ gates, suggestAlternateGate }) {
  return (
    <div className="glass-panel" style={{ padding: "24px" }}>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)" }}>
        Real-time Gates Ingress Flow
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {gates.map(gate => {
          const loadPercent = gate.currentCount / gate.capacity;
          const loadPercentFormatted = Math.round(loadPercent * 100);
          const isCongested = loadPercent > 0.8;

          let statusColor = "var(--color-emerald)";
          if (loadPercent > 0.5) statusColor = "var(--color-amber)";
          if (isCongested) statusColor = "var(--color-rose)";

          return (
            <div 
              key={gate.id} 
              className="glass-panel" 
              style={{ 
                padding: "20px", 
                background: isCongested ? "rgba(244, 63, 94, 0.02)" : "rgba(255, 255, 255, 0.01)",
                borderColor: isCongested ? "rgba(244, 63, 94, 0.2)" : "var(--border-glass)",
                transition: "var(--transition)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{gate.name}</h4>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Sensor load: <strong>{gate.currentCount}</strong> / {gate.capacity} capacity
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span className={`badge-status badge-${gate.status.toLowerCase()}`}>
                    {gate.status} Load
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: statusColor }}>
                    {loadPercentFormatted}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="queue-progress-bar" style={{ marginTop: "12px", height: "10px" }}>
                <div 
                  className="queue-progress-fill" 
                  style={{ 
                    width: `${loadPercentFormatted}%`,
                    backgroundColor: statusColor,
                    boxShadow: `0 0 10px ${statusColor}`
                  }} 
                />
              </div>

              {/* Alternate suggestion rule */}
              {isCongested && (
                <div 
                  style={{ 
                    marginTop: "12px", 
                    padding: "10px 14px", 
                    background: "rgba(245, 158, 11, 0.05)", 
                    border: "1px solid rgba(245, 158, 11, 0.15)", 
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    color: "var(--color-amber)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span>⚠️ Congestion threshold exceeded. <strong>Alternate Route Suggestion:</strong></span>
                  <span style={{ fontWeight: 700 }}>{suggestAlternateGate(gate)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
