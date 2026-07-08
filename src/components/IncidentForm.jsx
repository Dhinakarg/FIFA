import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * IncidentForm component allowing users to report hazards or maintenance needs.
 * 
 * @param {Object} props
 * @param {Function} props.reportIncident - Global state callback to register reports
 */
export function IncidentForm({ reportIncident }) {
  const [incTitle, setIncTitle] = useState("");
  const [incType, setIncType] = useState("maintenance");
  const [incLoc, setIncLoc] = useState("Zone A (Concourse)");
  const [incDesc, setIncDesc] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleIncidentSubmit = (e) => {
    e.preventDefault();
    if (!incTitle || !incDesc) return;
    
    reportIncident(incTitle, incDesc, incType, incLoc, "Fan App User");
    setFormSubmitted(true);
    
    setTimeout(() => {
      setIncTitle("");
      setIncDesc("");
      setFormSubmitted(false);
    }, 3000);
  };

  return (
    <form onSubmit={handleIncidentSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      {formSubmitted && (
        <div className="badge-status badge-resolved" style={{ padding: "10px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
          <span>✓ Incident successfully filed. Security dispatched.</span>
        </div>
      )}
      <div className="input-group">
        <label htmlFor="inc-title-input" className="input-label">Brief Title</label>
        <input 
          id="inc-title-input"
          type="text" 
          className="form-input" 
          placeholder="e.g. Broken seat row 12" 
          value={incTitle} 
          onChange={(e) => setIncTitle(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="inc-type-select" className="input-label">Hazard Category</label>
        <select 
          id="inc-type-select"
          className="form-input"
          value={incType}
          onChange={(e) => setIncType(e.target.value)}
        >
          <option value="maintenance">Maintenance Issue</option>
          <option value="medical">Medical Injury</option>
          <option value="security">Crowd Safety / Security</option>
          <option value="lost child">Lost Child Report</option>
          <option value="fight">Altercation / Fight</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="inc-loc-select" className="input-label">Sector / Area Location</label>
        <select 
          id="inc-loc-select"
          className="form-input"
          value={incLoc}
          onChange={(e) => setIncLoc(e.target.value)}
        >
          <option value="Zone A (Concourse)">Zone A (Concourse)</option>
          <option value="Zone B (Concourse)">Zone B (Concourse)</option>
          <option value="Zone C (Seating)">Zone C (Seating)</option>
          <option value="Zone D (Seating)">Zone D (Seating)</option>
          <option value="Zone E (Suites)">Zone E (Suites Area)</option>
        </select>
      </div>

      <div className="input-group">
        <label htmlFor="inc-desc-input" className="input-label">Detailed Description</label>
        <textarea 
          id="inc-desc-input"
          className="form-input" 
          rows="3" 
          placeholder="Provide more specific instructions..." 
          value={incDesc}
          onChange={(e) => setIncDesc(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="interactive-btn danger" style={{ marginTop: "10px" }}>
        <AlertTriangle size={16} style={{ marginRight: "8px" }} />
        Submit Incident Report
      </button>
    </form>
  );
}
