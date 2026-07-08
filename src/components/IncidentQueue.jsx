import React from "react";
import { AlertTriangle, CheckCircle, Play, ShieldCheck } from "lucide-react";

/**
 * IncidentQueue component rendering active incidents logs.
 * Offers handlers for authorization staff to acknowledge dispatch or resolve issues.
 * 
 * @param {Object} props
 * @param {Array} props.activeIncidents - Active unresolved incidents list
 * @param {boolean} props.isAuthorized - Verification flag of staff roles
 * @param {Function} props.updateIncidentStatus - Callback to update incident status state
 */
export function IncidentQueue({ activeIncidents, isAuthorized, updateIncidentStatus }) {
  return (
    <div className="glass-panel" style={{ padding: "24px" }}>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-rose)", display: "flex", alignItems: "center", gap: "8px" }}>
        <AlertTriangle size={18} />
        Live Incidents Dispatch Queue
      </h3>
      
      {activeIncidents.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
          <CheckCircle size={32} style={{ color: "var(--color-emerald)", marginBottom: "8px" }} />
          <p>No active incidents reported! All zones clear.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {activeIncidents.map(inc => (
            <div 
              key={inc.id}
              className="glass-panel glow-rose-hover"
              style={{
                padding: "20px",
                borderLeft: inc.type === "medical" || inc.type === "fire" || inc.type === "fight"
                  ? "4px solid var(--color-rose)" 
                  : "4px solid var(--color-amber)",
                background: "rgba(10, 14, 26, 0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{inc.title || `${inc.type} Incident`}</h4>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Location: <strong>{inc.location}</strong> | Severity: <span className={`badge-status badge-${inc.severity === "Critical" ? "critical" : inc.severity === "High" ? "high" : inc.severity === "Medium" ? "medium" : "low"}`}>{inc.severity}</span>
                  </span>
                </div>
                <span className={`badge-status badge-${inc.status}`}>
                  {inc.status === "in-progress" ? "Dispatch Active" : "Pending Queue"}
                </span>
              </div>

              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "12px 0" }}>
                {inc.description}
              </p>

              {isAuthorized && (
                <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                  {inc.status === "pending" && (
                    <button 
                      onClick={() => updateIncidentStatus(inc.id, "in-progress")} 
                      className="interactive-btn secondary"
                      style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "8px" }}
                    >
                      <Play size={12} style={{ marginRight: "4px" }} />
                      Acknowledge & Dispatch
                    </button>
                  )}
                  <button 
                    onClick={() => updateIncidentStatus(inc.id, "resolved")} 
                    className="interactive-btn"
                    style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "8px", background: "linear-gradient(135deg, var(--color-emerald) 0%, #047857 100%)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)" }}
                  >
                    <ShieldCheck size={12} style={{ marginRight: "4px" }} />
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
