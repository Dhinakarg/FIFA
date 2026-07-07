import React, { useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { 
  Shield, 
  Database, 
  Radio, 
  Terminal, 
  AlertOctagon, 
  UserPlus, 
  Edit, 
  Trash2, 
  Check, 
  Plus, 
  MapPin, 
  Sliders, 
  BookOpen, 
  Users, 
  UserCheck 
} from "lucide-react";
import StatCard from "../components/StatCard";

export default function AdminPanel() {
  const { 
    userRole, 
    setUserRole, 
    systemLogs, 
    seedTestData, 
    reportIncident,
    faqs,
    saveFaq,
    deleteFaq,
    facilities,
    saveFacility,
    deleteFacility,
    gates,
    saveGate,
    deleteGate,
    volunteers,
    saveVolunteer,
    deleteVolunteer,
    currentUser,
    loginWithEmail,
    registerWithEmail,
    logout,
    isFirebaseActive 
  } = useAppState();

  const [activeTab, setActiveTab] = useState("faqs");

  // Auth Form State
  const [authTab, setAuthTab] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authRole, setAuthRole] = useState("staff");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

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

  const handleRoleChange = (role) => {
    setUserRole(role);
  };

  const handleQuickIncident = () => {
    const titles = ["Spill at Gate B Entrance", "Damaged seat row 4", "Restroom cleanup required", "Suspicious bag Zone D"];
    const locs = ["Gate B Entrance", "Zone C (Seating)", "North Plaza Washrooms", "Zone D (Seating)"];
    const types = ["maintenance", "facility", "maintenance", "security"];
    const idx = Math.floor(Math.random() * titles.length);
    reportIncident(titles[idx], "Auto-generated test alert for developer checking.", types[idx], locs[idx], "System Tester", "High");
  };

  // FAQ CRUD Actions
  const startFaqEdit = (faq) => {
    setEditingFaq(faq);
    setFaqKeyword(faq.keyword);
    setFaqIntent(faq.intent);
    setFaqSynonyms(faq.synonyms ? faq.synonyms.join(", ") : "");
    setFaqResponse(faq.response);
    setFaqLanguage(faq.language);
    setFaqVerified(faq.verified);
  };

  const clearFaqForm = () => {
    setEditingFaq(null);
    setFaqKeyword("");
    setFaqIntent("");
    setFaqSynonyms("");
    setFaqResponse("");
    setFaqLanguage("en");
    setFaqVerified(true);
  };

  const handleFaqSubmit = (e) => {
    e.preventDefault();
    const synonymsList = faqSynonyms.split(",").map(s => s.trim()).filter(s => s.length > 0);
    saveFaq({
      id: editingFaq ? editingFaq.id : null,
      keyword: faqKeyword,
      intent: faqIntent,
      synonyms: synonymsList,
      response: faqResponse,
      language: faqLanguage,
      verified: faqVerified,
      source: editingFaq ? editingFaq.source : "manual"
    });
    clearFaqForm();
  };

  // Gate CRUD Actions
  const startGateEdit = (gate) => {
    setEditingGate(gate);
    setGateName(gate.name);
    setGateCount(gate.currentCount);
    setGateCapacity(gate.capacity);
    setGateStatus(gate.status);
  };

  const clearGateForm = () => {
    setEditingGate(null);
    setGateName("");
    setGateCount(0);
    setGateCapacity(1000);
    setGateStatus("Low");
  };

  const handleGateSubmit = (e) => {
    e.preventDefault();
    saveGate({
      id: editingGate ? editingGate.id : null,
      name: gateName,
      currentCount: gateCount,
      capacity: gateCapacity,
      status: gateStatus
    });
    clearGateForm();
  };

  // Facility CRUD Actions
  const startFacilityEdit = (fac) => {
    setEditingFacility(fac);
    setFacName(fac.name);
    setFacCategory(fac.category);
    setFacDesc(fac.description);
    setFacX(fac.x);
    setFacY(fac.y);
  };

  const clearFacilityForm = () => {
    setEditingFacility(null);
    setFacName("");
    setFacCategory("concession");
    setFacDesc("");
    setFacX(50);
    setFacY(50);
  };

  const handleFacilitySubmit = (e) => {
    e.preventDefault();
    saveFacility({
      id: editingFacility ? editingFacility.id : null,
      name: facName,
      category: facCategory,
      description: facDesc,
      x: facX,
      y: facY
    });
    clearFacilityForm();
  };

  // Volunteer CRUD Actions
  const startVolunteerEdit = (vol) => {
    setEditingVolunteer(vol);
    setVolName(vol.name);
    setVolZone(vol.zone);
    setVolRole(vol.role);
    setVolStatus(vol.status);
    setVolContact(vol.contactMethod);
  };

  const clearVolunteerForm = () => {
    setEditingVolunteer(null);
    setVolName("");
    setVolZone("Zone A");
    setVolRole("usher");
    setVolStatus("available");
    setVolContact("");
  };

  const handleVolunteerSubmit = (e) => {
    e.preventDefault();
    saveVolunteer({
      id: editingVolunteer ? editingVolunteer.id : null,
      name: volName,
      zone: volZone,
      role: volRole,
      status: volStatus,
      contactMethod: volContact
    });
    clearVolunteerForm();
  };

  const isAuthorized = userRole === "admin" || userRole === "staff";
  const unverifiedFaqsCount = faqs.filter(f => !f.verified).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Developer & Admin Control Panel</h1>
        <p className="page-description">Configure database parameters, verify AI knowledge bases, and simulate user security scopes.</p>
      </div>

      {!isAuthorized && (
        <div className="global-alert" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid var(--color-amber)", color: "var(--color-amber)", padding: "12px 18px", marginBottom: "24px" }}>
          <span>⚠️ Viewing in <strong>Fan Read-Only mode</strong>. Switch roles to <strong>Admin</strong> or <strong>Staff</strong> below to write parameters.</span>
        </div>
      )}

      <div className="grid-cols-2" style={{ gap: "30px", marginBottom: "30px" }}>
        {/* Firebase Authentication Card */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
            <UserCheck size={18} />
            Firebase Account Authentication
          </h3>

          {currentUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "12px", borderRadius: "8px", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--color-emerald)", fontWeight: 700, display: "block", marginBottom: "4px" }}>
                  ● Authenticated Account
                </span>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
                  <span style={{ color: "var(--text-muted)" }}>Email:</span>
                  <span style={{ fontWeight: 600 }}>{currentUser.email}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
                  <span style={{ color: "var(--text-muted)" }}>Account Role:</span>
                  <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{currentUser.role}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
                  <span style={{ color: "var(--text-muted)" }}>UID:</span>
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>{currentUser.uid.slice(0, 10)}...</span>
                </div>
              </div>
              <button 
                onClick={async () => {
                  await logout();
                  setAuthSuccess("Logged out successfully.");
                  setTimeout(() => setAuthSuccess(""), 3000);
                }} 
                className="interactive-btn danger" 
                style={{ width: "100%", padding: "10px" }}
              >
                Sign Out Session
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "10px", marginBottom: "14px" }}>
                <button 
                  onClick={() => { setAuthTab("signin"); setAuthError(""); }}
                  className="interactive-btn secondary"
                  style={{
                    flexGrow: 1,
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    borderRadius: "6px",
                    background: authTab === "signin" ? "rgba(6, 182, 212, 0.15)" : "transparent",
                    borderColor: authTab === "signin" ? "var(--color-cyan)" : "transparent",
                    color: authTab === "signin" ? "var(--color-cyan)" : "var(--text-secondary)"
                  }}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setAuthTab("signup"); setAuthError(""); }}
                  className="interactive-btn secondary"
                  style={{
                    flexGrow: 1,
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    borderRadius: "6px",
                    background: authTab === "signup" ? "rgba(6, 182, 212, 0.15)" : "transparent",
                    borderColor: authTab === "signup" ? "var(--color-cyan)" : "transparent",
                    color: authTab === "signup" ? "var(--color-cyan)" : "var(--text-secondary)"
                  }}
                >
                  Register
                </button>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAuthError("");
                  setAuthSuccess("");
                  setAuthLoading(true);
                  try {
                    if (authTab === "signin") {
                      await loginWithEmail(authEmail, authPassword);
                      setAuthSuccess("Sign in successful!");
                    } else {
                      await registerWithEmail(authEmail, authPassword, authRole);
                      setAuthSuccess("Registration successful!");
                    }
                    setAuthEmail("");
                    setAuthPassword("");
                  } catch (err) {
                    setAuthError(err.message || "Authentication failed. Check credentials.");
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ marginBottom: "4px" }}>Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="name@stadium.com"
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)} 
                    required 
                    style={{ padding: "8px 12px" }}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ marginBottom: "4px" }}>Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="••••••••"
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)} 
                    required 
                    style={{ padding: "8px 12px" }}
                  />
                </div>

                {authTab === "signup" && (
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ marginBottom: "4px" }}>Assigned Account Role</label>
                    <select 
                      className="form-input" 
                      value={authRole} 
                      onChange={(e) => setAuthRole(e.target.value)}
                      style={{ padding: "8px 12px" }}
                    >
                      <option value="fan">Fan (Read Only)</option>
                      <option value="staff">Staff (Incident Dispatcher)</option>
                      <option value="organizer">Organizer (Event Console)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>
                )}

                {authError && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-rose)", marginTop: "4px" }}>
                    ❌ {authError}
                  </span>
                )}

                {authSuccess && (
                  <span style={{ fontSize: "0.75rem", color: "var(--color-emerald)", marginTop: "4px" }}>
                    ✅ {authSuccess}
                  </span>
                )}

                <button 
                  type="submit" 
                  className="interactive-btn" 
                  disabled={authLoading}
                  style={{ width: "100%", padding: "10px", marginTop: "6px" }}
                >
                  {authLoading ? "Verifying..." : authTab === "signin" ? "Sign In" : "Register Profile"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* User Role Simulation */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-cyan)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Radio size={18} />
            Simulate User Roles (Overrider)
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
            Swap active session scopes on-the-fly to test conditional panel overlays:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {["fan", "staff", "organizer", "admin"].map(role => (
              <label 
                key={role} 
                className="glass-panel glow-cyan-hover"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  padding: "12px 16px", 
                  cursor: "pointer",
                  background: userRole === role ? "rgba(37, 99, 235, 0.1)" : "rgba(255, 255, 255, 0.01)",
                  borderColor: userRole === role ? "var(--color-cyan)" : "var(--border-glass)"
                }}
              >
                <input 
                  type="radio" 
                  name="user-role" 
                  value={role} 
                  checked={userRole === role} 
                  onChange={() => handleRoleChange(role)}
                  style={{ cursor: "pointer" }}
                />
                <div>
                  <span style={{ textTransform: "capitalize", fontWeight: 600, display: "block" }}>{role} Role</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {role === "fan" && "Read wait times, file cleanups"}
                    {role === "staff" && "Acknowledge / resolve incidents, edit knowledge base"}
                    {role === "organizer" && "Manage event details, open/close ingress gates"}
                    {role === "admin" && "Access all consoles & override database grids"}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-cols-2" style={{ gap: "30px", marginBottom: "30px" }}>
        {/* Database Simulation Panel */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-purple)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Database size={18} />
            Mock Database Controllers
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
            Generate random telemetry events or reset mock tables:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button onClick={handleQuickIncident} className="interactive-btn" style={{ width: "100%" }}>
              <UserPlus size={16} style={{ marginRight: "4px" }} />
              Trigger Mock Incident Report
            </button>

            <button onClick={seedTestData} className="interactive-btn secondary" style={{ width: "100%" }}>
              Reset Database Seeder
            </button>
          </div>
        </div>

        {/* Environment Telemetry */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sliders size={18} />
            Active SDK Environment
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "20px" }}>
            Check backend bindings and network routing active status:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>Firebase Sync:</span>
              <span style={{ fontWeight: 600, color: isFirebaseActive ? "var(--color-emerald)" : "var(--color-amber)" }}>
                {isFirebaseActive ? "CONNECTED (Firestore)" : "SIMULATION Fallback"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-glass)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>Gemini AI Router:</span>
              <span style={{ fontWeight: 600 }}>Cloud Functions isolation</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
              <span style={{ color: "var(--text-muted)" }}>Auto-Approval:</span>
              <span style={{ fontWeight: 600, color: "var(--color-amber)" }}>Admin approval required</span>
            </div>
          </div>
        </div>
      </div>

      {/* CRUD DATABASE EDITOR TABS */}
      <div className="glass-panel" style={{ padding: "30px", marginBottom: "30px" }}>
        <div style={{ display: "flex", gap: "15px", borderBottom: "1px solid var(--border-glass)", paddingBottom: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button 
            onClick={() => setActiveTab("faqs")} 
            className="interactive-btn secondary"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
              borderRadius: "8px",
              background: activeTab === "faqs" ? "rgba(6, 182, 212, 0.15)" : "transparent",
              borderColor: activeTab === "faqs" ? "var(--color-cyan)" : "transparent",
              color: activeTab === "faqs" ? "var(--color-cyan)" : "var(--text-secondary)"
            }}
          >
            <BookOpen size={14} style={{ marginRight: "6px" }} />
            Knowledge Base (FAQs)
            {unverifiedFaqsCount > 0 && (
              <span style={{ marginLeft: "6px", background: "var(--color-rose)", color: "#fff", padding: "1px 6px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 700 }}>
                {unverifiedFaqsCount} Review
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab("gates")} 
            className="interactive-btn secondary"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
              borderRadius: "8px",
              background: activeTab === "gates" ? "rgba(6, 182, 212, 0.15)" : "transparent",
              borderColor: activeTab === "gates" ? "var(--color-cyan)" : "transparent",
              color: activeTab === "gates" ? "var(--color-cyan)" : "var(--text-secondary)"
            }}
          >
            <Sliders size={14} style={{ marginRight: "6px" }} />
            Gates Configuration
          </button>
          <button 
            onClick={() => setActiveTab("facilities")} 
            className="interactive-btn secondary"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
              borderRadius: "8px",
              background: activeTab === "facilities" ? "rgba(6, 182, 212, 0.15)" : "transparent",
              borderColor: activeTab === "facilities" ? "var(--color-cyan)" : "transparent",
              color: activeTab === "facilities" ? "var(--color-cyan)" : "var(--text-secondary)"
            }}
          >
            <MapPin size={14} style={{ marginRight: "6px" }} />
            Interactive Facilities
          </button>
          <button 
            onClick={() => setActiveTab("volunteers")} 
            className="interactive-btn secondary"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
              borderRadius: "8px",
              background: activeTab === "volunteers" ? "rgba(6, 182, 212, 0.15)" : "transparent",
              borderColor: activeTab === "volunteers" ? "var(--color-cyan)" : "transparent",
              color: activeTab === "volunteers" ? "var(--color-cyan)" : "var(--text-secondary)"
            }}
          >
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
                    <tr 
                      key={faq.id}
                      style={{ 
                        background: !faq.verified ? "rgba(168, 85, 247, 0.03)" : "transparent"
                      }}
                    >
                      <td style={{ fontWeight: 600 }}>
                        <div>{faq.keyword}</div>
                        {faq.synonyms && faq.synonyms.length > 0 && (
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            ({faq.synonyms.join(", ")})
                          </div>
                        )}
                      </td>
                      <td style={{ color: "var(--text-secondary)", maxWidth: "250px" }}>{faq.response}</td>
                      <td>
                        <span className={`badge-status ${faq.source === 'AI-generated' ? 'role-organizer' : 'role-fan'}`} style={{ fontSize: "0.7rem" }}>
                          {faq.source}
                        </span>
                      </td>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={faq.verified} 
                          disabled={!isAuthorized}
                          onChange={() => saveFaq({ ...faq, verified: !faq.verified })}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button 
                            onClick={() => startFaqEdit(faq)} 
                            className="interactive-btn secondary" 
                            style={{ padding: "4px 8px" }}
                            disabled={!isAuthorized}
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => deleteFaq(faq.id)} 
                            className="interactive-btn secondary" 
                            style={{ padding: "4px 8px", color: "var(--color-rose)" }}
                            disabled={!isAuthorized}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FAQs Form */}
            <div className="glass-panel" style={{ padding: "20px", height: "fit-content" }}>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-cyan)" }}>
                {editingFaq ? "Edit FAQ Entry" : "Add FAQ Entry"}
              </h4>
              <form onSubmit={handleFaqSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Keyword / Intent</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={faqKeyword} 
                    onChange={(e) => setFaqKeyword(e.target.value)} 
                    required 
                    disabled={!isAuthorized}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Intent Tag</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. locate_restroom"
                    value={faqIntent} 
                    onChange={(e) => setFaqIntent(e.target.value)} 
                    required 
                    disabled={!isAuthorized}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Synonyms (comma separated)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="wc, washroom, toilet"
                    value={faqSynonyms} 
                    onChange={(e) => setFaqSynonyms(e.target.value)} 
                    disabled={!isAuthorized}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Response Text</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    value={faqResponse} 
                    onChange={(e) => setFaqResponse(e.target.value)} 
                    required 
                    disabled={!isAuthorized}
                  />
                </div>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <label style={{ fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    <input 
                      type="checkbox" 
                      checked={faqVerified} 
                      onChange={(e) => setFaqVerified(e.target.checked)} 
                      disabled={!isAuthorized}
                    />
                    Approve / Verified FAQ
                  </label>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button type="submit" className="interactive-btn" style={{ flexGrow: 1 }} disabled={!isAuthorized}>
                    {editingFaq ? "Update Entry" : "Create Entry"}
                  </button>
                  {editingFaq && (
                    <button type="button" onClick={clearFaqForm} className="interactive-btn secondary">
                      Cancel
                    </button>
                  )}
                </div>
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
                  <tr>
                    <th>Gate Name</th>
                    <th>Current Count</th>
                    <th>Capacity Limit</th>
                    <th>Status Load</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gates.map(gate => (
                    <tr key={gate.id}>
                      <td style={{ fontWeight: 600 }}>{gate.name}</td>
                      <td>{gate.currentCount}</td>
                      <td>{gate.capacity}</td>
                      <td>
                        <span className={`badge-status badge-${gate.status.toLowerCase()}`}>
                          {gate.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button 
                            onClick={() => startGateEdit(gate)} 
                            className="interactive-btn secondary" 
                            style={{ padding: "4px 8px" }}
                            disabled={!isAuthorized}
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => deleteGate(gate.id)} 
                            className="interactive-btn secondary" 
                            style={{ padding: "4px 8px", color: "var(--color-rose)" }}
                            disabled={!isAuthorized}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Gates Form */}
            <div className="glass-panel" style={{ padding: "20px", height: "fit-content" }}>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-cyan)" }}>
                {editingGate ? "Edit Gate" : "Add Gate"}
              </h4>
              <form onSubmit={handleGateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Gate Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={gateName} 
                    onChange={(e) => setGateName(e.target.value)} 
                    required 
                    disabled={!isAuthorized}
                  />
                </div>
                <div className="grid-cols-2" style={{ gap: "10px" }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Current Count</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={gateCount} 
                      onChange={(e) => setGateCount(parseInt(e.target.value))} 
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Max Capacity</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={gateCapacity} 
                      onChange={(e) => setGateCapacity(parseInt(e.target.value))} 
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Load Status</label>
                  <select 
                    className="form-input" 
                    value={gateStatus} 
                    onChange={(e) => setGateStatus(e.target.value)}
                    disabled={!isAuthorized}
                  >
                    <option value="Low">Low Load</option>
                    <option value="Medium">Medium Load</option>
                    <option value="High">High Load</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button type="submit" className="interactive-btn" style={{ flexGrow: 1 }} disabled={!isAuthorized}>
                    {editingGate ? "Update Gate" : "Create Gate"}
                  </button>
                  {editingGate && (
                    <button type="button" onClick={clearGateForm} className="interactive-btn secondary">
                      Cancel
                    </button>
                  )}
                </div>
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
                  <tr>
                    <th>Facility Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Coordinates (x, y)</th>
                    <th>Actions</th>
                  </tr>
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
                          <button 
                            onClick={() => startFacilityEdit(fac)} 
                            className="interactive-btn secondary" 
                            style={{ padding: "4px 8px" }}
                            disabled={!isAuthorized}
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => deleteFacility(fac.id)} 
                            className="interactive-btn secondary" 
                            style={{ padding: "4px 8px", color: "var(--color-rose)" }}
                            disabled={!isAuthorized}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Facilities Form */}
            <div className="glass-panel" style={{ padding: "20px", height: "fit-content" }}>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-cyan)" }}>
                {editingFacility ? "Edit Facility" : "Add Facility"}
              </h4>
              <form onSubmit={handleFacilitySubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Facility Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={facName} 
                    onChange={(e) => setFacName(e.target.value)} 
                    required 
                    disabled={!isAuthorized}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Category</label>
                  <select 
                    className="form-input" 
                    value={facCategory} 
                    onChange={(e) => setFacCategory(e.target.value)}
                    disabled={!isAuthorized}
                  >
                    <option value="concession">Concession / Food & Drink</option>
                    <option value="restroom">Washrooms (WC)</option>
                    <option value="medical">First Aid Outpost</option>
                    <option value="info">Help Hub Desk</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Description</label>
                  <textarea 
                    className="form-input" 
                    rows="2" 
                    value={facDesc} 
                    onChange={(e) => setFacDesc(e.target.value)} 
                    required 
                    disabled={!isAuthorized}
                  />
                </div>
                <div className="grid-cols-2" style={{ gap: "10px" }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Map Position X (0-100%)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0" max="100" step="0.1"
                      value={facX} 
                      onChange={(e) => setFacX(parseFloat(e.target.value))} 
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Map Position Y (0-100%)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      min="0" max="100" step="0.1"
                      value={facY} 
                      onChange={(e) => setFacY(parseFloat(e.target.value))} 
                      required 
                      disabled={!isAuthorized}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button type="submit" className="interactive-btn" style={{ flexGrow: 1 }} disabled={!isAuthorized}>
                    {editingFacility ? "Update Facility" : "Create Facility"}
                  </button>
                  {editingFacility && (
                    <button type="button" onClick={clearFacilityForm} className="interactive-btn secondary">
                      Cancel
                    </button>
                  )}
                </div>
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
                  <tr>
                    <th>Volunteer Name</th>
                    <th>Zone</th>
                    <th>Assigned Role</th>
                    <th>Status</th>
                    <th>Contact channel</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(vol => (
                    <tr key={vol.id}>
                      <td style={{ fontWeight: 600 }}>{vol.name}</td>
                      <td>{vol.zone}</td>
                      <td style={{ textTransform: "capitalize" }}>{vol.role}</td>
                      <td>
                        <span className={`badge-status ${vol.status === 'available' ? 'badge-resolved' : 'badge-high'}`}>
                          {vol.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{vol.contactMethod}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button 
                            onClick={() => startVolunteerEdit(vol)} 
                            className="interactive-btn secondary" 
                            style={{ padding: "4px 8px" }}
                            disabled={!isAuthorized}
                          >
                            <Edit size={12} />
                          </button>
                          <button 
                            onClick={() => deleteVolunteer(vol.id)} 
                            className="interactive-btn secondary" 
                            style={{ padding: "4px 8px", color: "var(--color-rose)" }}
                            disabled={!isAuthorized}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Volunteers Form */}
            <div className="glass-panel" style={{ padding: "20px", height: "fit-content" }}>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "var(--color-cyan)" }}>
                {editingVolunteer ? "Edit Volunteer" : "Add Volunteer"}
              </h4>
              <form onSubmit={handleVolunteerSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Volunteer Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={volName} 
                    onChange={(e) => setVolName(e.target.value)} 
                    required 
                    disabled={!isAuthorized}
                  />
                </div>
                <div className="grid-cols-2" style={{ gap: "10px" }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Assigned Zone</label>
                    <select 
                      className="form-input" 
                      value={volZone} 
                      onChange={(e) => setVolZone(e.target.value)}
                      disabled={!isAuthorized}
                    >
                      <option value="Zone A">Zone A</option>
                      <option value="Zone B">Zone B</option>
                      <option value="Zone C">Zone C</option>
                      <option value="Zone D">Zone D</option>
                      <option value="Zone E">Zone E</option>
                    </select>
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Role</label>
                    <select 
                      className="form-input" 
                      value={volRole} 
                      onChange={(e) => setVolRole(e.target.value)}
                      disabled={!isAuthorized}
                    >
                      <option value="usher">Usher</option>
                      <option value="security-assistant">Security Crew</option>
                      <option value="medical-responder">Medic Squad</option>
                    </select>
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Availability Status</label>
                  <select 
                    className="form-input" 
                    value={volStatus} 
                    onChange={(e) => setVolStatus(e.target.value)}
                    disabled={!isAuthorized}
                  >
                    <option value="available">Available (Active)</option>
                    <option value="busy">Busy (Engaged)</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Contact Method</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Radio Ch 3 / WhatsApp"
                    value={volContact} 
                    onChange={(e) => setVolContact(e.target.value)} 
                    required 
                    disabled={!isAuthorized}
                  />
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button type="submit" className="interactive-btn" style={{ flexGrow: 1 }} disabled={!isAuthorized}>
                    {editingVolunteer ? "Update Volunteer" : "Create Volunteer"}
                  </button>
                  {editingVolunteer && (
                    <button type="button" onClick={clearVolunteerForm} className="interactive-btn secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Live System Log Console */}
      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-rose)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Terminal size={18} />
          Telemetry Live Auditing Logs
        </h3>
        
        <div style={{ 
          background: "rgba(10, 14, 26, 0.9)", 
          fontFamily: "monospace", 
          padding: "16px", 
          borderRadius: "8px", 
          maxHeight: "180px", 
          overflowY: "auto",
          fontSize: "0.85rem",
          color: "rgba(255,255,255,0.85)"
        }}>
          {systemLogs.map((log, idx) => (
            <div key={idx} style={{ padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
              <span style={{ color: "var(--color-cyan)", marginRight: "8px" }}>[{log.time}]</span>
              <span>{log.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
