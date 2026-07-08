import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAppState } from "../context/AppStateContext";
import { generateTacticalDispatchCallable } from "../firebase";
import { AlertTriangle, ShieldCheck, CheckSquare, BrainCircuit, Loader2 } from "lucide-react";
import StatCard from "../components/StatCard";
import { ActiveSopOverlay } from "../components/ActiveSopOverlay";
import { IncidentQueue } from "../components/IncidentQueue";
import { TaskDispatchList } from "../components/TaskDispatchList";
import { predefinedSOPs } from "../data/mockData";



/**
 * StaffOperations page rendering real-time incident queues, SOP guidelines,
 * and dispatch order logs.
 * 
 * @returns {JSX.Element} The active StaffOperations page
 */
export default function StaffOperations() {
  const { 
    userRole, 
    incidents, 
    updateIncidentStatus, 
    reportIncident,
    tasks, 
    addLog 
  } = useAppState();

  const [tacticalReport, setTacticalReport] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const activeIncidents = useMemo(() => incidents.filter(inc => inc.status !== "resolved"), [incidents]);
  const completedIncidentsCount = useMemo(() => incidents.filter(inc => inc.status === "resolved").length, [incidents]);

  /**
   * SOP Rule Engine.
   * Scans active unresolved incidents and returns corresponding Standard Operating Procedure (SOP) instructions.
   * 
   * @returns {Object|null} SOP details containing type and instructions text, or null if no matching incidents exist
   */
  const getActiveSOP = useCallback(() => {
    const match = activeIncidents.find(inc => predefinedSOPs[inc.type.toLowerCase()]);
    if (match) {
      return {
        type: match.type,
        sopText: predefinedSOPs[match.type.toLowerCase()]
      };
    }
    return null;
  }, [activeIncidents]);

  const activeSop = useMemo(() => getActiveSOP(), [getActiveSOP]);

  const isMultiIncident = activeIncidents.length >= 2;
  const showGeminiOption = isMultiIncident;

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
          unstructuredText: ""
        });
        setTacticalReport(result.data.dispatchReport);
      } else {
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
  }, [activeIncidents, addLog]);

  const dispatchRef = useRef(handleGenerateTacticalDispatch);
  useEffect(() => {
    dispatchRef.current = handleGenerateTacticalDispatch;
  }, [handleGenerateTacticalDispatch]);

  useEffect(() => {
    if (activeIncidents.length >= 2) {
      dispatchRef.current();
    } else {
      setTacticalReport("");
    }
  }, [activeIncidents.length]);

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

      {showGeminiOption && (
        <div className="glass-panel" style={styles.geminiCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ color: "var(--color-purple)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.1rem" }}>
              <BrainCircuit size={20} />
              Gemini Tactical Dispatch Advisor
            </h4>
            <span className="badge-status role-organizer" style={{ background: "rgba(168, 85, 247, 0.15)", color: "var(--color-purple)" }}>
              AI Assessment Active
            </span>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
            Notice: Multiple simultaneous active incidents detected. Gemini is analyzing prioritization queues.
          </p>

          {reportLoading ? (
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px", padding: "10px 0" }}>
              <Loader2 size={16} className="animate-spin" style={styles.spin} />
              <span>Analyzing localized incidents and preparing resource models...</span>
            </div>
          ) : (
            tacticalReport && (
              <div style={styles.reportBox}>
                {tacticalReport}
              </div>
            )
          )}
        </div>
      )}

      <div className="grid-cols-3" style={{ marginBottom: "30px" }}>
        <StatCard title="Active Incidents" value={activeIncidents.length} icon={AlertTriangle} color={activeIncidents.length > 0 ? "rose" : "emerald"} subtext="Requiring supervisor dispatch" />
        <StatCard title="Total Cleared Today" value={completedIncidentsCount} icon={ShieldCheck} color="emerald" subtext="Successfully resolved tickets" />
        <StatCard title="Checklist Audits" value={`${tasks.filter(t => t.status === "completed").length}/${tasks.length}`} icon={CheckSquare} color="indigo" subtext="All systems operational" />
      </div>

      <div className="grid-cols-3" style={{ gap: "24px" }}>
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "24px" }}>
          <ActiveSopOverlay activeSop={activeSop} />
          <IncidentQueue activeIncidents={activeIncidents} isAuthorized={isAuthorized} updateIncidentStatus={updateIncidentStatus} />
        </div>

        <TaskDispatchList isAuthorized={isAuthorized} reportIncident={reportIncident} />
      </div>
      
    </div>
  );
}

const styles = {
  geminiCard: { padding: "24px", marginBottom: "30px", border: "1px solid rgba(168, 85, 247, 0.4)", background: "rgba(168, 85, 247, 0.05)", boxShadow: "0 0 25px rgba(168, 85, 247, 0.1)", animation: "pulse-border 2s infinite alternate" },
  reportBox: { background: "#080c18", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-glass)", fontSize: "0.9rem", lineHeight: "1.6", color: "var(--text-primary)", whiteSpace: "pre-line" }
};
