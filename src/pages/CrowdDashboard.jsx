import React, { useEffect, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { generateGateSummaryCallable } from "../firebase";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShieldAlert, Users, Flame, Compass, BrainCircuit, Activity, Clock } from "lucide-react";
import StatCard from "../components/StatCard";

export default function CrowdDashboard() {
  const { 
    gates,
    evacuationAlarm, 
    triggerEvacuationAlarm, 
    activeEvent,
    addLog 
  } = useAppState();

  const [operationalSummary, setOperationalSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Ingress charts timeline data
  const entryFlowData = [
    { time: "17:00", count: 4200 },
    { time: "17:30", count: 9800 },
    { time: "18:00", count: 18200 },
    { time: "18:30", count: 27500 },
    { time: "19:00", count: 35900 },
    { time: "19:30", count: 39800 },
    { time: "20:00", count: activeEvent.attendance }
  ];

  // Count how many gates exceed 80% capacity
  const congestedGates = gates.filter(g => (g.currentCount / g.capacity) > 0.8);
  const isMultiGateCongestion = congestedGates.length >= 2;

  /**
   * Gemini Operational Summary Trigger
   * ONLY calls Gemini (via Cloud Function) when 2 or more gates exceed 80% capacity simultaneously
   */
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
              setOperationalSummary(`CRITICAL WARNING (SIMULATION): Severe ingress delay at ${names} (load exceeding 80%). Operational coordinators must immediately dispatch staff squad 3 to divert incoming parking lanes toward ${recName}.`);
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
      // Clear summary when counts decrease below the threshold
      setOperationalSummary("");
    }
  }, [isMultiGateCongestion, gates]);

  /**
   * Predefined Rule-Based Alternate Gate Selection (No AI)
   * Finds the best gate with capacity below 80% with the lowest current load
   */
  const suggestAlternateGate = (congestedGate) => {
    const safeGates = gates.filter(g => (g.currentCount / g.capacity) <= 0.8);
    if (safeGates.length === 0) return "All gates heavily congested. Standard delay queue advisory active.";
    
    // Sort by occupancy load ratio (currentCount / capacity) ascending
    const sorted = [...safeGates].sort((a, b) => (a.currentCount / a.capacity) - (b.currentCount / b.capacity));
    const bestGate = sorted[0];
    const bestLoad = Math.round((bestGate.currentCount / bestGate.capacity) * 100);

    return `Divert to ${bestGate.name} (Operating at ${bestLoad}% load).`;
  };

  const handleAlarmToggle = () => {
    triggerEvacuationAlarm(!evacuationAlarm);
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "20px" }}>
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

      {/* EMERGENCY ADVISORY CARD - TRIGGERED ONLY ON 2+ CONGESTED GATES VIA GEMINI */}
      {isMultiGateCongestion && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: "24px", 
            marginBottom: "30px", 
            border: "1px solid rgba(168, 85, 247, 0.4)", 
            background: "rgba(168, 85, 247, 0.05)",
            boxShadow: "0 0 25px rgba(168, 85, 247, 0.15)",
            animation: "pulse-border 2s infinite alternate"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ color: "var(--color-purple)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "1.1rem" }}>
              <BrainCircuit size={20} />
              Gemini Operational Ingress Advisory
            </h4>
            <span className="badge-status role-organizer" style={{ background: "rgba(168, 85, 247, 0.15)", color: "var(--color-purple)" }}>
              AI Summary active
            </span>
          </div>
          
          {summaryLoading ? (
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" }}>
              <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              <span>Analyzing live telemetry models...</span>
            </div>
          ) : (
            <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              {operationalSummary}
            </p>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid-cols-3" style={{ marginBottom: "30px" }}>
        <StatCard 
          title="Overall Attendance" 
          value={`${activeEvent.attendance.toLocaleString()} / ${activeEvent.capacity.toLocaleString()}`} 
          icon={Users} 
          color="cyan"
          subtext={`${activeEvent.capacity - activeEvent.attendance} seats remaining`}
        />
        <StatCard 
          title="Congested Entrances" 
          value={`${congestedGates.length} / ${gates.length}`} 
          icon={Flame} 
          color={congestedGates.length > 0 ? "rose" : "emerald"}
          subtext={congestedGates.length >= 2 ? "Gemini Advisory Triggered" : "Operational flow normal"}
        />
        <StatCard 
          title="Average Ingress Rate" 
          value={evacuationAlarm ? "0 p/m" : "245 p/min"} 
          icon={Compass} 
          color={evacuationAlarm ? "rose" : "indigo"}
          subtext="Based on last 10 minutes scanner analytics"
        />
      </div>

      {/* Gates Telemetry Rows */}
      <div className="glass-panel" style={{ padding: "24px", marginBottom: "30px" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)" }}>
          Real-time Gates Ingress Flow
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {gates.map(gate => {
            const loadPercent = gate.currentCount / gate.capacity;
            const loadPercentFormatted = Math.round(loadPercent * 100);
            const isCongested = loadPercent > 0.8;

            let statusColor = "var(--color-emerald)";
            if (loadPercent > 0.5) statusColor = "var(--color-amber)";
            if (isCongested) statusColor = "var(--color-rose)";

            return (
              <div 
                key={gate.id} 
                className="glass-panel" 
                style={{ 
                  padding: "20px", 
                  background: isCongested ? "rgba(244, 63, 94, 0.02)" : "rgba(255, 255, 255, 0.01)",
                  borderColor: isCongested ? "rgba(244, 63, 94, 0.2)" : "var(--border-glass)",
                  transition: "var(--transition)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h4 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{gate.name}</h4>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Sensor load: <strong>{gate.currentCount}</strong> / {gate.capacity} capacity
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span 
                      className={`badge-status badge-${gate.status.toLowerCase()}`}
                    >
                      {gate.status} Load
                    </span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 700, color: statusColor }}>
                      {loadPercentFormatted}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="queue-progress-bar" style={{ marginTop: "12px", height: "10px" }}>
                  <div 
                    className="queue-progress-fill" 
                    style={{ 
                      width: `${loadPercentFormatted}%`,
                      backgroundColor: statusColor,
                      boxShadow: `0 0 10px ${statusColor}`
                    }} 
                  />
                </div>

                {/* Predefined Rule-Based Alternate Suggestion (NO AI) */}
                {isCongested && (
                  <div 
                    style={{ 
                      marginTop: "12px", 
                      padding: "10px 14px", 
                      background: "rgba(245, 158, 11, 0.05)", 
                      border: "1px solid rgba(245, 158, 11, 0.15)", 
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      color: "var(--color-amber)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span>⚠️ Congestion threshold exceeded. <strong>Alternate Route Suggestion:</strong></span>
                    <span style={{ fontWeight: 700 }}>{suggestAlternateGate(gate)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid for Area Ingress history */}
      <div className="grid-cols-2" style={{ marginBottom: "30px" }}>
        {/* Ingress Timeline Area Chart */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)" }}>
            Accumulated Ingress Flow (Attendance over Time)
          </h3>
          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={entryFlowData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-cyan)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ background: "var(--bg-secondary)", borderColor: "var(--border-glass)", borderRadius: "8px" }} 
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Area type="monotone" dataKey="count" name="Attendance" stroke="var(--color-cyan)" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stadium Bowl Capacity Statuses Table */}
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
