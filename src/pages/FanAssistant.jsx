import React, { useMemo } from "react";
import { useAppState } from "../context/AppStateContext";
import { IncidentForm } from "../components/IncidentForm";
import { FeedbackForm } from "../components/FeedbackForm";
import { ChatbotPanel } from "../components/ChatbotPanel";
import { useChatbotEngine } from "../hooks/useChatbotEngine";
import { AlertTriangle, Sparkles, Heart } from "lucide-react";

const quickReplies = [
  { text: "Where is Gate 2?", query: "Where is Gate 2?" },
  { text: "Nearest washroom", query: "Where is the nearest washroom?" },
  { text: "Food Court", query: "Where is the food court concessions stand?" },
  { text: "Parking Lots", query: "Where is parking available?" },
  { text: "Emergency Help", query: "Emergency! Someone is injured." }
];

/**
 * FanAssistant page rendering the user-facing AI chat assistant, 
 * feedback panel, and incident report widgets.
 * Delegates conversational logic to the useChatbotEngine hook.
 * 
 * @returns {JSX.Element} The active FanAssistant page
 */
export default function FanAssistant() {
  const { reportIncident, faqs, submitFeedback, saveFaq, addLog } = useAppState();

  const knowledgeBaseSynonymMap = useMemo(() => {
    const map = new Map();
    faqs.forEach(faq => {
      if (faq.verified !== false && faq.synonyms) {
        faq.synonyms.forEach(syn => {
          map.set(syn.toLowerCase().trim(), faq);
        });
      }
    });
    return map;
  }, [faqs]);

  const {
    messages,
    userInput,
    setUserInput,
    language,
    setLanguage,
    isTyping,
    isListening,
    startVoiceInput,
    handleSendMessage
  } = useChatbotEngine(faqs, saveFaq, addLog, knowledgeBaseSynonymMap);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stadium Assistant Engine</h1>
        <p className="page-description">Normalized FAQ engine with voice capture, synonym mapping, and local rule configurations.</p>
      </div>

      <div className="grid-cols-2">
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {/* Incident Reporter Form */}
          <div className="glass-panel" style={{ padding: "30px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "var(--color-cyan)" }}>
              <AlertTriangle size={22} />
              Report Stadium Incident
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
              See a safety hazard, water spillage, broken facility, or need immediate assistance? Log it below. This generates an instant notification in the Staff Operations dispatch board.
            </p>
            <IncidentForm reportIncident={reportIncident} />
          </div>

          {/* Feedback Submission Panel */}
          <div className="glass-panel" style={{ padding: "30px" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "12px", color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Heart size={22} style={{ color: "var(--color-emerald)" }} />
              Rate Your Stadium Experience
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
              Help us improve our stadium operations. Tell us what went well and what bottlenecks you encountered!
            </p>
            <FeedbackForm submitFeedback={submitFeedback} />
          </div>
        </div>

        {/* Chatbot Interface */}
        <div className="glass-panel" style={{ padding: "30px", height: "100%", minHeight: "570px" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px", color: "var(--color-purple)" }}>
            <Sparkles size={22} />
            AI Assistant Chat
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Quick replies query the engine. Badges show source classifications.
          </p>
          <ChatbotPanel
            messages={messages}
            userInput={userInput}
            setUserInput={setUserInput}
            language={language}
            setLanguage={setLanguage}
            isTyping={isTyping}
            isListening={isListening}
            onVoiceInput={startVoiceInput}
            onSendMessage={handleSendMessage}
            quickReplies={quickReplies}
          />
        </div>
      </div>
    </div>
  );
}
