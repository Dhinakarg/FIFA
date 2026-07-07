import React from "react";
import { useAppState } from "../context/AppStateContext";
import StatCard from "../components/StatCard";
import { Users, AlertTriangle, CheckSquare, Shield, Activity, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { 
    activeEvent, 
    incidents, 
    tasks, 
    queues, 
    evacuationAlarm,
    isFirebaseActive 
  } = useAppState();

  const pendingIncidentsCount = incidents.filter(i => i.status !== "resolved").length;
  const pendingTasksCount = tasks.filter(t => t.status !== "completed").length;

  // Find fastest & slowest gate
  const gateQueues = queues.filter(q => q.type === "gate");
  const sortedGates = [...gateQueues].sort((a, b) => a.waitTime - b.waitTime);
  const fastestGate = sortedGates[0];
  const slowestGate = sortedGates[sortedGates.length - 1];

  const occupancyPercent = Math.round((activeEvent.attendance / activeEvent.capacity) * 100);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 className="page-title">Welcome to StadiumAssist</h1>
          <p className="page-description">Real-time stadium telemetry and crowd coordination control center.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span className={`badge-status ${isFirebaseActive ? 'role-fan' : 'role-staff'}`}>
            {isFirebaseActive ? "Firestore Connected" : "Local Simulation Mode"}
          </span>
          {evacuationAlarm && (
            <span className="badge-status badge-high" style={{ padding: "8px 12px", animation: "pulse-border 1s infinite alternate" }}>
              ⚠️ ACTIVE EVACUATION
            </span>
          )}
        </div>
      </div>

      {/* Overview StatCards */}
      <div className="grid-cols-4" style={{ marginBottom: "30px" }}>
        <StatCard 
          title="Crowd Attendance" 
          value={`${activeEvent.attendance.toLocaleString()} / ${activeEvent.capacity.toLocaleString()}`} 
          icon={Users} 
          color="cyan"
          subtext={`${occupancyPercent}% seat occupancy`}
        />
        <StatCard 
          title="Active Incidents" 
          value={pendingIncidentsCount} 
          icon={AlertTriangle} 
          color={pendingIncidentsCount > 0 ? "rose" : "emerald"}
          subtext={`${incidents.filter(i => i.status === "resolved").length} resolved total`}
        />
        <StatCard 
          title="Pending Staff Tasks" 
          value={pendingTasksCount} 
          icon={CheckSquare} 
          color="amber"
          subtext={`${tasks.filter(t => t.status === "completed").length} tasks completed`}
        />
        <StatCard 
          title="Safety Alarm Status" 
          value={evacuationAlarm ? "ALARM" : "SECURE"} 
          icon={Shield} 
          color={evacuationAlarm ? "rose" : "emerald"}
          subtext={evacuationAlarm ? "Emergency Evacuation active" : "All zones operating normally"}
        />
      </div>

      <div className="grid-cols-3" style={{ marginBottom: "30px" }}>
        {/* Main Event Card */}
        <div className="glass-panel glow-indigo-hover" style={{ padding: "24px", gridColumn: "span 2", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <span className="badge-status role-fan">Active Event Live</span>
              <span style={{ color: "var(--color-indigo)", fontWeight: 700, fontSize: "0.9rem" }}>{activeEvent.date}</span>
            </div>
            <h2 style={{ fontSize: "1.8rem", marginTop: "12px", marginBottom: "8px", fontFamily: "var(--font-heading)" }}>
              {activeEvent.name}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Gates opened at {activeEvent.startTime}. Live capacity monitoring and safety dispatch functions are active. Stadium zone heatmaps are operating under standard profile levels.
            </p>
          </div>
          
          <div style={{ marginTop: "24px", display: "flex", gap: "24px", borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>VIP Area Load</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-purple)", marginTop: "4px" }}>{activeEvent.vipOccupancy}% Capacity</div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Average Entry Wait</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-cyan)", marginTop: "4px" }}>
                {Math.round(gateQueues.reduce((acc, curr) => acc + curr.waitTime, 0) / gateQueues.length)} mins
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Active Concessions</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-emerald)", marginTop: "4px" }}>14 Stands Open</div>
            </div>
          </div>
        </div>

        {/* Live Gates Telemetry */}
        <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} style={{ color: "var(--color-cyan)" }} />
              Egress/Ingress Routing
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
              Real-time RFID gates ticketing sensors queue wait estimates:
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {fastestGate && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(16, 185, 129, 0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-emerald)", fontWeight: 700, textTransform: "uppercase" }}>Fastest Ingress</span>
                    <h4 style={{ fontSize: "0.95rem", margin: "2px 0 0 0" }}>{fastestGate.name}</h4>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-emerald)" }}>
                    <Clock size={14} />
                    <span style={{ fontWeight: 700 }}>{fastestGate.waitTime}m</span>
                  </div>
                </div>
              )}
              {slowestGate && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(244, 63, 94, 0.05)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(244, 63, 94, 0.15)" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-rose)", fontWeight: 700, textTransform: "uppercase" }}>Congested Gate</span>
                    <h4 style={{ fontSize: "0.95rem", margin: "2px 0 0 0" }}>{slowestGate.name}</h4>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-rose)" }}>
                    <Clock size={14} />
                    <span style={{ fontWeight: 700 }}>{slowestGate.waitTime}m</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Link to="/map" className="interactive-btn secondary" style={{ width: "100%", textDecoration: "none", fontSize: "0.85rem", marginTop: "16px" }}>
            View Full Stadium Map
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <h3 style={{ fontSize: "1.4rem", marginBottom: "20px" }}>Stadium Command Center Actions</h3>
      <div className="grid-cols-4">
        <Link to="/assistant" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="glass-panel glow-cyan-hover" style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span className="badge-status role-fan" style={{ alignSelf: "start" }}>Fan Portal</span>
            <h4 style={{ fontSize: "1.1rem" }}>Fan Assistant</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Report spills or check locations via simulated AI agent conversation.</p>
          </div>
        </Link>

        <Link to="/crowd" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="glass-panel glow-purple-hover" style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span className="badge-status role-organizer" style={{ alignSelf: "start" }}>Organizer Portal</span>
            <h4 style={{ fontSize: "1.1rem" }}>Crowd Dashboard</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>View live charts, seating occupancy heatmaps, and evacuation alerts.</p>
          </div>
        </Link>

        <Link to="/operations" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="glass-panel glow-amber-hover" style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span className="badge-status role-staff" style={{ alignSelf: "start" }}>Staff Portal</span>
            <h4 style={{ fontSize: "1.1rem" }}>Staff Operations</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Manage facilities, checklist tasks, and dispatch crew for incidents.</p>
          </div>
        </Link>

        <Link to="/admin" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="glass-panel glow-rose-hover" style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span className="badge-status role-admin" style={{ alignSelf: "start" }}>Developer</span>
            <h4 style={{ fontSize: "1.1rem" }}>Admin Panel</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Simulate roles, toggle Firebase configurations, and reset mock seeds.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
