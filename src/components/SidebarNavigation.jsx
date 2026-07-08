import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldAlert, AlertTriangle, X, Menu, Sun, Moon, ChevronsLeft, ChevronsRight } from "lucide-react";

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
 * @param {string} props.theme - Current data-theme (light or dark)
 * @param {Function} props.setTheme - Theme setter callback
 * @param {boolean} props.isSidebarCollapsed - Sidebar width collapse state
 * @param {Function} props.setIsSidebarCollapsed - Collapse state setter callback
 */
export function SidebarNavigation({
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenEmergencyModal,
  evacuationAlarm,
  userRole,
  getRoleLabel,
  navigationItems,
  theme,
  setTheme,
  isSidebarCollapsed,
  setIsSidebarCollapsed
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
          <span className={`role-badge role-${userRole}`}>
            {getRoleLabel()}
          </span>
          <button 
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle dark/light theme"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <span>🧞‍♂️ StadiumAssist</span>
          <button 
            className="collapse-toggle-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
            aria-label="Toggle sidebar collapse width"
          >
            {isSidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
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
                  title={isSidebarCollapsed ? item.name : ""}
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
