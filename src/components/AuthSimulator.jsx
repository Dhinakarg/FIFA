import React, { useState } from "react";
import { UserCheck, Database } from "lucide-react";

/**
 * AuthSimulator component mimicking signin, signup and authentication 
 * sessions either against remote Firebase or offline local simulated profiles.
 * 
 * @param {Object} props
 * @param {Object|null} props.currentUser - Active logged-in user profile
 * @param {Function} props.loginWithEmail - Authentication login handler
 * @param {Function} props.registerWithEmail - Registration helper mapping roles
 * @param {Function} props.logout - Log out current session trigger callback
 * @param {boolean} props.isFirebaseActive - Active Firebase sync indicator
 */
export function AuthSimulator({ currentUser, loginWithEmail, registerWithEmail, logout, isFirebaseActive }) {
  const [authTab, setAuthTab] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authRole, setAuthRole] = useState("staff");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      if (authTab === "signin") {
        await loginWithEmail(authEmail, authPassword);
        setAuthSuccess("Successfully authenticated via Firebase!");
      } else {
        await registerWithEmail(authEmail, authPassword, authRole);
        setAuthSuccess(`Successfully registered as ${authRole.toUpperCase()}!`);
      }
      setAuthEmail("");
      setAuthPassword("");
    } catch (err) {
      console.error(err);
      setAuthError(err.message || "Authentication failed. Check configs.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", marginBottom: "30px" }}>
      <h3 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "8px" }}>
        <UserCheck size={20} />
        Firebase Authentication Simulator
      </h3>
      
      {!isFirebaseActive ? (
        <div style={{ display: "flex", alignItems: "start", gap: "8px", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2)", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", color: "var(--color-amber)" }}>
          <Database size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
          <div>
            <strong>Firebase Offline Mode</strong>: Authentication routes are mocked locally. Logins will bypass remote API checks and authorize instantly with preloaded test credentials.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "10px", borderRadius: "8px", fontSize: "0.8rem", color: "var(--color-emerald)", marginBottom: "16px" }}>
          <span>● Firebase Remote Service Connected</span>
        </div>
      )}

      {currentUser ? (
        <div style={{ marginTop: "16px" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Authenticated User:</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, margin: "2px 0" }}>{currentUser.email}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Firebase UID: {currentUser.uid} | Role Profile: <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{currentUser.role || "fan"}</span></div>
          </div>
          <button onClick={logout} className="interactive-btn secondary" style={{ width: "100%", marginTop: "12px", padding: "8px" }}>
            Sign Out Simulated User
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--border-glass)", marginBottom: "16px" }}>
            <button 
              onClick={() => { setAuthTab("signin"); setAuthError(""); setAuthSuccess(""); }} 
              style={{ background: "none", border: "none", color: authTab === "signin" ? "var(--color-cyan)" : "var(--text-secondary)", borderBottom: authTab === "signin" ? "2px solid var(--color-cyan)" : "none", padding: "8px 16px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setAuthTab("signup"); setAuthError(""); setAuthSuccess(""); }} 
              style={{ background: "none", border: "none", color: authTab === "signup" ? "var(--color-cyan)" : "var(--text-secondary)", borderBottom: authTab === "signup" ? "2px solid var(--color-cyan)" : "none", padding: "8px 16px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
            >
              Simulate Registration
            </button>
          </div>

          {authError && <div style={{ background: "rgba(244, 63, 94, 0.05)", border: "1px solid var(--color-rose)", color: "var(--color-rose)", padding: "10px", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "12px" }}>{authError}</div>}
          {authSuccess && <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid var(--color-emerald)", color: "var(--color-emerald)", padding: "10px", borderRadius: "8px", fontSize: "0.8rem", marginBottom: "12px" }}>{authSuccess}</div>}

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="input-group">
              <label className="input-label" htmlFor="auth-email-input">Email Address</label>
              <input id="auth-email-input" type="email" className="form-input" placeholder="e.g. staff@stadium.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="auth-pass-input">Password</label>
              <input id="auth-pass-input" type="password" className="form-input" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
            </div>

            {authTab === "signup" && (
              <div className="input-group">
                <label className="input-label" htmlFor="auth-role-select">Target System Role</label>
                <select id="auth-role-select" className="form-input" value={authRole} onChange={(e) => setAuthRole(e.target.value)}>
                  <option value="fan">Fan (Read Only)</option>
                  <option value="staff">Operational Staff</option>
                  <option value="organizer">Event Organizer</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            )}

            <button type="submit" className="interactive-btn" style={{ width: "100%", marginTop: "8px" }} disabled={authLoading}>
              {authLoading ? "Executing firebase API dispatch..." : authTab === "signin" ? "Sign In to Telemetry Console" : "Create User Profile"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
