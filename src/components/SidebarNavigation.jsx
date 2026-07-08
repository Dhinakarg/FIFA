import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldAlert, AlertTriangle, X, Menu } from "lucide-react";

/**
 * SidebarNavigation component rendering the top navbar header and side navigation.
 * 
 * @param {Object} props
 * @param {boolean} props.mobileMenuOpen - Mobile layout menu visibility status
 * @param {Function} props.setMobileMenuOpen - Set mobile menu visibility state
 * @param {Function} props.onOpenEmergencyModal - Trigger opening critical emergency modal
 * @param {boolean} props.evacuationAlarm - System evacuation alarm active indicator
 * @param {boolean} props.isFirebaseActive - Active network flag
 * @param {string} props.userRole - Active user role simulated profile
 * @param {Function} props.getRoleLabel - Label helper mapping role keys to printable text
 * @param {Array} props.navigationItems - List of navigation items with path, name, and icon
 */
export function SidebarNavigation({
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenEmergencyModal,
  evacuationAlarm,
  isFirebaseActive,
  userRole,
  getRoleLabel,
  navigationItems
}) {
  const location = useLocation();

  return (
    <>
      {/* Top Navbar */}
      <header className="top-navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button 
            className="mobile-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
            Operations Control Panel
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* CRITICAL EMERGENCY NAVIGATION BUTTON */}
          <button 
            onClick={onOpenEmergencyModal}
            className="interactive-btn danger"
            style={{ 
              padding: "8px 16px", 
              fontSize: "0.85rem", 
              borderRadius: "8px", 
              boxShadow: "var(--glow-rose)",
              animation: "pulse-border 1s infinite alternate" 
            }}
          >
            <ShieldAlert size={14} style={{ marginRight: "6px" }} />
            EMERGENCY
          </button>

          {evacuationAlarm && (
            <span 
              className="badge-status badge-high" 
              style={{ animation: "pulse-border 1.5s infinite alternate", display: "flex", gap: "6px", alignItems: "center" }}
            >
              <AlertTriangle size={14} />
              EVAC WARNING
            </span>
          )}
          {!isFirebaseActive && (
            <span 
              className="badge-status badge-high" 
              style={{ 
                background: "rgba(245, 158, 11, 0.1)", 
                borderColor: "rgba(245, 158, 11, 0.25)", 
                color: "var(--color-amber)", 
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                animation: "pulse-border 1.5s infinite alternate"
              }}
              title="Running on offline local mock states"
            >
              ● OFFLINE (SIMULATOR)
            </span>
          )}
          <span className={`role-badge role-${userRole}`}>
            {getRoleLabel()}
          </span>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <span>🧞‍♂️ StadiumAssist</span>
        </div>

        <ul className="sidebar-menu">
          {navigationItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="sidebar-item">
                <Link 
                  to={item.path} 
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ padding: "20px", borderTop: "1px solid var(--border-glass)", fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
          StadiumAssist Telemetry v1.0
        </div>
      </aside>
    </>
  );
}
