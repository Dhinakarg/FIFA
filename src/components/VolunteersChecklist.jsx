import React from "react";
import { Users, AlertTriangle, Calendar } from "lucide-react";

/**
 * VolunteersChecklist component rendering matchday timelines alongside 
 * lists of free volunteers and active reported incidents.
 * 
 * @param {Object} props
 * @param {Array} props.activeIncidents - Active reported incidents list
 * @param {Array} props.availableVolunteers - Free active volunteer members list
 */
export function VolunteersChecklist({ activeIncidents, availableVolunteers }) {
  return (
    <div className="grid-cols-3" style={{ gap: "30px", marginBottom: "30px" }}>
      {/* Active Incident List */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-rose)", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertTriangle size={18} />
          Active Incidents ({activeIncidents.length})
        </h3>
        {activeIncidents.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "10px 0" }}>All stadium sectors reported clear.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
            {activeIncidents.map(inc => (
              <div 
                key={inc.id}
                style={{ 
                  padding: "10px", 
                  borderRadius: "8px", 
                  background: "rgba(255, 255, 255, 0.01)", 
                  border: "1px solid var(--border-glass)", 
                  fontSize: "0.85rem",
                  borderLeft: inc.severity === "Critical" ? "4px solid var(--color-rose)" : "1px solid var(--border-glass)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>{inc.title || `${inc.type} Incident`}</span>
                  <span style={{ fontSize: "0.75rem", color: inc.severity === "Critical" ? "var(--color-rose)" : "var(--text-secondary)" }}>
                    {inc.severity}
                  </span>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "2px" }}>
                  Location: {inc.location} | Status: {inc.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Volunteers */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} />
          Available Volunteers ({availableVolunteers.length})
        </h3>
        {availableVolunteers.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", padding: "10px 0" }}>No crew currently free.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
            {availableVolunteers.map(vol => (
              <div 
                key={vol.id}
                style={{ 
                  padding: "10px", 
                  borderRadius: "8px", 
                  background: "rgba(255, 255, 255, 0.01)", 
                  border: "1px solid var(--border-glass)", 
                  fontSize: "0.85rem" 
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>{vol.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-cyan)" }}>{vol.zone}</span>
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "2px" }}>
                  Role: {vol.role} | Contact: {vol.contactMethod}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Match Timeline */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar size={18} />
          Matchday Timeline
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ fontWeight: 700, color: "var(--color-cyan)", width: "45px" }}>17:00</span>
            <span style={{ color: "var(--text-secondary)" }}>Gates Open (Ingress begins)</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ fontWeight: 700, color: "var(--color-cyan)", width: "45px" }}>18:30</span>
            <span style={{ color: "var(--text-secondary)" }}>Pre-match warmups & show</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ fontWeight: 700, color: "var(--color-cyan)", width: "45px" }}>19:00</span>
            <span style={{ color: "var(--text-secondary)" }}>Match Kick-off (Ingress peak)</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ fontWeight: 700, color: "var(--color-cyan)", width: "45px" }}>19:45</span>
            <span style={{ color: "var(--text-secondary)" }}>Half-time break</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ fontWeight: 700, color: "var(--color-cyan)", width: "45px" }}>20:45</span>
            <span style={{ color: "var(--text-secondary)" }}>Final Whistle (Egress begins)</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ fontWeight: 700, color: "var(--color-cyan)", width: "45px" }}>21:30</span>
            <span style={{ color: "var(--text-secondary)" }}>Safe stadium egress completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
