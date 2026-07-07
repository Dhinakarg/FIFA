import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAppState } from "../context/AppStateContext";
import { generateTacticalDispatchCallable } from "../firebase";
import { 
  CheckSquare, 
  AlertTriangle, 
  ShieldCheck, 
  Play, 
  CheckCircle, 
  Plus, 
  BrainCircuit, 
  BookOpen, 
  Loader2 
} from "lucide-react";
import StatCard from "../components/StatCard";

export default function StaffOperations() {
  const { 
    userRole, 
    incidents, 
    updateIncidentStatus, 
    reportIncident,
    tasks, 
    addLog 
  } = useAppState();

  // Form States for Custom Incident
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("medical");
  const [newSeverity, setNewSeverity] = useState("Low");
  const [newLoc, setNewLoc] = useState("Zone A (Concourse)");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Tactical Dispatch state (Gemini API)
  const [tacticalReport, setTacticalReport] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // Active Incidents lists
  const activeIncidents = useMemo(() => incidents.filter(inc => inc.status !== "resolved"), [incidents]);
  const completedIncidentsCount = useMemo(() => incidents.filter(inc => inc.status === "resolved").length, [incidents]);

  // Predefined SOP Rules (Purely data-based, no AI)
  const predefinedSOPs = {
    "fire": "🚨 SOP-FIRE:\n1. Alert fire marshall & call Fire Dispatch immediately.\n2. Engage local alarm pulls and trigger PA evacuation broadcast.\n3. Instruct stewards to open all Gates and clear exit egress paths.\n4. Deploy fire extinguishers only for minor localized hotspots.",
    "medical": "✙ SOP-MEDICAL:\n1. Dispatch closest zone first-aid responder with AED.\n2. Clear aisle space for paramedics stretchers.\n3. Monitor patient vital signs until ambulance crew arrives.\n4. Record incident details in medical logs.",
    "lost child": "👦 SOP-LOST-CHILD:\n1. Distribute description to all perimeter gate ushers immediately.\n2. Monitor exit CCTV cameras and freeze turnstiles egress.\n3. Guide guardian to Customer Help Hub (Section 101) to announce child name.",
    "fight": "👊 SOP-CROWD-FIGHT:\n1. Dispatch Zone Security squad (minimum 3 officers).\n2. Stewards must maintain distance and observe details (film on phones if possible).\n3. Alert local police dispatcher for fast-track arrest assistance.",
    "power failure": "🔌 SOP-POWER-FAILURE:\n1. Verify backup generator engagement (automatic within 10 seconds).\n2. Manually deploy flashlight guards to emergency staircases.\n3. Broadcast reassurance announcement via PA battery system.\n4. Alert main grid contractor."
  };

  // Find active SOP based on type of selected/pending incidents
  const getActiveSOP = () => {
    // If any active incident matches types, return it
    const match = activeIncidents.find(inc => predefinedSOPs[inc.type.toLowerCase()]);
    if (match) {
      return {
        type: match.type,
        sopText: predefinedSOPs[match.type.toLowerCase()]
      };
    }
    return null;
  };

  const activeSop = getActiveSOP();

  // Condition to check if Gemini should be triggered: 2+ active incidents OR unstructured free text (length > 40 chars)
  const isMultiIncident = activeIncidents.length >= 2;
  const isUnstructuredText = newDesc.length > 40;
  const showGeminiOption = isMultiIncident || isUnstructuredText;

  /**
   * Gemini Operational Dispatch Generator
   */
  const handleGenerateTacticalDispatch = useCallback(async () => {
    setReportLoading(true);
    setTacticalReport("");
    addLog("Requesting Gemini Tactical Dispatch analysis from Cloud Function...");

    try {
      if (generateTacticalDispatchCallable) {
        const result = await generateTacticalDispatchCallable({
          activeIncidents,
          unstructuredText: newDesc
        });
        setTacticalReport(result.data.dispatchReport);
      } else {
        // Local simulation fallback
        setTimeout(() => {
          let summary = `[TACTICAL DISPATCH ADVISORY - SIMULATED]\n\n`;
          summary += `### 1. Prioritized Action Summary\n`;
          summary += `- Deploy paramedic coordinators immediately to Zone E.\n`;
          summary += `- Mobilize security teams to Gate 3 to clear blocked egress turnstiles.\n`;
          summary += `- Establish secondary communications loop with Sector supervisors.\n\n`;
          
          summary += `### 2. Resource Recommendations\n`;
          summary += `- Dispatch: 2 Security Patrol Units, 1 Paramedic squad, 1 Maintenance crew.\n\n`;
          
          summary += `### 3. Draft PA Announcement\n`;
          summary += `*"Attention all guests: We are resolving a minor incident in the concourse. Please follow instructions from nearby stewards. Operations continue normally."*`;
          
          setTacticalReport(summary);
          addLog("Simulated tactical dispatch advisory generated.");
        }, 1200);
      }
    } catch (error) {
      console.error("Failed to generate tactical dispatch report:", error);
      setTacticalReport("ADVISORY: Proximity units dispatched. Operations recommending localized evacuation grids.");
    } finally {
      setReportLoading(false);
    }
  }, [activeIncidents, newDesc, addLog]);

  const dispatchRef = useRef(handleGenerateTacticalDispatch);
  useEffect(() => {
    dispatchRef.current = handleGenerateTacticalDispatch;
  }, [handleGenerateTacticalDispatch]);

  // Auto-trigger Gemini summary on active incidents count change
  useEffect(() => {
    if (activeIncidents.length >= 2) {
      dispatchRef.current();
    } else {
      setTacticalReport("");
    }
  }, [activeIncidents.length]);

  const handleIncidentFormSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    reportIncident(newTitle, newDesc, newType, newLoc, "Staff Operations Console");
    setFormSubmitted(true);

    setTimeout(() => {
      setNewTitle("");
      setNewDesc("");
      setFormSubmitted(false);
    }, 2500);
  };

  const isAuthorized = userRole === "staff" || userRole === "organizer" || userRole === "admin";

  return (
    <div>
      <div className="page-header" style={{ display: "space-between", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">Staff Operations & Dispatch</h1>
          <p className="page-description">Real-time incident queue coordination, ticket dispatches, and emergency SOP triggers.</p>
        </div>
        {!isAuthorized && (
          <div className="global-alert" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--color-amber)", color: "var(--color-amber)", padding: "12px 18px", marginTop: "15px" }}>
            <span>⚠️ Viewing in <strong>Fan Read-Only mode</strong>. Switch roles to <strong>Staff</strong> in the <strong>Admin Panel</strong> to take actions.</span>
          </div>
        )}
      </div>

      {/* GEMINI TACTICAL DISPATCH PANEL - TRIGGERED AUTOMATICALLY ON 2+ INCIDENTS OR VIA TEXT SCAN */}
      {showGeminiOption && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: "24px", 
            marginBottom: "30px", 
            border: "1px solid rgba(168, 85, 247, 0.4)", 
            background: "rgba(168, 85, 247, 0.05)",
            boxShadow: "0 0 25px rgba(168, 85, 247, 0.1)",
            animation: isMultiIncident ? "pulse-border 2s infinite alternate" : "none"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ color: "var(--color-purple)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.1rem" }}>
              <BrainCircuit size={20} />
              Gemini Tactical Dispatch Advisor
            </h4>
            <span className="badge-status role-organizer" style={{ background: "rgba(168, 85, 247, 0.15)", color: "var(--color-purple)" }}>
              AI Assessment Active
            </span>
          </div>

          {isMultiIncident ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
              Notice: Multiple simultaneous active incidents detected. Gemini is analyzing prioritization queues.
            </p>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Unstructured description text detected. Request Gemini prioritized tactical analysis:
              </span>
              <button 
                onClick={handleGenerateTacticalDispatch} 
                className="interactive-btn"
                style={{ padding: "6px 12px", fontSize: "0.75rem", background: "var(--color-purple)" }}
                disabled={reportLoading}
              >
                Analyze via Gemini
              </button>
            </div>
          )}

          {reportLoading ? (
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px", padding: "10px 0" }}>
              <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              <span>Analyzing localized incidents and preparing resource models...</span>
            </div>
          ) : (
            tacticalReport && (
              <div 
                style={{ 
                  background: "#080c18", 
                  padding: "16px", 
                  borderRadius: "10px", 
                  border: "1px solid var(--border-glass)", 
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                  color: "var(--text-primary)",
                  whiteSpace: "pre-line" 
                }}
              >
                {tacticalReport}
              </div>
            )
          )}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid-cols-3" style={{ marginBottom: "30px" }}>
        <StatCard 
          title="Active Incidents" 
          value={activeIncidents.length} 
          icon={AlertTriangle} 
          color={activeIncidents.length > 0 ? "rose" : "emerald"}
          subtext="Requiring supervisor dispatch"
        />
        <StatCard 
          title="Total Cleared Today" 
          value={completedIncidentsCount} 
          icon={ShieldCheck} 
          color="emerald"
          subtext="Successfully resolved tickets"
        />
        <StatCard 
          title="Checklist Audits" 
          value={`${tasks.filter(t => t.status === "completed").length}/${tasks.length}`} 
          icon={CheckSquare} 
          color="indigo"
          subtext="All systems operational"
        />
      </div>

      <div className="grid-cols-3" style={{ gap: "24px" }}>
        {/* Incident Queue Column */}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Active SOP Overlay Card (Purely data-based, no AI) */}
          {activeSop && (
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
          )}

          {/* Active Incidents List */}
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
        </div>

        {/* Staff Form Submission sidebar */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Plus size={18} />
            Log Operational Incident
          </h3>

          {formSubmitted ? (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--color-emerald)", color: "var(--color-emerald)", padding: "16px", borderRadius: "10px", textAlign: "center" }}>
              <h4 style={{ fontSize: "1rem", marginBottom: "4px" }}>Incident Logged</h4>
              <p style={{ fontSize: "0.8rem" }}>SOP and dispatch telemetry updated.</p>
            </div>
          ) : (
            <form onSubmit={handleIncidentFormSubmit}>
              <div className="input-group">
                <label htmlFor="staff-incident-title-input" className="input-label">Subject Title</label>
                <input 
                  id="staff-incident-title-input"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Fight in Section 102"
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  disabled={!isAuthorized}
                />
              </div>

              <div className="input-group">
                <label htmlFor="staff-incident-type-select" className="input-label">Incident Type</label>
                <select 
                  id="staff-incident-type-select"
                  className="form-input" 
                  value={newType} 
                  onChange={(e) => setNewType(e.target.value)}
                  disabled={!isAuthorized}
                >
                  <option value="medical">Medical Medical</option>
                  <option value="fire">Fire Incident</option>
                  <option value="lost child">Lost Child</option>
                  <option value="fight">Physical Fight</option>
                  <option value="power failure">Power Failure</option>
                </select>
              </div>

              <div className="grid-cols-2" style={{ gap: "10px", marginBottom: "16px" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="staff-incident-severity-select" className="input-label">Severity</label>
                  <select 
                    id="staff-incident-severity-select"
                    className="form-input" 
                    value={newSeverity} 
                    onChange={(e) => setNewSeverity(e.target.value)}
                    disabled={!isAuthorized}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="staff-incident-location-select" className="input-label">Location</label>
                  <select 
                    id="staff-incident-location-select"
                    className="form-input" 
                    value={newLoc} 
                    onChange={(e) => setNewLoc(e.target.value)}
                    disabled={!isAuthorized}
                  >
                    <option value="Zone A (Concourse)">Zone A (West)</option>
                    <option value="Zone B (Concourse)">Zone B (North)</option>
                    <option value="Zone C (Seating)">Zone C (East)</option>
                    <option value="Zone D (Seating)">Zone D (South)</option>
                    <option value="Zone E (Suites)">Zone E (VIP)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="staff-incident-desc-textarea" className="input-label">Description (Enter detailed free text to trigger Gemini)</label>
                <textarea 
                  id="staff-incident-desc-textarea"
                  className="form-input" 
                  rows="4" 
                  placeholder="Provide precise details of the scene..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  disabled={!isAuthorized}
                />
              </div>

              <button 
                type="submit" 
                className="interactive-btn" 
                style={{ width: "100%" }}
                disabled={!isAuthorized}
              >
                Log Dispatch Ticket
              </button>
            </form>
          )}
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
