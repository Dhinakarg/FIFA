import React, { useState, useMemo } from "react";
import { useAppState } from "../context/AppStateContext";
import { Sliders, BrainCircuit, Loader2 } from "lucide-react";
import { GatesStatusGrid } from "../components/GatesStatusGrid";
import { ActiveEventCard } from "../components/ActiveEventCard";
import { VolunteersChecklist } from "../components/VolunteersChecklist";
import { useOrganizerBriefing } from "../hooks/useOrganizerBriefing";

const mockEvents = [
  { id: "evt-1", name: "Grand Championship Final", attendance: 41250, capacity: 50000, startTime: "20:00", date: "Today", vipOccupancy: 82 },
  { id: "evt-2", name: "Super Concert 2026", attendance: 49100, capacity: 55000, startTime: "19:00", date: "Tomorrow", vipOccupancy: 95 },
  { id: "evt-3", name: "Local Derby Match", attendance: 32000, capacity: 45000, startTime: "15:00", date: "In 3 Days", vipOccupancy: 64 }
];

/**
 * OrganizerDashboard page rendering Decision Support Systems (DSS), 
 * Gate controls, live demo controls, and volunteer allocation maps.
 * 
 * @returns {JSX.Element} The active OrganizerDashboard page
 */
export default function OrganizerDashboard() {
  const { 
    userRole, activeEvent, setActiveEvent, gates, incidents, volunteers, evacuationAlarm, triggerDemoScenario, addLog 
  } = useAppState();

  const [gateStates, setGateStates] = useState({
    "gate-a": "open", "gate-b": "open", "gate-c": "open", "gate-d": "open"
  });

  const {
    dssBriefing, dssLoading, handleGenerateBriefing,
    feedbackSummary, fbLoading, handleGenerateFeedbackSummary
  } = useOrganizerBriefing(activeEvent, incidents, gates, volunteers, addLog);

  const handleToggleGate = (gateId, currentStatus) => {
    if (userRole !== "organizer" && userRole !== "admin") {
      alert("Unauthorized. Only Organizer or Admin can change Gate settings.");
      return;
    }
    const newStatus = currentStatus === "open" ? "closed" : "open";
    setGateStates(prev => ({ ...prev, [gateId]: newStatus }));
    addLog(`Organizer changed ${gateId.toUpperCase()} state to ${newStatus.toUpperCase()}`);
  };

  const handleEventChange = (eventId) => {
    const selected = mockEvents.find(e => e.id === eventId);
    if (selected) {
      setActiveEvent(selected);
      addLog(`Active stadium event swapped to: "${selected.name}"`);
    }
  };

  const isAuthorized = userRole === "organizer" || userRole === "admin";
  const revenue = useMemo(() => Math.round(activeEvent.attendance * 75 + activeEvent.attendance * 0.05 * 250), [activeEvent.attendance]);
  const ingressFlowRate = evacuationAlarm ? "0 p/m" : "245 p/min";

  const activeIncidents = useMemo(() => incidents.filter(i => i.status !== "resolved"), [incidents]);
  const availableVolunteers = useMemo(() => volunteers.filter(v => v.status === "available"), [volunteers]);

  return (
    <div>
      <div className="page-header" style={styles.header}>
        <div>
          <h1 className="page-title">Event Organizer Console</h1>
          <p className="page-description">Decision Support System (DSS) panel for crowd management, timelines, and incident dispatching.</p>
        </div>
        <div style={styles.flexCenter}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Switch Active Event:</span>
          <select 
            className="form-input" 
            style={styles.eventSelect}
            value={activeEvent.id}
            onChange={(e) => handleEventChange(e.target.value)}
          >
            {mockEvents.map(evt => (
              <option key={evt.id} value={evt.id}>{evt.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!isAuthorized && (
        <div className="global-alert" style={styles.unauthAlert}>
          <span>⚠️ Viewing in <strong>Fan Read-Only mode</strong>. Switch roles to <strong>Organizer</strong> in the <strong>Admin Panel</strong> to toggle Gates configuration.</span>
        </div>
      )}

      {/* LIVE DEMONSTRATION CONTROLS */}
      <div className="glass-panel" style={{ padding: "24px", marginBottom: "30px" }}>
        <h4 style={styles.demoTitle}>
          <Sliders size={20} />
          Live Demonstration Controller (Demo Mode)
        </h4>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
          Manually inject stadium-wide events to demonstrate Decision Support (DSS), rule-based SOP triggers, dynamic SVG path calculations, and volunteer proximity listings.
        </p>
        <div style={styles.flexWrapGap}>
          <button onClick={() => triggerDemoScenario("crowd_rush")} className="interactive-btn secondary" style={styles.rushBtn} disabled={!isAuthorized}>🚨 Crowd Rush</button>
          <button onClick={() => triggerDemoScenario("concourse_fire")} className="interactive-btn secondary" style={styles.fireBtn} disabled={!isAuthorized}>🔥 Active Fire</button>
          <button onClick={() => triggerDemoScenario("lost_child")} className="interactive-btn secondary" style={styles.childBtn} disabled={!isAuthorized}>👦 Lost Child</button>
          <button onClick={() => triggerDemoScenario("power_outage")} className="interactive-btn secondary" style={styles.powerBtn} disabled={!isAuthorized}>🔌 Power Outage</button>
          <button onClick={() => triggerDemoScenario("normal_ops")} className="interactive-btn" style={styles.resetBtn} disabled={!isAuthorized}>✔ Reset Normal Ops</button>
        </div>
      </div>

      {/* DECISION SUPPORT SYSTEM BRIEFING PANEL */}
      <div className="glass-panel" style={styles.dssCard}>
        <div style={styles.flexBriefingHeader}>
          <div>
            <h4 style={styles.dssTitle}>
              <BrainCircuit size={20} />
              Decision Support System Briefing
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Generate a comprehensive operational overview leveraging Gemini AI to assess crowd levels, gate congestion, active hazards, and crew readiness.
            </p>
          </div>
          <button onClick={handleGenerateBriefing} className="interactive-btn" style={styles.briefingBtn} disabled={dssLoading}>
            {dssLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ marginRight: "8px" }} />
                Synthesizing Telemetry...
              </>
            ) : (
              "Generate Operations Summary"
            )}
          </button>
        </div>

        {dssBriefing && (
          <div style={styles.briefingContent}>
            {dssBriefing}
          </div>
        )}
      </div>

      {/* GUEST FEEDBACK SUMMARY PANEL */}
      <div className="glass-panel" style={styles.feedbackCard}>
        <div style={styles.flexBriefingHeader}>
          <div>
            <h4 style={styles.feedbackTitle}>
              <BrainCircuit size={20} />
              Guest Feedback AI Dashboard
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Analyze all guest reviews and comments stored in Firestore. Gemini compiles complaints, praises, and suggests operational improvements.
            </p>
          </div>
          <button onClick={handleGenerateFeedbackSummary} className="interactive-btn" style={styles.feedbackBtn} disabled={fbLoading}>
            {fbLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ marginRight: "8px" }} />
                Aggregating Reviews...
              </>
            ) : (
              "Summarize Feedback"
            )}
          </button>
        </div>

        {feedbackSummary && (
          <div style={styles.briefingContent}>
            {feedbackSummary}
          </div>
        )}
      </div>

      <ActiveEventCard activeEvent={activeEvent} revenue={revenue} ingressFlowRate={ingressFlowRate} evacuationAlarm={evacuationAlarm} />

      <VolunteersChecklist activeIncidents={activeIncidents} availableVolunteers={availableVolunteers} />

      <GatesStatusGrid gateStates={gateStates} onToggleGate={handleToggleGate} isAuthorized={isAuthorized} />
      
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "20px" },
  flexCenter: { display: "flex", gap: "10px", alignItems: "center" },
  eventSelect: { width: "auto", padding: "8px 16px", borderRadius: "10px" },
  unauthAlert: { background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--color-amber)", color: "var(--color-amber)", padding: "12px 18px", marginBottom: "24px" },
  demoTitle: { color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.15rem", marginBottom: "8px" },
  flexWrapGap: { display: "flex", gap: "10px", flexWrap: "wrap" },
  rushBtn: { padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", borderColor: "var(--color-amber)", color: "var(--color-amber)", background: "rgba(245, 158, 11, 0.03)" },
  fireBtn: { padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", borderColor: "var(--color-rose)", color: "var(--color-rose)", background: "rgba(244, 63, 94, 0.03)" },
  childBtn: { padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", borderColor: "var(--color-purple)", color: "var(--color-purple)", background: "rgba(168, 85, 247, 0.03)" },
  powerBtn: { padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", borderColor: "var(--color-indigo)", color: "var(--color-indigo)", background: "rgba(99, 102, 241, 0.03)" },
  resetBtn: { padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", background: "linear-gradient(135deg, var(--color-emerald) 0%, #047857 100%)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)" },
  dssCard: { padding: "24px", marginBottom: "30px", border: "1px solid rgba(168, 85, 247, 0.3)", background: "rgba(168, 85, 247, 0.04)" },
  dssTitle: { color: "var(--color-purple)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.15rem" },
  briefingBtn: { padding: "10px 20px", background: "var(--color-purple)" },
  briefingContent: { background: "#080c18", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-glass)", fontSize: "0.92rem", lineHeight: "1.6", color: "var(--text-primary)", whiteSpace: "pre-line" },
  feedbackCard: { padding: "24px", marginBottom: "30px", border: "1px solid rgba(16, 185, 129, 0.3)", background: "rgba(16, 185, 129, 0.04)" },
  feedbackTitle: { color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.15rem" },
  feedbackBtn: { padding: "10px 20px", background: "linear-gradient(135deg, var(--color-emerald) 0%, #047857 100%)", boxShadow: "0 0 15px rgba(16, 185, 129, 0.25)" },
  flexBriefingHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }
};
