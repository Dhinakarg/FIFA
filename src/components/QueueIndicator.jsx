import React from "react";
import { Clock, Users } from "lucide-react";

export default function QueueIndicator({ name, waitTime, capacity, status, type }) {
  const getStatusColor = () => {
    switch (status) {
      case "low":
        return "var(--color-emerald)";
      case "medium":
        return "var(--color-amber)";
      case "high":
        return "var(--color-rose)";
      default:
        return "var(--color-indigo)";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "low":
        return "Fast Moving";
      case "medium":
        return "Moderate Queue";
      case "high":
        return "Heavy Delay";
      default:
        return "Normal";
    }
  };

  const statusColor = getStatusColor();

  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "between", alignItems: "center", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, fontSize: "1rem" }}>{name}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginTop: "2px" }}>
            {type}
          </span>
        </div>
        <span 
          className="badge-status" 
          style={{ 
            background: `rgba(${status === 'low' ? '16,185,129' : status === 'medium' ? '245,158,11' : '244,63,94'}, 0.1)`, 
            color: statusColor,
            borderColor: `rgba(${status === 'low' ? '16,185,129' : status === 'medium' ? '245,158,11' : '244,63,94'}, 0.2)`
          }}
        >
          {getStatusLabel()}
        </span>
      </div>

      <div style={{ display: "flex", gap: "16px", margin: "8px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Clock size={16} style={{ color: statusColor }} />
          <div>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, color: statusColor }}>{waitTime}</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "4px" }}>mins</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Users size={16} style={{ color: "var(--text-secondary)" }} />
          <div>
            <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>{capacity}%</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "4px" }}>load</span>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}>
          <span>Current Throughput</span>
          <span>{capacity}% Capacity</span>
        </div>
        <div className="queue-progress-bar">
          <div 
            className="queue-progress-fill" 
            style={{ 
              width: `${capacity}%`, 
              backgroundColor: statusColor,
              boxShadow: `0 0 8px ${statusColor}`
            }} 
          />
        </div>
      </div>
    </div>
  );
}
