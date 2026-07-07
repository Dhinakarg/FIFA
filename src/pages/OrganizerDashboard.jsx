import React, { useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { generateStadiumReportCallable, summarizeFeedbackCallable } from "../firebase";
import { 
  Calendar, 
  Users, 
  Ticket, 
  ShieldAlert, 
  BrainCircuit, 
  Clock, 
  AlertTriangle, 
  Loader2,
  Sliders
} from "lucide-react";
import StatCard from "../components/StatCard";

export default function OrganizerDashboard() {
  const { 
    userRole, 
    activeEvent, 
    setActiveEvent,
    gates,
    incidents,
    volunteers,
    evacuationAlarm,
    triggerDemoScenario,
    addLog 
  } = useAppState();

  const [gateStates, setGateStates] = useState({
    "gate-a": "open",
    "gate-b": "open",
    "gate-c": "open",
    "gate-d": "open"
  });

  // Operational briefing (DSS support)
  const [dssBriefing, setDssBriefing] = useState("");
  const [dssLoading, setDssLoading] = useState(false);

  // Guest Feedback Summary states
  const [feedbackSummary, setFeedbackSummary] = useState("");
  const [fbLoading, setFbLoading] = useState(false);

  const handleToggleGate = (gateId, currentStatus) => {
    if (userRole !== "organizer" && userRole !== "admin") {
      alert("Unauthorized. Only Organizer or Admin can change Gate settings.");
      return;
    }
    
    const newStatus = currentStatus === "open" ? "closed" : "open";
    setGateStates(prev => ({ ...prev, [gateId]: newStatus }));
    addLog(`Organizer changed ${gateId.toUpperCase()} state to ${newStatus.toUpperCase()}`);
  };

  const handleGenerateFeedbackSummary = async () => {
    setFbLoading(true);
    setFeedbackSummary("");
    addLog("Requesting Gemini Guest Feedback Summary briefing...");
    try {
      if (summarizeFeedbackCallable) {
        const result = await summarizeFeedbackCallable({});
        setFeedbackSummary(result.data.summaryText);
      } else {
        // Fallback simulation
        setTimeout(() => {
          setFeedbackSummary(`### GUEST FEEDBACK ANALYTICS (SIMULATED)
*Average Guest Rating: **3.4 / 5.0** (5 total reviews)*

#### 1. Top Praises
- Fast public Wi-Fi speed and wide coverage in concourses.
- Friendly, supportive volunteers helping with directions.

#### 2. Top Complaints
- Severe queues at the Eastern Grill concession (exceeding 30 minutes wait).
- Lack of clear directional signs to upper levels like Section 228.

#### 3. Suggested Improvements
- Deploy queue pre-order staff at Eastern Grill to speed up orders.
- Mount more high-contrast directional signage on concourse pillars.`);
          addLog("Simulated guest feedback summary generated.");
        }, 1200);
      }
    } catch (error) {
      console.error("Failed to summarize feedback:", error);
      setFeedbackSummary("ERROR: Could not fetch guest feedback aggregation summaries.");
    } finally {
      setFbLoading(false);
    }
  };

  // Trigger Gemini DSS Operations Summary
  const handleGenerateBriefing = async () => {
    setDssLoading(true);
    setDssBriefing("");
    addLog("Requesting Gemini DSS Operational Summary...");

    try {
      if (generateStadiumReportCallable) {
        const result = await generateStadiumReportCallable({
          crowd: { attendance: activeEvent.attendance, capacity: activeEvent.capacity },
          incidents,
          gates,
          volunteers
        });
        setDssBriefing(result.data.reportText);
      } else {
        // Local simulation fallback
        setTimeout(() => {
          const activeIncs = incidents.filter(i => i.status !== "resolved");
          const highLoadGates = gates.filter(g => (g.currentCount / g.capacity) > 0.8);
          const availableStaff = volunteers.filter(v => v.status === "available");
          
          let report = `**OPERATIONAL BRIEFING (DSS SUPPORT - SIMULATED)**\n\n`;
          report += `* Stadium capacity load is at **${Math.round((activeEvent.attendance / activeEvent.capacity) * 100)}%** (${activeEvent.attendance.toLocaleString()} inside).\n`;
          report += `* **Congestion Alert**: ${highLoadGates.length} ingress gate(s) exceeding the 80% occupancy threshold.\n`;
          report += `* **Dispatch Tickets**: ${activeIncs.length} unresolved incidents remain on the board.\n`;
          report += `* **Resources**: ${availableStaff.length} crew volunteers are active and available.\n\n`;
          report += `**Recommendation**: Open auxiliary egress gates and divert incoming ticketing lanes. Direct available usher crews to clear concourse congestions.`;
          
          setDssBriefing(report);
          addLog("Simulated DSS Operational Briefing generated.");
        }, 1200);
      }
    } catch (error) {
      console.error("DSS Operational Summary failed:", error);
      setDssBriefing("ERROR: Failed to establish secure DSS telemetry channels. Review database bindings.");
    } finally {
      setDssLoading(false);
    }
  };

  const mockEvents = [
    { id: "evt-1", name: "Grand Championship Final", attendance: 41250, capacity: 50000, startTime: "20:00", date: "Today", vipOccupancy: 82 },
    { id: "evt-2", name: "Super Concert 2026", attendance: 49100, capacity: 55000, startTime: "19:00", date: "Tomorrow", vipOccupancy: 95 },
    { id: "evt-3", name: "Local Derby Match", attendance: 32000, capacity: 45000, startTime: "15:00", date: "In 3 Days", vipOccupancy: 64 }
  ];

  const handleEventChange = (eventId) => {
    const selected = mockEvents.find(e => e.id === eventId);
    if (selected) {
      setActiveEvent(selected);
      addLog(`Active stadium event swapped to: "${selected.name}"`);
    }
  };

  const isAuthorized = userRole === "organizer" || userRole === "admin";
  const revenue = Math.round(activeEvent.attendance * 75 + activeEvent.attendance * 0.05 * 250); // General + VIP revenue

  // Filter Active Incidents
  const activeIncidents = incidents.filter(i => i.status !== "resolved");

  // Filter Volunteers
  const availableVolunteers = volunteers.filter(v => v.status === "available");

  // Ingress Flow Rate calculation
  const ingressFlowRate = evacuationAlarm ? "0 p/m" : "245 p/min";

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 className="page-title">Event Organizer Console</h1>
          <p className="page-description">Decision Support System (DSS) panel for crowd management, timelines, and incident dispatching.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Switch Active Event:</span>
          <select 
            className="form-input" 
            style={{ width: "auto", padding: "8px 16px", borderRadius: "10px" }}
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
        <div className="global-alert" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--color-amber)", color: "var(--color-amber)", padding: "12px 18px", marginBottom: "24px" }}>
          <span>⚠️ Viewing in <strong>Fan Read-Only mode</strong>. Switch roles to <strong>Organizer</strong> in the <strong>Admin Panel</strong> to toggle Gates configuration.</span>
        </div>
      )}

      {/* LIVE DEMONSTRATION CONTROLS (DEMO MODE) */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: "24px", 
          marginBottom: "30px", 
          border: "1px solid var(--border-glass)", 
          background: "rgba(255, 255, 255, 0.01)" 
        }}
      >
        <h4 style={{ color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.15rem", marginBottom: "8px" }}>
          <Sliders size={20} />
          Live Demonstration Controller (Demo Mode)
        </h4>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
          Manually inject stadium-wide events to demonstrate Decision Support (DSS), rule-based SOP triggers, dynamic SVG path calculations, and volunteer proximity listings.
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button 
            onClick={() => triggerDemoScenario("crowd_rush")} 
            className="interactive-btn secondary"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", borderColor: "var(--color-amber)", color: "var(--color-amber)", background: "rgba(245, 158, 11, 0.03)" }}
            disabled={!isAuthorized}
            title="Congest Gates B & C to >80% to test alternate routing and DSS briefing triggers."
          >
            🚨 Crowd Rush
          </button>
          <button 
            onClick={() => triggerDemoScenario("concourse_fire")} 
            className="interactive-btn secondary"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", borderColor: "var(--color-rose)", color: "var(--color-rose)", background: "rgba(244, 63, 94, 0.03)" }}
            disabled={!isAuthorized}
            title="Spawns critical fire incident in Zone A, locks down concourses, and sound alarms."
          >
            🔥 Active Fire
          </button>
          <button 
            onClick={() => triggerDemoScenario("lost_child")} 
            className="interactive-btn secondary"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", borderColor: "var(--color-purple)", color: "var(--color-purple)", background: "rgba(168, 85, 247, 0.03)" }}
            disabled={!isAuthorized}
            title="Spawn lost child incident to test local locked-down gate procedures."
          >
            👦 Lost Child
          </button>
          <button 
            onClick={() => triggerDemoScenario("power_outage")} 
            className="interactive-btn secondary"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", borderColor: "var(--color-indigo)", color: "var(--color-indigo)", background: "rgba(99, 102, 241, 0.03)" }}
            disabled={!isAuthorized}
            title="Spawn blackout incident to test emergency generator procedures."
          >
            🔌 Power Outage
          </button>
          <button 
            onClick={() => triggerDemoScenario("normal_ops")} 
            className="interactive-btn"
            style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px", background: "linear-gradient(135deg, var(--color-emerald) 0%, #047857 100%)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.3)" }}
            disabled={!isAuthorized}
            title="Resets alarm overrides, clears active incidents, and stabilizes turnstile loads."
          >
            ✔ Reset Normal Ops
          </button>
        </div>
      </div>

      {/* DECISION SUPPORT SYSTEM BRIEFING PANEL */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: "24px", 
          marginBottom: "30px", 
          border: "1px solid rgba(168, 85, 247, 0.3)", 
          background: "rgba(168, 85, 247, 0.04)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h4 style={{ color: "var(--color-purple)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.15rem" }}>
              <BrainCircuit size={20} />
              Decision Support System Briefing
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Generate a comprehensive operational overview leveraging Gemini AI to assess crowd levels, gate congestion, active hazards, and crew readiness.
            </p>
          </div>
          <button 
            onClick={handleGenerateBriefing} 
            className="interactive-btn"
            style={{ padding: "10px 20px", background: "var(--color-purple)" }}
            disabled={dssLoading}
          >
            {dssLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ marginRight: "8px", animation: "spin 1s linear infinite" }} />
                Synthesizing Telemetry...
              </>
            ) : (
              "Generate Operations Summary"
            )}
          </button>
        </div>

        {dssBriefing && (
          <div 
            style={{ 
              background: "#080c18", 
              padding: "20px", 
              borderRadius: "12px", 
              border: "1px solid var(--border-glass)", 
              fontSize: "0.92rem",
              lineHeight: "1.6",
              color: "var(--text-primary)",
              whiteSpace: "pre-line"
            }}
          >
            {dssBriefing}
          </div>
        )}
      </div>

      {/* GUEST FEEDBACK SUMMARY PANEL */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: "24px", 
          marginBottom: "30px", 
          border: "1px solid rgba(16, 185, 129, 0.3)", 
          background: "rgba(16, 185, 129, 0.04)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h4 style={{ color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.15rem" }}>
              <BrainCircuit size={20} />
              Guest Feedback AI Dashboard
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Analyze all guest reviews and comments stored in Firestore. Gemini compiles complaints, praises, and suggests operational improvements.
            </p>
          </div>
          <button 
            onClick={handleGenerateFeedbackSummary} 
            className="interactive-btn"
            style={{ padding: "10px 20px", background: "linear-gradient(135deg, var(--color-emerald) 0%, #047857 100%)", boxShadow: "0 0 15px rgba(16, 185, 129, 0.25)" }}
            disabled={fbLoading}
          >
            {fbLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ marginRight: "8px", animation: "spin 1s linear infinite" }} />
                Aggregating Reviews...
              </>
            ) : (
              "Summarize Feedback"
            )}
          </button>
        </div>

        {feedbackSummary && (
          <div 
            style={{ 
              background: "#080c18", 
              padding: "20px", 
              borderRadius: "12px", 
              border: "1px solid var(--border-glass)", 
              fontSize: "0.92rem",
              lineHeight: "1.6",
              color: "var(--text-primary)",
              whiteSpace: "pre-line"
            }}
          >
            {feedbackSummary}
          </div>
        )}
      </div>

      {/* Ticket Analytics metrics */}
      <div className="grid-cols-4" style={{ marginBottom: "30px" }}>
        <StatCard 
          title="Crowd Attendance" 
          value={`${activeEvent.attendance.toLocaleString()} / ${activeEvent.capacity.toLocaleString()}`} 
          icon={Users} 
          color="cyan"
          subtext={`${activeEvent.capacity - activeEvent.attendance} tickets remaining`}
        />
        <StatCard 
          title="Total Ticket Revenue" 
          value={`$${revenue.toLocaleString()}`} 
          icon={Ticket} 
          color="emerald"
          subtext="Simulated live gate purchases"
        />
        <StatCard 
          title="Ingress Flow Rate" 
          value={ingressFlowRate} 
          icon={Clock} 
          color="indigo"
          subtext="Total fans per minute ingress"
        />
        <StatCard 
          title="Evacuation State" 
          value={evacuationAlarm ? "EVACUATING" : "Normal"} 
          icon={ShieldAlert} 
          color={evacuationAlarm ? "rose" : "emerald"}
          subtext={evacuationAlarm ? "System Alarm Active!" : "Egress paths clear"}
        />
      </div>

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

      {/* Gate Controls Row */}
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
                  onClick={() => handleToggleGate(gId, gateStates[gId])}
                  className={`interactive-btn ${isClosed ? 'success' : 'danger'}`}
                  style={{ width: "100%", padding: "8px", fontSize: "0.8rem", borderRadius: "8px" }}
                  disabled={!isAuthorized}
                >
                  {isClosed ? "Unlock Turnstiles" : "Lock Turnstiles"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Keyframe animation for spinner */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
