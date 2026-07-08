import React from "react";
import { ShieldAlert, Loader2, X } from "lucide-react";

/**
 * EmergencyModal component displaying raises critical alert forms and active procedure advisories.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Object|null} props.activeAlert - Active alert data with SOP and volunteer details
 * @param {string} props.emergencyType - Selected emergency category
 * @param {Function} props.setEmergencyType - Set emergency category state
 * @param {string} props.emergencyLoc - Selected location
 * @param {Function} props.setEmergencyLoc - Set location state
 * @param {string} props.emergencyDesc - Input description
 * @param {Function} props.setEmergencyDesc - Set input description state
 * @param {boolean} props.isSubmitting - Raising alert loader status
 * @param {Function} props.onSubmit - Raise alert callback handler
 * @param {Function} props.onClose - Close modal callback handler
 */
export function EmergencyModal({
  isOpen,
  activeAlert,
  emergencyType,
  setEmergencyType,
  emergencyLoc,
  setEmergencyLoc,
  emergencyDesc,
  setEmergencyDesc,
  isSubmitting,
  onSubmit,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div className="glass-panel" style={styles.container}>
        {activeAlert ? (
          <div>
            <div style={styles.header}>
              <h3 style={styles.alertTitle}>
                <ShieldAlert size={22} />
                Critical Emergency Initiated
              </h3>
              <span className="badge-status badge-critical">Critical</span>
            </div>

            <div style={styles.flexCol}>
              <div style={styles.locationBox}>
                <div style={styles.label}>Report Location:</div>
                <div style={styles.locationVal}>{activeAlert.location}</div>
              </div>

              <div style={styles.sopBox}>
                <div style={styles.sopLabel}>Emergency Procedure (SOP)</div>
                <p style={styles.boxText}>{activeAlert.sopText}</p>
              </div>

              <div style={styles.volBox}>
                <div style={styles.volLabel}>Nearest Active Volunteer Dispatched</div>
                <div style={styles.flexSpaceBetween}>
                  <div>
                    <div style={styles.boldText}>{activeAlert.volunteer.name}</div>
                    <div style={styles.subText}>
                      Zone: {activeAlert.volunteer.zone} | Contact: {activeAlert.volunteer.contactMethod}
                    </div>
                  </div>
                  <span className="badge-status badge-resolved" style={{ fontSize: "0.7rem" }}>Assigned</span>
                </div>
              </div>

              <div style={styles.evacBox}>
                <div style={styles.evacLabel}>Evacuation Routing Egress</div>
                <p style={styles.boxText}>{activeAlert.evacuationRoute}</p>
              </div>
            </div>

            <button onClick={onClose} className="interactive-btn secondary" style={{ width: "100%", marginTop: "24px" }}>
              Dismiss Advisory
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div style={styles.header}>
              <h3 style={styles.alertTitle}>
                <ShieldAlert size={22} />
                Report Critical Emergency
              </h3>
              <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close emergency modal">
                <X size={18} />
              </button>
            </div>
            
            <p style={styles.infoText}>
              Logging here flags a Critical incident immediately. Firestore listeners will dispatch real-time warning indicators to Staff Operations boards.
            </p>

            <div className="input-group">
              <label htmlFor="emergency-category-select" className="input-label">Emergency Category</label>
              <select id="emergency-category-select" className="form-input" value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} disabled={isSubmitting}>
                <option value="unclear">Unsure / Unclear (Auto-classify via Gemini AI)</option>
                <option value="medical">Medical Emergency</option>
                <option value="fire">Fire Emergency</option>
                <option value="lost child">Lost Child Alert</option>
                <option value="fight">Physical Altercation</option>
                <option value="power failure">Power Failure</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="emergency-location-select" className="input-label">Location / Sector</label>
              <select id="emergency-location-select" className="form-input" value={emergencyLoc} onChange={(e) => setEmergencyLoc(e.target.value)} disabled={isSubmitting}>
                <option value="Zone A (Concourse)">Zone A (West Stand)</option>
                <option value="Zone B (Concourse)">Zone B (North Stand)</option>
                <option value="Zone C (Seating)">Zone C (East Stand)</option>
                <option value="Zone D (Seating)">Zone D (South Stand)</option>
                <option value="Zone E (Suites)">Zone E (VIP Suites)</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="emergency-description-input" className="input-label">Unstructured Incident Description</label>
              <textarea id="emergency-description-input" className="form-input" rows="4" placeholder="Provide details..." value={emergencyDesc} onChange={(e) => setEmergencyDesc(e.target.value)} required disabled={isSubmitting} />
            </div>

            <button type="submit" className="interactive-btn danger" style={{ width: "100%", marginTop: "10px" }} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ marginRight: "8px", animation: "spin 1s linear infinite" }} />
                  Classifying emergency profiles...
                </>
              ) : (
                <>
                  <ShieldAlert size={16} style={{ marginRight: "8px" }} />
                  Raise Critical Alert
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(5, 8, 17, 0.85)", backdropFilter: "blur(12px)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
  },
  container: {
    width: "100%", maxWidth: "550px", padding: "30px",
    boxShadow: "0 0 30px rgba(244, 63, 94, 0.2)", border: "1px solid rgba(244, 63, 94, 0.4)"
  },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  alertTitle: { color: "var(--color-rose)", display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "1.3rem" },
  flexCol: { display: "flex", flexDirection: "column", gap: "20px" },
  flexSpaceBetween: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  locationBox: { background: "rgba(255, 255, 255, 0.02)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-glass)" },
  label: { fontSize: "0.75rem", color: "var(--text-secondary)" },
  locationVal: { fontSize: "0.95rem", fontWeight: 700, marginTop: "2px" },
  sopBox: { background: "rgba(245, 158, 11, 0.03)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(245, 158, 11, 0.2)" },
  sopLabel: { fontSize: "0.8rem", color: "var(--color-amber)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" },
  boxText: { fontSize: "0.85rem", whiteSpace: "pre-line", lineHeight: "1.5" },
  volBox: { background: "rgba(16, 185, 129, 0.03)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)" },
  volLabel: { fontSize: "0.8rem", color: "var(--color-emerald)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" },
  boldText: { fontSize: "0.95rem", fontWeight: 700 },
  subText: { fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" },
  evacBox: { background: "rgba(244, 63, 94, 0.03)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(244, 63, 94, 0.2)" },
  evacLabel: { fontSize: "0.8rem", color: "var(--color-rose)", fontWeight: 700, textTransform: "uppercase", marginBottom: "8px" },
  closeBtn: { background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" },
  infoText: { color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }
};
