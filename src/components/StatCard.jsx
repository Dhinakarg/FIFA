import React from "react";

export default function StatCard({ title, value, icon: Icon, color = "indigo", subtext }) {
  const colorMap = {
    cyan: "var(--color-cyan)",
    indigo: "var(--color-indigo)",
    purple: "var(--color-purple)",
    emerald: "var(--color-emerald)",
    amber: "var(--color-amber)",
    rose: "var(--color-rose)"
  };



  const themeColor = colorMap[color] || colorMap.indigo;

  return (
    <div 
      className="glass-panel metric-card" 
      style={{ 
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative ambient color patch */}
      <div 
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          background: themeColor,
          opacity: 0.08,
          borderRadius: "50%",
          filter: "blur(15px)"
        }}
      />
      
      <div 
        className="metric-icon-wrapper"
        style={{
          background: `rgba(${color === 'cyan' ? '6,182,212' : color === 'emerald' ? '16,185,129' : color === 'rose' ? '244,63,94' : color === 'amber' ? '245,158,11' : color === 'purple' ? '168,85,247' : '99,102,241'}, 0.12)`,
          color: themeColor,
          boxShadow: `inset 0 0 10px rgba(${color === 'cyan' ? '6,182,212' : color === 'emerald' ? '16,185,129' : color === 'rose' ? '244,63,94' : color === 'amber' ? '245,158,11' : color === 'purple' ? '168,85,247' : '99,102,241'}, 0.2)`
        }}
      >
        <Icon size={24} />
      </div>
      
      <div className="metric-info">
        <h5>{title}</h5>
        <div className="metric-value" style={{ color: "var(--text-primary)" }}>{value}</div>
        {subtext && (
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}
