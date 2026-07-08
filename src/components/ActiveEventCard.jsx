import React from "react";
import { Users, Ticket, Clock, ShieldAlert } from "lucide-react";
import StatCard from "./StatCard";

/**
 * ActiveEventCard component rendering core match metrics inside StatCards.
 * 
 * @param {Object} props
 * @param {Object} props.activeEvent - Currently active event details
 * @param {number} props.revenue - Dynamic calculated ticket sales revenue
 * @param {string} props.ingressFlowRate - Average ingress crowd speed (p/m)
 * @param {boolean} props.evacuationAlarm - Current global alarm state
 */
export function ActiveEventCard({ activeEvent, revenue, ingressFlowRate, evacuationAlarm }) {
  return (
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
  );
}
