import React from "react";
import { Terminal } from "lucide-react";

/**
 * SystemLogsView component displaying system telemetry log lists.
 * 
 * @param {Object} props
 * @param {Array} props.systemLogs - Chronological telemetry logs
 */
export function SystemLogsView({ systemLogs }) {
  return (
    <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
        <Terminal size={20} />
        System Logs (Live Telemetry Loop)
      </h3>
      
      <div 
        style={{ 
          background: "#050811", 
          fontFamily: "monospace", 
          fontSize: "0.82rem", 
          padding: "16px", 
          borderRadius: "10px", 
          height: "250px", 
          overflowY: "auto", 
          border: "1px solid var(--border-glass)",
          color: "#38bdf8"
        }}
      >
        {systemLogs.length === 0 ? (
          <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            Telemetry loops connected. Listening for incident state mutations...
          </div>
        ) : (
          [...systemLogs].reverse().map((log, idx) => (
            <div key={idx} style={{ marginBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.01)", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
