import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/**
 * IngressChart component visualizing real-time ingress rate statistics using Recharts AreaChart.
 * 
 * @param {Object} props
 * @param {Array} props.entryFlowData - List of hourly ingress count data points
 */
export function IngressChart({ entryFlowData }) {
  return (
    <div style={{ height: "300px", marginTop: "10px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={entryFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-indigo)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--color-indigo)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              background: "rgba(10, 15, 30, 0.9)", 
              border: "1px solid var(--border-glass)", 
              borderRadius: "8px",
              color: "var(--text-primary)" 
            }} 
          />
          <Area type="monotone" dataKey="count" stroke="var(--color-indigo)" fillOpacity={1} fill="url(#colorFlow)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
