import React from "react";
import { BookOpen } from "lucide-react";

/**
 * ActiveSopOverlay component showing standard operating procedure checklists
 * when critical hazards (fire, medical, etc.) are active.
 * 
 * @param {Object} props
 * @param {Object|null} props.activeSop - Predefined SOP instructions metadata
 */
export function ActiveSopOverlay({ activeSop }) {
  if (!activeSop) return null;

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: "20px", 
        borderLeft: "4px solid var(--color-amber)", 
        background: "rgba(245, 158, 11, 0.03)"
      }}
    >
      <h3 style={{ fontSize: "1.1rem", color: "var(--color-amber)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <BookOpen size={16} />
        Emergency SOP: {activeSop.type}
      </h3>
      <div 
        style={{ 
          whiteSpace: "pre-line", 
          fontSize: "0.85rem", 
          color: "var(--text-primary)", 
          lineHeight: "1.5",
          fontFamily: "var(--font-body)"
        }}
      >
        {activeSop.sopText}
      </div>
    </div>
  );
}
