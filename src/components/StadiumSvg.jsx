import React from "react";

/**
 * StadiumSvg component rendering vectors overlays, gate points,
 * walking paths, and facility pins.
 * 
 * @param {Object} props
 * @param {string} props.selectedGate - Starting entry gate ID
 * @param {Function} props.setSelectedGate - Switch gate ID selector state callback
 * @param {string} props.selectedFacility - Target facility database ID
 * @param {Function} props.setSelectedFacility - Switch facility database ID selector state callback
 * @param {boolean} props.showDirections - Display calculated trajectory paths trigger state
 * @param {Function} props.setShowDirections - Toggle showing walking directions path state
 * @param {Array} props.facilities - Dynamic pins details array from context
 * @param {Function} props.getSvgCoords - Trigonometric relative-to-viewbox coordinate calculations helper
 * @param {Function} props.getPathDAttribute - Curved quadratic trajectory builder helper
 */
export function StadiumSvg({
  selectedGate,
  setSelectedGate,
  selectedFacility,
  setSelectedFacility,
  showDirections,
  setShowDirections,
  facilities,
  getSvgCoords,
  getPathDAttribute
}) {
  return (
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

        {/* DYNAMIC FACILITIES MARKERS */}
        {facilities.map((fac) => {
          const isSelected = selectedFacility === fac.id;
          const coords = getSvgCoords(fac);
          
          let color = "var(--color-purple)";
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
                setShowDirections(false);
              }}
            >
              <circle r={isSelected ? 16 : 12} fill="transparent" stroke={color} strokeWidth="1.5" />
              <circle r={isSelected ? 10 : 8} fill={color} opacity={isSelected ? 0.9 : 0.7} />
              {isSelected && (
                <circle r="6" fill="var(--color-cyan)" className="pulse-marker" style={{ pointerEvents: "none" }} />
              )}
              <text y="3.5" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold" style={{ pointerEvents: "none" }}>
                {symbol}
              </text>
            </g>
          );
        })}

        {/* WALKING DIRECTION PATH LINE */}
        {showDirections && (
          <path d={getPathDAttribute()} className="walking-route" />
        )}
      </svg>
    </div>
  );
}
