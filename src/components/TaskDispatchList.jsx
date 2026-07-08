import React, { useState } from "react";
import { Plus } from "lucide-react";

/**
 * TaskDispatchList component rendering form controls for dispatch logging.
 * 
 * @param {Object} props
 * @param {boolean} props.isAuthorized - Verification flag of staff roles
 * @param {Function} props.reportIncident - Callback to register reported incidents
 */
export function TaskDispatchList({ isAuthorized, reportIncident }) {
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("medical");
  const [newSeverity, setNewSeverity] = useState("Low");
  const [newLoc, setNewLoc] = useState("Zone A (Concourse)");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleIncidentFormSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    reportIncident(newTitle, newDesc, newType, newLoc, "Staff Operations Console", newSeverity);
    setFormSubmitted(true);

    setTimeout(() => {
      setNewTitle("");
      setNewDesc("");
      setFormSubmitted(false);
    }, 2500);
  };

  return (
    <div className="glass-panel" style={{ padding: "24px" }}>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
        <Plus size={18} />
        Log Operational Incident
      </h3>

      {formSubmitted ? (
        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--color-emerald)", color: "var(--color-emerald)", padding: "16px", borderRadius: "10px", textAlign: "center" }}>
          <h4 style={{ fontSize: "1rem", marginBottom: "4px" }}>Incident Logged</h4>
          <p style={{ fontSize: "0.8rem" }}>SOP and dispatch telemetry updated.</p>
        </div>
      ) : (
        <form onSubmit={handleIncidentFormSubmit}>
          <div className="input-group">
            <label htmlFor="staff-incident-title-input" className="input-label">Subject Title</label>
            <input 
              id="staff-incident-title-input"
              type="text" 
              className="form-input" 
              placeholder="e.g. Fight in Section 102"
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)}
              required
              disabled={!isAuthorized}
            />
          </div>

          <div className="input-group">
            <label htmlFor="staff-incident-type-select" className="input-label">Incident Type</label>
            <select 
              id="staff-incident-type-select"
              className="form-input" 
              value={newType} 
              onChange={(e) => setNewType(e.target.value)}
              disabled={!isAuthorized}
            >
              <option value="medical">Medical Incident</option>
              <option value="fire">Fire Incident</option>
              <option value="lost child">Lost Child</option>
              <option value="fight">Physical Fight</option>
              <option value="power failure">Power Failure</option>
            </select>
          </div>

          <div className="grid-cols-2" style={{ gap: "10px", marginBottom: "16px" }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="staff-incident-severity-select" className="input-label">Severity</label>
              <select 
                id="staff-incident-severity-select"
                className="form-input" 
                value={newSeverity} 
                onChange={(e) => setNewSeverity(e.target.value)}
                disabled={!isAuthorized}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label htmlFor="staff-incident-location-select" className="input-label">Location</label>
              <select 
                id="staff-incident-location-select"
                className="form-input" 
                value={newLoc} 
                onChange={(e) => setNewLoc(e.target.value)}
                disabled={!isAuthorized}
              >
                <option value="Zone A (Concourse)">Zone A (West)</option>
                <option value="Zone B (Concourse)">Zone B (North)</option>
                <option value="Zone C (Seating)">Zone C (East)</option>
                <option value="Zone D (Seating)">Zone D (South)</option>
                <option value="Zone E (Suites)">Zone E (VIP)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="staff-incident-desc-textarea" className="input-label">Description (Free text triggers Gemini)</label>
            <textarea 
              id="staff-incident-desc-textarea"
              className="form-input" 
              rows="4" 
              placeholder="Provide details..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              required
              disabled={!isAuthorized}
            />
          </div>

          <button 
            type="submit" 
            className="interactive-btn" 
            style={{ width: "100%" }}
            disabled={!isAuthorized}
          >
            Log Dispatch Ticket
          </button>
        </form>
      )}
    </div>
  );
}
