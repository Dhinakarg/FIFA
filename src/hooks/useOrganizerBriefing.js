import { useState } from "react";
import { generateStadiumReportCallable, summarizeFeedbackCallable } from "../firebase";

/**
 * Custom hook managing Organizer briefings DSS calculations and guest feedback compilation.
 * 
 * @param {Object} activeEvent - Active event model
 * @param {Array} incidents - Incidents records
 * @param {Array} gates - Ingress gates status
 * @param {Array} volunteers - Active crew members
 * @param {Function} addLog - System log callback
 * @returns {Object} Briefing and feedback states with generation handlers
 */
export function useOrganizerBriefing(activeEvent, incidents, gates, volunteers, addLog) {
  const [dssBriefing, setDssBriefing] = useState("");
  const [dssLoading, setDssLoading] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState("");
  const [fbLoading, setFbLoading] = useState(false);

  const handleGenerateFeedbackSummary = async () => {
    setFbLoading(true);
    setFeedbackSummary("");
    addLog("Requesting Gemini Guest Feedback Summary briefing...");
    try {
      if (summarizeFeedbackCallable) {
        const result = await summarizeFeedbackCallable({});
        setFeedbackSummary(result.data.summaryText);
      } else {
        setTimeout(() => {
          setFeedbackSummary(`### GUEST FEEDBACK ANALYTICS (SIMULATED)
*Average Guest Rating: **3.4 / 5.0** (5 total reviews)*

#### 1. Top Praises
- Fast public Wi-Fi speed and wide coverage in concourses.
- Friendly, supportive volunteers helping with directions.

#### 2. Top Complaints
- Severe queues at the Eastern Grill concession (exceeding 30 minutes wait).
- Lack of clear directional signs to upper levels like Section 228.

#### 3. Suggested Improvements
- Deploy queue pre-order staff at Eastern Grill to speed up orders.
- Mount more high-contrast directional signage on concourse pillars.`);
          addLog("Simulated guest feedback summary generated.");
        }, 1200);
      }
    } catch (error) {
      console.error("Failed to summarize feedback:", error);
      setFeedbackSummary("ERROR: Could not fetch guest feedback aggregation summaries.");
    } finally {
      setFbLoading(false);
    }
  };

  const handleGenerateBriefing = async () => {
    setDssLoading(true);
    setDssBriefing("");
    addLog("Requesting Gemini DSS Operational Summary...");
    try {
      if (generateStadiumReportCallable) {
        const result = await generateStadiumReportCallable({
          crowd: { attendance: activeEvent.attendance, capacity: activeEvent.capacity },
          incidents,
          gates,
          volunteers
        });
        setDssBriefing(result.data.reportText);
      } else {
        setTimeout(() => {
          const activeIncs = incidents.filter(i => i.status !== "resolved");
          const highLoadGates = gates.filter(g => (g.currentCount / g.capacity) > 0.8);
          const availableStaff = volunteers.filter(v => v.status === "available");
          
          let report = `**OPERATIONAL BRIEFING (DSS SUPPORT - SIMULATED)**\n\n`;
          report += `* Stadium capacity load is at **${Math.round((activeEvent.attendance / activeEvent.capacity) * 100)}%** (${activeEvent.attendance.toLocaleString()} inside).\n`;
          report += `* **Congestion Alert**: ${highLoadGates.length} ingress gate(s) exceeding the 80% occupancy threshold.\n`;
          report += `* **Dispatch Tickets**: ${activeIncs.length} unresolved incidents remain on the board.\n`;
          report += `* **Resources**: ${availableStaff.length} crew volunteers are active and available.\n\n`;
          report += `**Recommendation**: Open auxiliary egress gates and divert incoming ticketing lanes. Direct available usher crews to clear concourse congestions.`;
          
          setDssBriefing(report);
          addLog("Simulated DSS Operational Briefing generated.");
        }, 1200);
      }
    } catch (error) {
      console.error("DSS Operational Summary failed:", error);
      setDssBriefing("ERROR: Failed to establish secure DSS telemetry channels. Review database bindings.");
    } finally {
      setDssLoading(false);
    }
  };

  return {
    dssBriefing,
    dssLoading,
    handleGenerateBriefing,
    feedbackSummary,
    fbLoading,
    handleGenerateFeedbackSummary
  };
}
