import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAppState } from "../context/AppStateContext";
import { generateGateSummaryCallable } from "../firebase";
import { ShieldAlert, Users, Flame, Compass, BrainCircuit, Loader2 } from "lucide-react";
import StatCard from "../components/StatCard";
import { IngressChart } from "../components/IngressChart";
import { GatesStatsTable } from "../components/GatesStatsTable";

/**
 * CrowdDashboard component displays crowd density charts, 
 * simulated evacuation triggers, and Gemini-based operational ingress warnings.
 * 
 * @returns {JSX.Element} The active CrowdDashboard page
 */
function CrowdDashboard() {
  const { 
    gates,
    evacuationAlarm, 
    triggerEvacuationAlarm, 
    activeEvent,
    addLog 
  } = useAppState();

  const [operationalSummary, setOperationalSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  const entryFlowData = useMemo(() => [
    { time: "17:00", count: 4200 },
    { time: "17:30", count: 9800 },
    { time: "18:00", count: 18200 },
    { time: "18:30", count: 27500 },
    { time: "19:00", count: 35900 },
    { time: "19:30", count: 39800 },
    { time: "20:00", count: activeEvent.attendance }
  ], [activeEvent.attendance]);

  const congestedGates = useMemo(() => gates.filter(g => (g.currentCount / g.capacity) > 0.8), [gates]);
  const isMultiGateCongestion = useMemo(() => congestedGates.length >= 2, [congestedGates]);

  useEffect(() => {
    if (isMultiGateCongestion) {
      if (operationalSummary || summaryLoading) return;
      const fetchOperationalSummary = async () => {
        setSummaryLoading(true);
        addLog(`System Trigger: 2+ congested gates detected. Requesting Gemini operational summary...`);
        try {
          if (generateGateSummaryCallable) {
            const result = await generateGateSummaryCallable({ gates });
            setOperationalSummary(result.data.summary);
          } else {
            // Local simulation fallback
            setTimeout(() => {
              const names = congestedGates.map(g => g.name).join(" and ");
              const freeGates = gates.filter(g => (g.currentCount / g.capacity) <= 0.8);
              const recName = freeGates.length > 0 
                ? freeGates.sort((a, b) => (a.currentCount/a.capacity) - (b.currentCount/b.capacity))[0].name 
                : "Gate A";
              setOperationalSummary(`CRITICAL WARNING (SIMULATION): Severe ingress delay at ${names} (load exceeding 80%). Operational coordinators divert incoming parking lanes toward ${recName}.`);
            }, 1000);
          }
        } catch (error) {
          console.error("Failed to generate operational summary:", error);
          setOperationalSummary("ADVISORY: Multi-gate congestion detected. Standard protocol dictates redirecting security lines immediately.");
        } finally {
          setSummaryLoading(false);
        }
      };

      fetchOperationalSummary();
    } else {
      setOperationalSummary("");
    }
  }, [isMultiGateCongestion, gates, congestedGates, addLog, summaryLoading, operationalSummary]);

  const suggestAlternateGate = useCallback((_congestedGate) => {
    const safeGates = gates.filter(g => (g.currentCount / g.capacity) <= 0.8);
    if (safeGates.length === 0) return "All gates heavily congested. Standard delay queue advisory active.";
    
    const sorted = [...safeGates].sort((a, b) => (a.currentCount / a.capacity) - (b.currentCount / b.capacity));
    const bestGate = sorted[0];
    const bestLoad = Math.round((bestGate.currentCount / bestGate.capacity) * 100);

    return `Divert to ${bestGate.name} (Operating at ${bestLoad}% load).`;
  }, [gates]);

  const handleAlarmToggle = useCallback(() => {
    triggerEvacuationAlarm(!evacuationAlarm);
  }, [evacuationAlarm, triggerEvacuationAlarm]);

  return (
    <div>
      <div className="page-header" style={styles.header}>
        <div>
          <h1 className="page-title">Crowd Operations Dashboard</h1>
          <p className="page-description">Live crowd density monitoring, ingress stats, and emergency evacuation triggers.</p>
        </div>
        <div>
          <button 
            onClick={handleAlarmToggle} 
            className={`interactive-btn danger ${evacuationAlarm ? 'secondary' : ''}`}
            style={{ animation: evacuationAlarm ? 'pulse-border 1s infinite alternate' : 'none' }}
          >
            <ShieldAlert size={18} />
            {evacuationAlarm ? "Deactivate Evacuation Alarm" : "Simulate Evacuation Alarm"}
          </button>
        </div>
      </div>

      {isMultiGateCongestion && (
        <div className="glass-panel" style={styles.advisoryCard}>
          <div style={styles.flexSpaceBetween}>
            <h4 style={styles.advisoryTitle}>
              <BrainCircuit size={20} />
              Gemini Operational Ingress Advisory
            </h4>
            <span className="badge-status role-organizer" style={{ background: "rgba(168, 85, 247, 0.15)", color: "var(--color-purple)" }}>
              AI Summary active
            </span>
          </div>
          
          {summaryLoading ? (
            <div style={styles.loadingBox}>
              <Loader2 size={16} className="animate-spin" style={styles.spin} />
              <span>Analyzing live telemetry models...</span>
            </div>
          ) : (
            <p style={styles.advisoryText}>{operationalSummary}</p>
          )}
        </div>
      )}

      <div className="grid-cols-3" style={{ marginBottom: "30px" }}>
        <StatCard title="Overall Attendance" value={`${activeEvent.attendance.toLocaleString()} / ${activeEvent.capacity.toLocaleString()}`} icon={Users} color="cyan" subtext={`${activeEvent.capacity - activeEvent.attendance} seats remaining`} />
        <StatCard title="Congested Entrances" value={`${congestedGates.length} / ${gates.length}`} icon={Flame} color={congestedGates.length > 0 ? "rose" : "emerald"} subtext={congestedGates.length >= 2 ? "Gemini Advisory Triggered" : "Operational flow normal"} />
        <StatCard title="Average Ingress Rate" value={evacuationAlarm ? "0 p/m" : "245 p/min"} icon={Compass} color={evacuationAlarm ? "rose" : "indigo"} subtext="Based on last 10 minutes scanner analytics" />
      </div>

      <GatesStatsTable gates={gates} suggestAlternateGate={suggestAlternateGate} />

      <div className="grid-cols-2" style={{ margin: "30px 0" }}>
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)" }}>
            Accumulated Ingress Flow (Attendance over Time)
          </h3>
          <IngressChart entryFlowData={entryFlowData} />
        </div>

        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "12px", color: "var(--color-indigo)" }}>
            Real-time Stadium Bowl Density & Capacity
          </h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Zone / Stand</th>
                <th>Total Capacity</th>
                <th>Current Occupancy</th>
                <th>Density Load</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Zone A (West Stand)</td>
                <td>12,500</td>
                <td>10,250</td>
                <td>82%</td>
                <td><span className="badge-status badge-in-progress">Optimal</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Zone B (North Stand)</td>
                <td>12,500</td>
                <td>11,900</td>
                <td>95%</td>
                <td><span className="badge-status badge-high">Congested</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Zone C (East Stand)</td>
                <td>10,000</td>
                <td>7,100</td>
                <td>71%</td>
                <td><span className="badge-status badge-resolved">Low Load</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Zone D (South Stand)</td>
                <td>10,000</td>
                <td>9,500</td>
                <td>95%</td>
                <td><span className="badge-status badge-high">Congested</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "20px" },
  flexSpaceBetween: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  advisoryCard: { padding: "24px", marginBottom: "30px", border: "1px solid rgba(168, 85, 247, 0.4)", background: "rgba(168, 85, 247, 0.05)", boxShadow: "0 0 25px rgba(168, 85, 247, 0.15)", animation: "pulse-border 2s infinite alternate" },
  advisoryTitle: { color: "var(--color-purple)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.1rem" },
  loadingBox: { color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" },
  spin: { animation: "spin 1s linear infinite" },
  advisoryText: { color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: "1.6" }
};

export default React.memo(CrowdDashboard);
