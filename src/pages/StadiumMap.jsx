import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAppState } from "../context/AppStateContext";
import { Compass } from "lucide-react";
import { StadiumSvg } from "../components/StadiumSvg";
import { FacilityPanel } from "../components/FacilityPanel";

const gateCoords = {
  "gate-a": { name: "Gate A", x: 25, y: 200 },
  "gate-b": { name: "Gate B", x: 300, y: 25 },
  "gate-c": { name: "Gate C", x: 300, y: 375 },
  "gate-d": { name: "Gate D", x: 575, y: 200 }
};

const facilityZones = {
  "fac-1": "Zone C",
  "fac-2": "Zone A",
  "fac-3": "Zone D",
  "fac-4": "Zone E",
  "fac-5": "Zone B",
  "fac-6": "Zone D",
  "fac-7": "Zone C",
  "fac-8": "Zone A",
  "fac-9": "Zone C",
  "fac-10": "Zone A"
};

/**
 * StadiumMap page rendering vectors overlays, gate points,
 * walking paths, and facility pins.
 * 
 * @returns {JSX.Element} The active StadiumMap page
 */
export default function StadiumMap() {
  const { queues, facilities, volunteers } = useAppState();
  
  const [selectedFacility, setSelectedFacility] = useState("fac-1");
  const [selectedGate, setSelectedGate] = useState("gate-a");
  const [showDirections, setShowDirections] = useState(false);

  useEffect(() => {
    if (facilities.length > 0) {
      const exists = facilities.some(f => f.id === selectedFacility);
      if (!exists) {
        setSelectedFacility(facilities[0].id);
      }
    }
  }, [facilities, selectedFacility]);

  const activeFac = useMemo(() => {
    return facilities.find(f => f.id === selectedFacility);
  }, [facilities, selectedFacility]);

  const activeZone = facilityZones[selectedFacility] || "Zone A";
  
  const localVolunteers = useMemo(() => {
    return volunteers.filter(v => v.zone === activeZone);
  }, [volunteers, activeZone]);

  const getSvgCoords = useCallback((fac) => {
    if (!fac) return { x: 300, y: 200 };
    return {
      x: fac.x * 6,
      y: fac.y * 4
    };
  }, []);

  const facCoords = useMemo(() => getSvgCoords(activeFac), [activeFac, getSvgCoords]);
  const startGateCoords = useMemo(() => gateCoords[selectedGate], [selectedGate]);

  /**
   * Trigonometric Pathfinding Rule (Purely rule/data-based).
   * Calculates a curved SVG Bezier trajectory that hugs the outer concourse ring of the stadium
   * to avoid drawing lines directly through the inner seating bowl or the main pitch field.
   * 
   * @returns {string} SVG Path string (d-attribute format e.g., "M x y Q cx cy fx fy")
   */
  const getPathDAttribute = useCallback(() => {
    if (!startGateCoords || !facCoords) return "";

    const gx = startGateCoords.x;
    const gy = startGateCoords.y;
    const fx = facCoords.x;
    const fy = facCoords.y;

    const angle = Math.atan2(fy - 200, fx - 300);

    const cx = 300 + 170 * Math.cos(angle);
    const cy = 200 + 95 * Math.sin(angle);

    return `M ${gx} ${gy} Q ${cx} ${cy} ${fx} ${fy}`;
  }, [startGateCoords, facCoords]);

  const telemetry = useMemo(() => {
    if (!activeFac) return null;
    return queues.find(q => 
      q.name.toLowerCase().includes(activeFac.name.toLowerCase()) || 
      activeFac.name.toLowerCase().includes(q.name.toLowerCase())
    ) || null;
  }, [queues, activeFac]);

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes march {
          to { stroke-dashoffset: -20; }
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

      <div className="page-header" style={styles.header}>
        <div>
          <h1 className="page-title">Interactive Stadium Map</h1>
          <p className="page-description">View dynamic telemetry points, choose entry gates, and calculate rule-based walking paths.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <span className="badge-status role-fan">Real-time Layout</span>
        </div>
      </div>

      <div className="grid-cols-3" style={{ gap: "30px" }}>
        <div className="glass-panel" style={styles.canvasCard}>
          <div style={styles.canvasHeader}>
            <h3 style={styles.canvasTitle}>
              <Compass size={18} />
              Vector Egress Layout
            </h3>
            {showDirections && (
              <span style={{ fontSize: "0.8rem", color: "var(--color-cyan)", fontWeight: 600 }}>
                ⚡ Walking Route Displayed
              </span>
            )}
          </div>
          
          <StadiumSvg
            selectedGate={selectedGate}
            setSelectedGate={setSelectedGate}
            selectedFacility={selectedFacility}
            setSelectedFacility={setSelectedFacility}
            showDirections={showDirections}
            setShowDirections={setShowDirections}
            facilities={facilities}
            getSvgCoords={getSvgCoords}
            getPathDAttribute={getPathDAttribute}
          />

          <div style={styles.legendRow}>
            <span style={styles.legendItem}><span style={styles.legendGate} /> Gates A-D</span>
            <span style={styles.legendItem}><span style={styles.legendConcession} /> Concessions</span>
            <span style={styles.legendItem}><span style={styles.legendRestroom} /> Washrooms (WC)</span>
            <span style={styles.legendItem}><span style={styles.legendMedical} /> First Aid</span>
            <span style={styles.legendItem}><span style={styles.legendInfo} /> Help Hub Info</span>
          </div>
        </div>

        <FacilityPanel
          activeFac={activeFac}
          selectedGate={selectedGate}
          setSelectedGate={setSelectedGate}
          showDirections={showDirections}
          setShowDirections={setShowDirections}
          gateCoords={gateCoords}
          activeZone={activeZone}
          telemetry={telemetry}
          localVolunteers={localVolunteers}
        />
      </div>
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "20px" },
  canvasCard: { padding: "24px", gridColumn: "span 2", display: "flex", flexDirection: "column", alignItems: "center" },
  canvasHeader: { display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", marginBottom: "16px" },
  canvasTitle: { fontSize: "1.2rem", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "6px" },
  legendRow: { display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap", justifyContent: "center" },
  legendItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" },
  legendGate: { width: "12px", height: "12px", background: "var(--color-cyan)", borderRadius: "3px" },
  legendConcession: { width: "12px", height: "12px", background: "var(--color-purple)", borderRadius: "3px" },
  legendRestroom: { width: "12px", height: "12px", background: "var(--color-indigo)", borderRadius: "3px" },
  legendMedical: { width: "12px", height: "12px", background: "var(--color-rose)", borderRadius: "3px" },
  legendInfo: { width: "12px", height: "12px", background: "var(--color-cyan)", borderRadius: "3px" }
};
