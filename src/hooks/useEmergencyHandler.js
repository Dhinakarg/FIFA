import { useState } from "react";
import { classifyEmergencyCallable } from "../firebase";

/**
 * Custom hook to manage active critical emergency alerts dispatch submissions
 * and SOP lookup workflows.
 * 
 * @param {Array} volunteers - List of active volunteers
 * @param {Function} reportIncident - Context function to register reported incidents
 * @param {Function} addLog - Context function to write telemetry event logs
 * @param {Object} predefinedSOPs - Map of emergency types to SOP checklists
 * @returns {Object} Emergency form controls, active alert details, and handlers
 */
export function useEmergencyHandler(volunteers, reportIncident, addLog, predefinedSOPs) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emergencyDesc, setEmergencyDesc] = useState("");
  const [emergencyType, setEmergencyType] = useState("unclear"); // Default to auto-classify
  const [emergencyLoc, setEmergencyLoc] = useState("Zone A (Concourse)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null); // Displays SOP/Volunteer directions when set

const sanitizeInput = (str, maxLength = 1000) => {
  if (typeof str !== "string") return "";
  let clean = str.trim();
  clean = clean.replace(/<[^>]*>/g, "");
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }
  return clean;
};

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    const cleanedDesc = sanitizeInput(emergencyDesc, 1000);
    if (!cleanedDesc) return;

    setIsSubmitting(true);
    addLog(`Emergency Trigger: Initiating critical response procedures...`);

    let resolvedCategory = emergencyType;

    // Call Gemini Cloud Function to classify if category is unclear
    if (emergencyType === "unclear") {
      addLog("Unclear category. Running Gemini classification Cloud Function...");
      try {
        if (classifyEmergencyCallable) {
          const result = await classifyEmergencyCallable({ description: cleanedDesc });
          resolvedCategory = result.data.type;
        } else {
          // Simulation keyword matcher fallback
          const text = emergencyDesc.toLowerCase();
          if (text.includes("fire") || text.includes("smoke") || text.includes("burn")) resolvedCategory = "fire";
          else if (text.includes("fight") || text.includes("hit") || text.includes("beat")) resolvedCategory = "fight";
          else if (text.includes("child") || text.includes("kid") || text.includes("lost")) resolvedCategory = "lost child";
          else if (text.includes("power") || text.includes("light") || text.includes("dark")) resolvedCategory = "power failure";
          else resolvedCategory = "medical";
        }
        addLog(`Gemini Classification result: "${resolvedCategory}"`);
      } catch (err) {
        console.warn("Gemini classification failed, running local keyword rule checks:", err);
        addLog(`Gemini Classification failed: ${err.message}. Running local rules...`);
        
        const text = emergencyDesc.toLowerCase();
        if (text.includes("fire") || text.includes("smoke") || text.includes("burn")) resolvedCategory = "fire";
        else if (text.includes("fight") || text.includes("hit") || text.includes("beat")) resolvedCategory = "fight";
        else if (text.includes("child") || text.includes("kid") || text.includes("lost")) resolvedCategory = "lost child";
        else if (text.includes("power") || text.includes("light") || text.includes("dark")) resolvedCategory = "power failure";
        else resolvedCategory = "medical";
        
        addLog(`Local rules classified category as: "${resolvedCategory}"`);
      }
    }

    // Determine the volunteer in the zone
    const targetZone = emergencyLoc.includes("Zone A") ? "Zone A" 
                    : emergencyLoc.includes("Zone B") ? "Zone B"
                    : emergencyLoc.includes("Zone C") ? "Zone C"
                    : emergencyLoc.includes("Zone D") ? "Zone D"
                    : "Zone E";

    // Find nearest available volunteer in the zone, or fallback to any available overall
    const zoneVolunteers = volunteers.filter(v => v.zone === targetZone && v.status === "available");
    const nearestVol = zoneVolunteers[0] || volunteers.find(v => v.status === "available") || { name: "Response Team Alpha", contactMethod: "Emergency Broadcast Channel 1" };

    const titleText = `CRITICAL ALERT: ${resolvedCategory.toUpperCase()} in ${targetZone}`;
    
    // Submit Critical Incident.
    await reportIncident(
      titleText, 
      emergencyDesc, 
      resolvedCategory, 
      emergencyLoc, 
      "Emergency Console Trigger", 
      "Critical"
    );

    // Set active alert parameters
    setActiveAlert({
      category: resolvedCategory,
      location: emergencyLoc,
      sopText: predefinedSOPs[resolvedCategory] || "SOP-GENERAL:\n1. Alert Security supervisors.\n2. Advise guests to follow nearest exits.",
      volunteer: nearestVol,
      evacuationRoute: resolvedCategory === "fire" || resolvedCategory === "power failure"
        ? "⚠️ HIGH HAZARD EVACUATION: Evacuate the sector immediately. Go through Gate A (West) or Gate D (East)."
        : "STANDARD EVACUATION: Egress routes are clear. Follow concourse directional path to Gate A, B, C, or D exits."
    });

    setIsSubmitting(false);
  };

  const closeEmergencyModal = () => {
    setIsModalOpen(false);
    setActiveAlert(null);
    setEmergencyDesc("");
    setEmergencyType("unclear");
  };

  return {
    isModalOpen,
    setIsModalOpen,
    emergencyDesc,
    setEmergencyDesc,
    emergencyType,
    setEmergencyType,
    emergencyLoc,
    setEmergencyLoc,
    isSubmitting,
    activeAlert,
    handleEmergencySubmit,
    closeEmergencyModal
  };
}
