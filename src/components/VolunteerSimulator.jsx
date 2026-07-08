import React, { useState } from "react";
import { BookOpen, Sliders, MapPin, Users, Edit, Trash2 } from "lucide-react";

/**
 * VolunteerSimulator component rendering CRUD tables and forms for database entities.
 * Manages FAQs, Gates, Facilities, and Volunteers.
 * 
 * @param {Object} props
 * @param {boolean} props.isAuthorized - Verification flag of admin roles
 * @param {Array} props.faqs - Knowledge Base FAQ listings
 * @param {Function} props.saveFaq - State callback to save a FAQ
 * @param {Function} props.deleteFaq - State callback to delete a FAQ
 * @param {Array} props.gates - Telemetry gates list
 * @param {Function} props.saveGate - State callback to save a gate
 * @param {Function} props.deleteGate - State callback to delete a gate
 * @param {Array} props.facilities - Telemetry facilities list
 * @param {Function} props.saveFacility - State callback to save a facility
 * @param {Function} props.deleteFacility - State callback to delete a facility
 * @param {Array} props.volunteers - Active volunteers list
 * @param {Function} props.saveVolunteer - State callback to save a volunteer
 * @param {Function} props.deleteVolunteer - State callback to delete a volunteer
 */
export function VolunteerSimulator({
  isAuthorized,
  faqs, saveFaq, deleteFaq,
  gates, saveGate, deleteGate,
  facilities, saveFacility, deleteFacility,
  volunteers, saveVolunteer, deleteVolunteer
}) {
  const [activeTab, setActiveTab] = useState("faqs");

  // FAQ Form State
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqKeyword, setFaqKeyword] = useState("");
  const [faqIntent, setFaqIntent] = useState("");
  const [faqSynonyms, setFaqSynonyms] = useState("");
  const [faqResponse, setFaqResponse] = useState("");
  const [faqLanguage, setFaqLanguage] = useState("en");
  const [faqVerified, setFaqVerified] = useState(true);

  // Gate Form State
  const [editingGate, setEditingGate] = useState(null);
  const [gateName, setGateName] = useState("");
  const [gateCount, setGateCount] = useState(0);
  const [gateCapacity, setGateCapacity] = useState(1000);
  const [gateStatus, setGateStatus] = useState("Low");

  // Facility Form State
  const [editingFacility, setEditingFacility] = useState(null);
  const [facName, setFacName] = useState("");
  const [facCategory, setFacCategory] = useState("concession");
  const [facDesc, setFacDesc] = useState("");
  const [facX, setFacX] = useState(50);
  const [facY, setFacY] = useState(50);

  // Volunteer Form State
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [volName, setVolName] = useState("");
  const [volZone, setVolZone] = useState("Zone A");
  const [volRole, setVolRole] = useState("usher");
  const [volStatus, setVolStatus] = useState("available");
  const [volContact, setVolContact] = useState("");

  // Cleaners
  const clearFaqForm = () => {
    setEditingFaq(null); setFaqKeyword(""); setFaqIntent(""); setFaqSynonyms(""); setFaqResponse(""); setFaqLanguage("en"); setFaqVerified(true);
  };
  const clearGateForm = () => {
    setEditingGate(null); setGateName(""); setGateCount(0); setGateCapacity(1000); setGateStatus("Low");
  };
  const clearFacilityForm = () => {
    setEditingFacility(null); setFacName(""); setFacCategory("concession"); setFacDesc(""); setFacX(50); setFacY(50);
  };
  const clearVolunteerForm = () => {
    setEditingVolunteer(null); setVolName(""); setVolZone("Zone A"); setVolRole("usher"); setVolStatus("available"); setVolContact("");
  };

  // Submit Handlers
  const handleFaqSubmit = (e) => {
    e.preventDefault();
    const synonymsList = faqSynonyms.split(",").map(s => s.trim()).filter(s => s.length > 0);
    saveFaq({
      id: editingFaq ? editingFaq.id : null,
      keyword: faqKeyword, intent: faqIntent, synonyms: synonymsList,
      response: faqResponse, language: faqLanguage, verified: faqVerified,
      source: editingFaq ? editingFaq.source : "manual"
    });
    clearFaqForm();
  };

  const handleGateSubmit = (e) => {
    e.preventDefault();
    saveGate({
      id: editingGate ? editingGate.id : null,
      name: gateName, currentCount: gateCount, capacity: gateCapacity, status: gateStatus
    });
    clearGateForm();
  };

  const handleFacilitySubmit = (e) => {
    e.preventDefault();
    saveFacility({
      id: editingFacility ? editingFacility.id : null,
      name: facName, category: facCategory, description: facDesc, x: facX, y: facY
    });
    clearFacilityForm();
  };

  const handleVolunteerSubmit = (e) => {
    e.preventDefault();
    saveVolunteer({
      id: editingVolunteer ? editingVolunteer.id : null,
      name: volName, zone: volZone, role: volRole, status: volStatus, contactMethod: volContact
    });
    clearVolunteerForm();
  };

  const unverifiedFaqsCount = faqs.filter(f => !f.verified).length;

  return (
    <div className="glass-panel" style={{ padding: "30px", marginBottom: "30px" }}>
      <div style={{ display: "flex", gap: "15px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button onClick={() => setActiveTab("faqs")} className="interactive-btn secondary" style={{ ...tabStyle(activeTab === "faqs") }}>
          <BookOpen size={14} style={{ marginRight: "6px" }} />
          Knowledge Base (FAQs)
          {unverifiedFaqsCount > 0 && (
            <span style={badgeStyle}>{unverifiedFaqsCount} Review</span>
          )}
        </button>
        <button onClick={() => setActiveTab("gates")} className="interactive-btn secondary" style={{ ...tabStyle(activeTab === "gates") }}>
          <Sliders size={14} style={{ marginRight: "6px" }} />
          Gates Configuration
        </button>
        <button onClick={() => setActiveTab("facilities")} className="interactive-btn secondary" style={{ ...tabStyle(activeTab === "facilities") }}>
          <MapPin size={14} style={{ marginRight: "6px" }} />
          Interactive Facilities
        </button>
        <button onClick={() => setActiveTab("volunteers")} className="interactive-btn secondary" style={{ ...tabStyle(activeTab === "volunteers") }}>
          <Users size={14} style={{ marginRight: "6px" }} />
          Volunteers/Crew
        </button>
      </div>

      {/* Tab 1: FAQs EDITOR */}
      {activeTab === "faqs" && (
        <div className="grid-cols-3" style={{ gap: "24px" }}>
          <div style={{ gridColumn: "span 2", overflowX: "auto" }}>
            <table className="custom-table" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>Keyword / synonyms</th>
                  <th>Response</th>
                  <th>Source</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map(faq => (
                  <tr key={faq.id} style={{ background: !faq.verified ? "rgba(168, 85, 247, 0.03)" : "transparent" }}>
                    <td style={{ fontWeight: 600 }}>
                      <div>{faq.keyword}</div>
                      {faq.synonyms && faq.synonyms.length > 0 && (
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>({faq.synonyms.join(", ")})</div>
                      )}
                    </td>
                    <td style={{ color: "var(--text-secondary)", maxWidth: "250px" }}>{faq.response}</td>
                    <td><span className={`badge-status ${faq.source === 'AI-generated' ? 'role-organizer' : 'role-fan'}`} style={{ fontSize: "0.7rem" }}>{faq.source}</span></td>
                    <td>
                      <input type="checkbox" checked={faq.verified} disabled={!isAuthorized} onChange={() => saveFaq({ ...faq, verified: !faq.verified })} style={{ width: "16px", height: "16px", cursor: "pointer" }} aria-label="Toggle FAQ verification status" />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => { setEditingFaq(faq); setFaqKeyword(faq.keyword); setFaqIntent(faq.intent); setFaqSynonyms(faq.synonyms ? faq.synonyms.join(", ") : ""); setFaqResponse(faq.response); setFaqLanguage(faq.language); setFaqVerified(faq.verified); }} className="interactive-btn secondary" style={{ padding: "4px 8px" }} disabled={!isAuthorized} aria-label={`Edit FAQ for ${faq.keyword}`}><Edit size={12} /></button>
                        <button onClick={() => deleteFaq(faq.id)} className="interactive-btn secondary" style={{ padding: "4px 8px", color: "var(--color-rose)" }} disabled={!isAuthorized} aria-label={`Delete FAQ for ${faq.keyword}`}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-panel" style={{ padding: "20px", height: "fit-content" }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-cyan)" }}>{editingFaq ? "Edit FAQ Entry" : "Add FAQ Entry"}</h4>
            <form onSubmit={handleFaqSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="faq-keyword-input" className="input-label">Keyword / Intent</label><input id="faq-keyword-input" type="text" className="form-input" value={faqKeyword} onChange={(e) => setFaqKeyword(e.target.value)} required disabled={!isAuthorized} /></div>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="faq-intent-input" className="input-label">Intent Tag</label><input id="faq-intent-input" type="text" className="form-input" placeholder="e.g. locate_restroom" value={faqIntent} onChange={(e) => setFaqIntent(e.target.value)} required disabled={!isAuthorized} /></div>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="faq-synonyms-input" className="input-label">Synonyms (comma separated)</label><input id="faq-synonyms-input" type="text" className="form-input" placeholder="wc, washroom, toilet" value={faqSynonyms} onChange={(e) => setFaqSynonyms(e.target.value)} disabled={!isAuthorized} /></div>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="faq-response-input" className="input-label">Response Text</label><textarea id="faq-response-input" className="form-input" rows="3" value={faqResponse} onChange={(e) => setFaqResponse(e.target.value)} required disabled={!isAuthorized} /></div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}><label htmlFor="faq-verified-checkbox" style={{ fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><input id="faq-verified-checkbox" type="checkbox" checked={faqVerified} onChange={(e) => setFaqVerified(e.target.checked)} disabled={!isAuthorized} />Approve / Verified FAQ</label></div>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}><button type="submit" className="interactive-btn" style={{ flexGrow: 1 }} disabled={!isAuthorized}>{editingFaq ? "Update Entry" : "Create Entry"}</button>{editingFaq && <button type="button" onClick={clearFaqForm} className="interactive-btn secondary">Cancel</button>}</div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: GATES EDITOR */}
      {activeTab === "gates" && (
        <div className="grid-cols-3" style={{ gap: "24px" }}>
          <div style={{ gridColumn: "span 2", overflowX: "auto" }}>
            <table className="custom-table" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr><th>Gate Name</th><th>Current Count</th><th>Capacity Limit</th><th>Status Load</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {gates.map(gate => (
                  <tr key={gate.id}>
                    <td style={{ fontWeight: 600 }}>{gate.name}</td>
                    <td>{gate.currentCount}</td>
                    <td>{gate.capacity}</td>
                    <td><span className={`badge-status badge-${gate.status.toLowerCase()}`}>{gate.status}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => { setEditingGate(gate); setGateName(gate.name); setGateCount(gate.currentCount); setGateCapacity(gate.capacity); setGateStatus(gate.status); }} className="interactive-btn secondary" style={{ padding: "4px 8px" }} disabled={!isAuthorized} aria-label={`Edit gate ${gate.name}`}><Edit size={12} /></button>
                        <button onClick={() => deleteGate(gate.id)} className="interactive-btn secondary" style={{ padding: "4px 8px", color: "var(--color-rose)" }} disabled={!isAuthorized} aria-label={`Delete gate ${gate.name}`}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-panel" style={{ padding: "20px", height: "fit-content" }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-cyan)" }}>{editingGate ? "Edit Gate" : "Add Gate"}</h4>
            <form onSubmit={handleGateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="gate-name-input" className="input-label">Gate Name</label><input id="gate-name-input" type="text" className="form-input" value={gateName} onChange={(e) => setGateName(e.target.value)} required disabled={!isAuthorized} /></div>
              <div className="grid-cols-2" style={{ gap: "10px" }}>
                <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="gate-count-input" className="input-label">Current Count</label><input id="gate-count-input" type="number" className="form-input" value={gateCount} onChange={(e) => setGateCount(parseInt(e.target.value))} required disabled={!isAuthorized} /></div>
                <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="gate-capacity-input" className="input-label">Max Capacity</label><input id="gate-capacity-input" type="number" className="form-input" value={gateCapacity} onChange={(e) => setGateCapacity(parseInt(e.target.value))} required disabled={!isAuthorized} /></div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="gate-status-select" className="input-label">Load Status</label><select id="gate-status-select" className="form-input" value={gateStatus} onChange={(e) => setGateStatus(e.target.value)} disabled={!isAuthorized}><option value="Low">Low Load</option><option value="Medium">Medium Load</option><option value="High">High Load</option></select></div>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}><button type="submit" className="interactive-btn" style={{ flexGrow: 1 }} disabled={!isAuthorized}>{editingGate ? "Update Gate" : "Create Gate"}</button>{editingGate && <button type="button" onClick={clearGateForm} className="interactive-btn secondary">Cancel</button>}</div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: FACILITIES EDITOR */}
      {activeTab === "facilities" && (
        <div className="grid-cols-3" style={{ gap: "24px" }}>
          <div style={{ gridColumn: "span 2", overflowX: "auto" }}>
            <table className="custom-table" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr><th>Facility Name</th><th>Category</th><th>Description</th><th>Coordinates (x, y)</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {facilities.map(fac => (
                  <tr key={fac.id}>
                    <td style={{ fontWeight: 600 }}>{fac.name}</td>
                    <td style={{ textTransform: "capitalize" }}>{fac.category}</td>
                    <td style={{ color: "var(--text-secondary)", maxWidth: "200px" }}>{fac.description}</td>
                    <td>({fac.x}%, {fac.y}%)</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => { setEditingFacility(fac); setFacName(fac.name); setFacCategory(fac.category); setFacDesc(fac.description); setFacX(fac.x); setFacY(fac.y); }} className="interactive-btn secondary" style={{ padding: "4px 8px" }} disabled={!isAuthorized} aria-label={`Edit facility ${fac.name}`}><Edit size={12} /></button>
                        <button onClick={() => deleteFacility(fac.id)} className="interactive-btn secondary" style={{ padding: "4px 8px", color: "var(--color-rose)" }} disabled={!isAuthorized} aria-label={`Delete facility ${fac.name}`}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-panel" style={{ padding: "20px", height: "fit-content" }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-cyan)" }}>{editingFacility ? "Edit Facility" : "Add Facility"}</h4>
            <form onSubmit={handleFacilitySubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="facility-name-input" className="input-label">Facility Name</label><input id="facility-name-input" type="text" className="form-input" value={facName} onChange={(e) => setFacName(e.target.value)} required disabled={!isAuthorized} /></div>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="facility-category-select" className="input-label">Category</label><select id="facility-category-select" className="form-input" value={facCategory} onChange={(e) => setFacCategory(e.target.value)} disabled={!isAuthorized}><option value="concession">Concession / Food & Drink</option><option value="restroom">Washrooms (WC)</option><option value="medical">First Aid Outpost</option><option value="info">Help Hub Desk</option></select></div>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="facility-desc-input" className="input-label">Description</label><textarea id="facility-desc-input" className="form-input" rows="2" value={facDesc} onChange={(e) => setFacDesc(e.target.value)} required disabled={!isAuthorized} /></div>
              <div className="grid-cols-2" style={{ gap: "10px" }}>
                <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="facility-x-input" className="input-label">Map Position X (0-100%)</label><input id="facility-x-input" type="number" className="form-input" min="0" max="100" step="0.1" value={facX} onChange={(e) => setFacX(parseFloat(e.target.value))} required disabled={!isAuthorized} /></div>
                <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="facility-y-input" className="input-label">Map Position Y (0-100%)</label><input id="facility-y-input" type="number" className="form-input" min="0" max="100" step="0.1" value={facY} onChange={(e) => setFacY(parseFloat(e.target.value))} required disabled={!isAuthorized} /></div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}><button type="submit" className="interactive-btn" style={{ flexGrow: 1 }} disabled={!isAuthorized}>{editingFacility ? "Update Facility" : "Create Facility"}</button>{editingFacility && <button type="button" onClick={clearFacilityForm} className="interactive-btn secondary">Cancel</button>}</div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: VOLUNTEERS EDITOR */}
      {activeTab === "volunteers" && (
        <div className="grid-cols-3" style={{ gap: "24px" }}>
          <div style={{ gridColumn: "span 2", overflowX: "auto" }}>
            <table className="custom-table" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr><th>Volunteer Name</th><th>Zone</th><th>Assigned Role</th><th>Status</th><th>Contact channel</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {volunteers.map(vol => (
                  <tr key={vol.id}>
                    <td style={{ fontWeight: 600 }}>{vol.name}</td>
                    <td>{vol.zone}</td>
                    <td style={{ textTransform: "capitalize" }}>{vol.role}</td>
                    <td><span className={`badge-status ${vol.status === 'available' ? 'badge-resolved' : 'badge-high'}`}>{vol.status}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{vol.contactMethod}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => { setEditingVolunteer(vol); setVolName(vol.name); setVolZone(vol.zone); setVolRole(vol.role); setVolStatus(vol.status); setVolContact(vol.contactMethod); }} className="interactive-btn secondary" style={{ padding: "4px 8px" }} disabled={!isAuthorized} aria-label={`Edit volunteer ${vol.name}`}><Edit size={12} /></button>
                        <button onClick={() => deleteVolunteer(vol.id)} className="interactive-btn secondary" style={{ padding: "4px 8px", color: "var(--color-rose)" }} disabled={!isAuthorized} aria-label={`Delete volunteer ${vol.name}`}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-panel" style={{ padding: "20px", height: "fit-content" }}>
            <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-cyan)" }}>{editingVolunteer ? "Edit Volunteer" : "Add Volunteer"}</h4>
            <form onSubmit={handleVolunteerSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="volunteer-name-input" className="input-label">Volunteer Name</label><input id="volunteer-name-input" type="text" className="form-input" value={volName} onChange={(e) => setVolName(e.target.value)} required disabled={!isAuthorized} /></div>
              <div className="grid-cols-2" style={{ gap: "10px" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="volunteer-zone-select" className="input-label">Assigned Zone</label>
                  <select id="volunteer-zone-select" className="form-input" value={volZone} onChange={(e) => setVolZone(e.target.value)} disabled={!isAuthorized}><option value="Zone A">Zone A</option><option value="Zone B">Zone B</option><option value="Zone C">Zone C</option><option value="Zone D">Zone D</option><option value="Zone E">Zone E</option></select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="volunteer-role-select" className="input-label">Role</label>
                  <select id="volunteer-role-select" className="form-input" value={volRole} onChange={(e) => setVolRole(e.target.value)} disabled={!isAuthorized}><option value="usher">Usher</option><option value="security">Security Officer</option><option value="medical">Medical First Aider</option><option value="maintenance">Maintenance/Janitor</option></select>
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="volunteer-status-select" className="input-label">Availablity Status</label>
                <select id="volunteer-status-select" className="form-input" value={volStatus} onChange={(e) => setVolStatus(e.target.value)} disabled={!isAuthorized}><option value="available">Available (Free)</option><option value="busy">Busy (Assigned)</option></select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}><label htmlFor="volunteer-contact-input" className="input-label">Contact Channel / Method</label><input id="volunteer-contact-input" type="text" className="form-input" placeholder="e.g. Radio Channel 2" value={volContact} onChange={(e) => setVolContact(e.target.value)} required disabled={!isAuthorized} /></div>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}><button type="submit" className="interactive-btn" style={{ flexGrow: 1 }} disabled={!isAuthorized}>{editingVolunteer ? "Update Volunteer" : "Create Volunteer"}</button>{editingVolunteer && <button type="button" onClick={clearVolunteerForm} className="interactive-btn secondary">Cancel</button>}</div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const tabStyle = (isActive) => ({
  padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px",
  background: isActive ? "rgba(6, 182, 212, 0.15)" : "transparent",
  borderColor: isActive ? "var(--color-cyan)" : "transparent",
  color: isActive ? "var(--color-cyan)" : "var(--text-secondary)"
});

const badgeStyle = {
  marginLeft: "6px", background: "var(--color-rose)", color: "#fff",
  padding: "1px 6px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 700
};
