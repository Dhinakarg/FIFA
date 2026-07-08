import React from "react";
import { HashRouter as Router } from "react-router-dom";
import { AppStateProvider } from "./context/AppStateContext";
import NavigationWrapper from "./components/NavigationWrapper";

/**
 * Root Entrypoint component of the Single Page Application.
 * Wraps the routing layout context inside global AppStateProvider context.
 * 
 * @returns {JSX.Element} The active React application
 */
export default function App() {
  return (
    <AppStateProvider>
      <Router>
        <NavigationWrapper />
      </Router>
    </AppStateProvider>
  );
}
