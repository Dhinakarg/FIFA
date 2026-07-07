import React, { useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { 
  Info, 
  Clock, 
  Users, 
  ShieldAlert, 
  Sparkles, 
  Coffee, 
  Navigation, 
  MapPin, 
  User, 
  Compass, 
  Check, 
  X 
} from "lucide-react";

export default function StadiumMap() {
  const { queues, facilities, volunteers } = useAppState();
  
  // Selection States
  const [selectedFacility, setSelectedFacility] = useState("fac-1"); // ID of selected facility from Firestore
  const [selectedGate, setSelectedGate] = useState("gate-a"); // ID of starting gate

  React.useEffect(() => {
    if (facilities.length > 0) {
      const exists = facilities.some(f => f.id === selectedFacility);
      if (!exists) {
        setSelectedFacility(facilities[0].id);
      }
    }
  }, [facilities, selectedFacility]);
  const [showDirections, setShowDirections] = useState(false);

  // Absolute Gate SVG Coordinates Mapping (gx, gy)
  const gateCoords = {
    "gate-a": { name: "Gate A", x: 25, y: 200 },
    "gate-b": { name: "Gate B", x: 300, y: 25 },
    "gate-c": { name: "Gate C", x: 300, y: 375 },
    "gate-d": { name: "Gate D", x: 575, y: 200 }
  };

  // Facility Proximity Zones Map matching seeder IDs to volunteer zones
  const facilityZones = {
    "fac-1": "Zone C", // Eastern Grill Concession
    "fac-2": "Zone A", // Arena Drinks & Snacks
    "fac-3": "Zone D", // Southern Pizza Hub
    "fac-4": "Zone E", // VIP Champagne Bar
    "fac-5": "Zone B", // North Plaza Washrooms
    "fac-6": "Zone D", // South Concourse restrooms
    "fac-7": "Zone C", // East Upper restrooms
    "fac-8": "Zone A", // First Aid Section 104
    "fac-9": "Zone C", // First Aid Section 228
    "fac-10": "Zone A" // Customer Help Hub Center
  };

  const getActiveFacility = () => {
    return facilities.find(f => f.id === selectedFacility);
  };

  const activeFac = getActiveFacility();

  // Filter volunteers in the selected facility's zone
  const activeZone = facilityZones[selectedFacility] || "Zone A";
  const localVolunteers = volunteers.filter(v => v.zone === activeZone);

  // Translate percentage coordinates to absolute SVG dimensions (viewBox 0 0 600 400)
  const getSvgCoords = (fac) => {
    if (!fac) return { x: 300, y: 200 };
    return {
      x: fac.x * 6, // 0-100% maps to 600 width
      y: fac.y * 4  // 0-100% maps to 400 height
    };
  };

  const facCoords = getSvgCoords(activeFac);
  const startGateCoords = gateCoords[selectedGate];

  /**
   * Trigonometric Pathfinding Rule (Purely rule/data-based):
   * Calculates a curved route that hugs the outer concourse ring of the stadium
   * to avoid drawing lines directly through the inner seating bowl/pitch field.
   */
  const getPathDAttribute = () => {
    if (!startGateCoords || !facCoords) return "";

    const gx = startGateCoords.x;
    const gy = startGateCoords.y;
    const fx = facCoords.x;
    const fy = facCoords.y;

    // Stadium center is (300, 200). Concourse ellipse boundary is rx=170, ry=95.
    // Calculate the angle of the target facility relative to center
    const angle = Math.atan2(fy - 200, fx - 300);

    // Map a concourse entry node at the same angle
    const cx = 300 + 170 * Math.cos(angle);
    const cy = 200 + 95 * Math.sin(angle);

    // M: Move to Gate. Q: Draw smooth quadratic Bezier curve using concourse node as control point.
    return `M ${gx} ${gy} Q ${cx} ${cy} ${fx} ${fy}`;
  };

  // Find dynamic wait times and statuses for Selected Concession / Gate
  const getActiveTelemetry = () => {
    if (!activeFac) return null;
    const match = queues.find(q => q.name.toLowerCase().includes(activeFac.name.toLowerCase()) || activeFac.name.toLowerCase().includes(q.name.toLowerCase()));
    return match || null;
  };

  const telemetry = getActiveTelemetry();

  return (
    <div>
      {/* Visual stylesheet for marching ants walking path animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes march {
          to {
            stroke-dashoffset: -20;
          }
        }
        .walking-route {
          stroke: var(--color-cyan);
          stroke-width: 4px;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 8, 8;
          fill: none;
          filter: drop-shadow(0 0 6px var(--color-cyan));
          animation: march 1.2s linear infinite;
        }
        .pulse-marker {
          animation: markerPulse 1.5s ease-out infinite;
        }
        @keyframes markerPulse {
          0% { r: 6; opacity: 1; }
          100% { r: 18; opacity: 0; }
        }
      `}} />

      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h1 className="page-title">Interactive Stadium Map</h1>
          <p className="page-description">View dynamic telemetry points, choose entry gates, and calculate rule-based walking paths.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <span className="badge-status role-fan">Real-time Layout</span>
        </div>
      </div>

      <div className="grid-cols-3" style={{ gap: "30px" }}>
        {/* SVG Map Canvas */}
        <div className="glass-panel" style={{ padding: "24px", gridColumn: "span 2", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "1.2rem", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Compass size={18} />
              Vector Egress Layout
            </h3>
            {showDirections && (
              <span style={{ fontSize: "0.8rem", color: "var(--color-cyan)", fontWeight: 600 }}>
                ⚡ Walking Route Displayed
              </span>
            )}
          </div>
          
          <div className="stadium-svg-container" style={{ width: "100%" }}>
            <svg viewBox="0 0 600 400" width="100%" height="auto" style={{ maxWidth: "520px" }}>
              {/* Outer Stadium walls */}
              <rect x="10" y="10" width="580" height="380" rx="100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <rect x="25" y="25" width="550" height="350" rx="90" fill="none" stroke="var(--border-glass)" strokeWidth="2" />
              
              {/* Inner Seating bowl ring */}
              <ellipse cx="300" cy="200" rx="200" ry="120" fill="rgba(19, 26, 48, 0.4)" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              
              {/* Seating Rings */}
              <ellipse cx="300" cy="200" rx="170" ry="95" fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="24" />

              {/* Pitch/Field center */}
              <ellipse cx="300" cy="200" rx="120" ry="55" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
              <circle cx="300" cy="200" r="25" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="2" />

              {/* INGRESS GATES TURNSTILES */}
              {/* Gate A (West) */}
              <rect 
                x="15" y="170" width="20" height="60" rx="4" 
                fill={selectedGate === "gate-a" && showDirections ? "var(--color-cyan)" : "#1b2542"} 
                stroke={selectedGate === "gate-a" ? "var(--color-cyan)" : "transparent"}
                strokeWidth="2"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedGate("gate-a")}
              />
              <text x="25" y="205" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">A</text>

              {/* Gate B (North) */}
              <rect 
                x="270" y="15" width="60" height="20" rx="4" 
                fill={selectedGate === "gate-b" && showDirections ? "var(--color-cyan)" : "#1b2542"} 
                stroke={selectedGate === "gate-b" ? "var(--color-cyan)" : "transparent"}
                strokeWidth="2"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedGate("gate-b")}
              />
              <text x="300" y="28" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">B</text>

              {/* Gate C (South) */}
              <rect 
                x="270" y="365" width="60" height="20" rx="4" 
                fill={selectedGate === "gate-c" && showDirections ? "var(--color-cyan)" : "#1b2542"} 
                stroke={selectedGate === "gate-c" ? "var(--color-cyan)" : "transparent"}
                strokeWidth="2"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedGate("gate-c")}
              />
              <text x="300" y="378" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">C</text>

              {/* Gate D (East) */}
              <rect 
                x="565" y="170" width="20" height="60" rx="4" 
                fill={selectedGate === "gate-d" && showDirections ? "var(--color-cyan)" : "#1b2542"} 
                stroke={selectedGate === "gate-d" ? "var(--color-cyan)" : "transparent"}
                strokeWidth="2"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedGate("gate-d")}
              />
              <text x="575" y="205" fill="#fff" fontSize="10" textAnchor="middle" fontWeight="bold">D</text>

              {/* DYNAMIC FACILITIES MARKERS (Retrieved from Firestore coordinates) */}
              {facilities.map((fac) => {
                const isSelected = selectedFacility === fac.id;
                const coords = getSvgCoords(fac);
                
                // Color code markers based on category
                let color = "var(--color-purple)"; // concessions default
                let symbol = "🍗";
                if (fac.category === "restroom") { color = "var(--color-indigo)"; symbol = "WC"; }
                if (fac.category === "medical") { color = "var(--color-rose)"; symbol = "✙"; }
                if (fac.category === "info") { color = "var(--color-cyan)"; symbol = "i"; }

                return (
                  <g 
                    key={fac.id} 
                    transform={`translate(${coords.x}, ${coords.y})`}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedFacility(fac.id);
                      setShowDirections(false); // Reset path when selecting new facility
                    }}
                  >
                    {/* Ring glow */}
                    <circle r={isSelected ? 16 : 12} fill="transparent" stroke={color} strokeWidth="1.5" />
                    
                    {/* Marker base */}
                    <circle r={isSelected ? 10 : 8} fill={color} opacity={isSelected ? 0.9 : 0.7} />
                    
                    {/* Symbol text inside marker */}
                    <text y="3" fontSize={isSelected ? "9" : "7"} fill="#fff" fontWeight="bold" textAnchor="middle">
                      {symbol}
                    </text>
                  </g>
                );
              })}

              {/* Walking Path Line (Bezier curve matching the concourse boundary) */}
              {showDirections && startGateCoords && facCoords && (
                <path 
                  d={getPathDAttribute()} 
                  className="walking-route" 
                />
              )}

              {/* Pulsing start marker */}
              {showDirections && startGateCoords && (
                <g transform={`translate(${startGateCoords.x}, ${startGateCoords.y})`}>
                  <circle r="6" fill="var(--color-cyan)" className="pulse-marker" />
                  <circle r="4" fill="var(--color-cyan)" />
                </g>
              )}

              {/* Pulsing destination marker */}
              {showDirections && facCoords && (
                <g transform={`translate(${facCoords.x}, ${facCoords.y})`}>
                  <circle r="6" fill="var(--color-cyan)" className="pulse-marker" />
                </g>
              )}
            </svg>
          </div>

          {/* Labels & Legends */}
          <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <span style={{ width: "12px", height: "12px", background: "var(--color-cyan)", borderRadius: "3px" }} /> Gates A-D
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <span style={{ width: "12px", height: "12px", background: "var(--color-purple)", borderRadius: "3px" }} /> Concessions
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <span style={{ width: "12px", height: "12px", background: "var(--color-indigo)", borderRadius: "3px" }} /> Washrooms (WC)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <span style={{ width: "12px", height: "12px", background: "var(--color-rose)", borderRadius: "3px" }} /> First Aid
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              <span style={{ width: "12px", height: "12px", background: "var(--color-cyan)", borderRadius: "3px" }} /> Help Hub Info
            </span>
          </div>
        </div>

        {/* Proximity telemetry & dynamic direction controls panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Path Finding Control Panel */}
          <div className="glass-panel" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Navigation size={18} />
              Concourse Directions
            </h3>

            <div className="input-group">
              <label className="input-label">Select Starting Gate</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {Object.keys(gateCoords).map(gId => (
                  <button
                    key={gId}
                    onClick={() => {
                      setSelectedGate(gId);
                      setShowDirections(false);
                    }}
                    className={`interactive-btn secondary`}
                    style={{
                      padding: "8px 0",
                      fontSize: "0.85rem",
                      borderRadius: "8px",
                      borderColor: selectedGate === gId ? "var(--color-cyan)" : "var(--border-glass)",
                      background: selectedGate === gId ? "rgba(6, 182, 212, 0.15)" : "var(--bg-tertiary)",
                      color: selectedGate === gId ? "var(--color-cyan)" : "var(--text-primary)"
                    }}
                  >
                    {gateCoords[gId].name.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Active Destination</label>
              <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "10px", fontSize: "0.9rem" }}>
                📍 {activeFac ? activeFac.name : "Select a marker on map"}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button 
                onClick={() => setShowDirections(true)} 
                className="interactive-btn" 
                style={{ flexGrow: 1, padding: "10px", fontSize: "0.85rem" }}
                disabled={!activeFac}
              >
                Find Walking Path
              </button>
              {showDirections && (
                <button 
                  onClick={() => setShowDirections(false)} 
                  className="interactive-btn secondary" 
                  style={{ padding: "10px" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Details & Telemetry */}
          {activeFac && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "8px", textTransform: "capitalize" }}>
                {activeFac.name}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "16px" }}>
                {activeFac.description}
              </p>
              
              <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Proximity Zone:</span>
                  <span style={{ fontWeight: 600, color: "var(--color-indigo)" }}>{activeZone}</span>
                </div>
                {telemetry ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>Line Wait Estimate:</span>
                      <span style={{ fontWeight: 600, color: telemetry.status === 'high' ? 'var(--color-rose)' : telemetry.status === 'medium' ? 'var(--color-amber)' : 'var(--color-emerald)' }}>
                        {telemetry.waitTime} minutes
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>Capacity Load:</span>
                      <span style={{ fontWeight: 600 }}>{telemetry.capacity}%</span>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.02)", padding: "8px", borderRadius: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <Info size={12} />
                    <span>No wait times telemetry active for this sector.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proximity Support Volunteers */}
          {activeFac && (
            <div className="glass-panel" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={16} />
                Zone Support Crew
              </h3>
              
              {localVolunteers.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No staff currently assigned to this immediate zone.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {localVolunteers.map(vol => (
                    <div 
                      key={vol.id}
                      style={{ 
                        padding: "10px", 
                        borderRadius: "8px", 
                        background: "rgba(255,255,255,0.02)", 
                        border: "1px solid var(--border-glass)", 
                        fontSize: "0.8rem" 
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                        <span>{vol.name}</span>
                        <span 
                          style={{ 
                            fontSize: "0.7rem", 
                            color: vol.status === "available" ? "var(--color-emerald)" : "var(--color-amber)" 
                          }}
                        >
                          ● {vol.status === "available" ? "Active" : "Busy"}
                        </span>
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "2px" }}>
                        Role: {vol.role} | Contact: {vol.contactMethod}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
