import React, { useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { askGenieCallable, translateResponseCallable } from "../firebase";
import { 
  MessageSquare, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  HelpCircle, 
  MapPin, 
  Loader2, 
  Mic, 
  MicOff, 
  ShieldAlert, 
  BookOpen, 
  Cpu 
} from "lucide-react";

export default function FanAssistant() {
  const { reportIncident, queues, faqs, submitFeedback, saveFaq, addLog } = useAppState();
  
  // Incident Form States
  const [incTitle, setIncTitle] = useState("");
  const [incType, setIncType] = useState("maintenance");
  const [incLoc, setIncLoc] = useState("Zone A (Concourse)");
  const [incDesc, setIncDesc] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Feedback Form States
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState("");
  const [fbSubmitted, setFbSubmitted] = useState(false);

  // Chatbot & Knowledge Engine States
  const [messages, setMessages] = useState([
    { 
      sender: "genie", 
      text: "Hello! I am your StadiumAssist AI Assistant. How can I help you navigate the stadium today?",
      source: "Rule Engine"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [language, setLanguage] = useState("en"); // Default chat language is English
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleIncidentSubmit = (e) => {
    e.preventDefault();
    if (!incTitle || !incDesc) return;
    
    reportIncident(incTitle, incDesc, incType, incLoc, "Fan App User");
    setFormSubmitted(true);
    
    setTimeout(() => {
      setIncTitle("");
      setIncDesc("");
      setFormSubmitted(false);
    }, 3000);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!fbComment.trim()) return;
    submitFeedback(fbRating, fbComment);
    setFbSubmitted(true);
    setTimeout(() => {
      setFbRating(5);
      setFbComment("");
      setFbSubmitted(false);
    }, 3000);
  };

  /**
   * Normalize query by:
   * 1. Converting to lowercase
   * 2. Stripping punctuation characters
   * 3. Applying a synonym mapping for common stadium terms
   */
  const normalizeQuery = (text) => {
    let norm = text.toLowerCase().trim();
    norm = norm.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

    const synonymMap = {
      // Restrooms
      "washroom": "toilets",
      "restroom": "toilets",
      "toilet": "toilets",
      "wc": "toilets",
      "bathroom": "toilets",
      "latrine": "toilets",
      // Gates
      "entrance": "gate",
      "door": "gate",
      "ingress": "gate",
      "access": "gate",
      "gateways": "gate",
      // Concessions / Food & Drink
      "food": "concession",
      "dining": "concession",
      "lunch": "concession",
      "dinner": "concession",
      "eat": "concession",
      "drink": "concession",
      "beer": "concession",
      "nachos": "concession",
      "popcorn": "concession",
      "soda": "concession",
      "coke": "concession",
      "restaurant": "concession",
      "concessions": "concession",
      "food court": "concession"
    };

    const words = norm.split(/\s+/);
    const mappedWords = words.map(word => synonymMap[word] || word);
    return mappedWords.join(" ");
  };

  /**
   * Local Rule Engine
   * Matches urgent queries or standard conversational greetings before hitting Firestore
   */
  const checkLocalRules = (normalizedQuery) => {
    const q = normalizedQuery.toLowerCase();
    
    // Emergency Keywords Rule
    if (q.includes("emergency") || q.includes("fire") || q.includes("injury") || q.includes("danger") || q.includes("police") || q.includes("evacuate") || q.includes("hurt") || q.includes("medical emergency")) {
      return {
        text: "⚠️ CRITICAL SAFETY RULE INSTRUCTION: If you are in immediate danger or witness an active emergency, please evacuate calmly through the nearest exit gate. Report safety hazards immediately to the nearest Security Steward (wearing high-visibility yellow jackets) or dial local emergency services (911/112).",
        source: "Rule Engine"
      };
    }

    // Conversational Greeting Rule
    if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("greetings") || q.includes("who are you")) {
      return {
        text: "Hello! I am StadiumAssist, your interactive stadium operations assistant. You can ask me questions about gates, washrooms, concessions, or parking. I can also translate answers into multiple languages!",
        source: "Rule Engine"
      };
    }

    // Conversational Gratitude Rule
    if (q.includes("thank you") || q.includes("thanks") || q.includes("awesome") || q.includes("perfect")) {
      return {
        text: "You're very welcome! I'm here to ensure your stadium visit is safe and pleasant. Enjoy the event!",
        source: "Rule Engine"
      };
    }

    return null;
  };

  /**
   * HTML5 Web Speech API integration
   * Captures voice input from the fan's microphone and populates the text field
   */
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition API is not supported in this browser. Please type your query in the input field.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-US" : language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      addLog("Voice input capture started. Listening...");
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setIsListening(false);
      addLog(`Speech Recognition Error: ${e.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcriptText = event.results[0][0].transcript;
      setUserInput(transcriptText);
      addLog(`Voice recognition captured: "${transcriptText}"`);
      handleSendMessage(transcriptText);
    };

    recognition.start();
  };

  /**
   * Core Knowledge Engine Routing
   */
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || userInput;
    if (!text.trim()) return;

    // 1. Add User query to chat bubbles
    const updatedMessages = [...messages, { sender: "user", text: text }];
    setMessages(updatedMessages);
    setUserInput("");
    setIsTyping(true);

    const normalized = normalizeQuery(text);
    addLog(`Engine Search trigger: "${text}" [Normalized: "${normalized}"]`);

    // A. Check Local Rule Engine
    const ruleMatch = checkLocalRules(normalized);
    if (ruleMatch) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          sender: "genie", 
          text: ruleMatch.text, 
          source: ruleMatch.source 
        }]);
        setIsTyping(false);
        addLog(`Query resolved locally via Rule Engine.`);
      }, 600);
      return;
    }

    // B. Check knowledgeBase FAQ database
    const matchedFaq = faqs.find(faq => {
      if (faq.verified === false) return false;
      const keyword = faq.keyword.toLowerCase().trim();
      if (normalized.includes(keyword)) return true;
      if (faq.synonyms && faq.synonyms.some(syn => normalized.includes(syn.toLowerCase().trim()))) {
        return true;
      }
      return false;
    });

    let answer = "";
    let sourceBadge = "Knowledge Base";
    let actionLogText = "";

    try {
      if (matchedFaq) {
        // Match found in FAQ database
        if (language === "en") {
          answer = matchedFaq.response;
          actionLogText = "FAQ match resolved directly in English.";
        } else {
          // FAQ matches but needs translation via Cloud Function
          actionLogText = `FAQ match found. Translating into ${language.toUpperCase()}...`;
          addLog(actionLogText);

          if (translateResponseCallable) {
            const result = await translateResponseCallable({ 
              text: matchedFaq.response, 
              targetLanguage: language 
            });
            answer = result.data.translatedText;
          } else {
            // Local simulation fallback translation
            const simulatedTranslations = {
              es: `[Traducido al Español] ${matchedFaq.response}`,
              fr: `[Traduit en Français] ${matchedFaq.response}`,
              de: `[Übersetzt ins Deutsche] ${matchedFaq.response}`,
              it: `[Tradotto in Italiano] ${matchedFaq.response}`
            };
            answer = simulatedTranslations[language] || `[Translated to ${language}] ${matchedFaq.response}`;
          }
        }
        sourceBadge = "Knowledge Base";
      } else {
        // No match found - route to askGenie (Gemini AI)
        actionLogText = "No local FAQ match. Querying askGenie Cloud Function...";
        addLog(actionLogText);

        if (askGenieCallable) {
          try {
            const result = await askGenieCallable({ query: text });
            answer = result.data.response;
            sourceBadge = "Gemini AI";
          } catch (callableError) {
            console.warn("Gemini Cloud Function failed. Falling back to Knowledge Base loose match.", callableError);
            addLog(`Error contacting Gemini: ${callableError.message}. Executing KB fallback...`);
            
            // Loose matching: split search query into keywords, see if any matches a verified FAQ keyword
            const keywords = normalized.split(/\s+/);
            const looseMatch = faqs.find(faq => {
              if (faq.verified === false) return false;
              const faqKeyword = faq.keyword.toLowerCase().trim();
              return keywords.some(k => k.length > 2 && (faqKeyword.includes(k) || k.includes(faqKeyword)));
            });

            if (looseMatch) {
              answer = `[Connection Fallback] ${looseMatch.response}`;
            } else {
              answer = "We are experiencing connection issues reaching our AI assistant. Based on our Knowledge Base: For ticketing, parking, washrooms, or emergency help, please visit the closest Customer Help Hub located at Section 101.";
            }
            sourceBadge = "Knowledge Base";
          }
        } else {
          // Simulation mode fallback answer
          const lowerQuery = normalized.toLowerCase();
          if (lowerQuery.includes("parking") || lowerQuery.includes("car")) {
            answer = "General parking is available in Lot Red (Gate A) and Lot Blue (Gate D) for $25. We recommend pre-booking your spot online.";
          } else if (lowerQuery.includes("ticket") || lowerQuery.includes("barcode")) {
            answer = "For ticketing issues or barcode scans that fail, please visit the ticketing resolution windows located at Gates A and C.";
          } else if (lowerQuery.includes("beer") || lowerQuery.includes("alcohol") || lowerQuery.includes("drink") || lowerQuery.includes("concession")) {
            answer = "Alcohol is served at the Eastern Grill, VIP Bar, and kiosks. All alcohol sales will cease at the 75th minute of the event.";
          } else if (lowerQuery.includes("wifi") || lowerQuery.includes("internet")) {
            answer = "Free public Wi-Fi is available stadium-wide. Connect to the network named '#StadiumAssistFree' and follow the portal instructions.";
          } else if (lowerQuery.includes("gate 2") || lowerQuery.includes("gate")) {
            answer = "Gate 2 is currently closed for incoming ingress traffic. We recommend entering via Gate 1 or Gate 3 which have wait times under 10 minutes.";
          } else {
            answer = `Based on current stadium telemetry, we recommend checking the Interactive Map or visiting the Customer Help Hub at Section 101 for immediate assistance with your query: "${text}".`;
          }
          sourceBadge = "Gemini AI";

          // Write back unverified AI query to FAQ state context
          setTimeout(() => {
            const simulatedFaq = {
              keyword: text.toLowerCase().trim(),
              intent: "general_ai",
              synonyms: [],
              response: answer,
              language: "en",
              source: "AI-generated",
              verified: false
            };
            saveFaq(simulatedFaq);
            addLog(`AI-generated Q&A written back to knowledgeBase database (unverified).`);
          }, 1000);
        }
      }

      addLog(`Chat engine completed response status: ${actionLogText}`);
    } catch (error) {
      console.error("Knowledge Engine error:", error);
      answer = "Apologies, we encountered an error while resolving your request. Please ask a supervisor or visit the Customer Help Hub at Section 101.";
      sourceBadge = "Rule Engine";
    } finally {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        sender: "genie", 
        text: answer, 
        source: sourceBadge 
      }]);
    }
  };

  // Quick replies preset questions
  const quickReplies = [
    { text: "Where is Gate 2?", query: "Where is Gate 2?" },
    { text: "Nearest washroom", query: "Where is the nearest washroom?" },
    { text: "Food Court", query: "Where is the food court concessions stand?" },
    { text: "Parking Lots", query: "Where is parking available?" },
    { text: "Emergency Help", query: "Emergency! Someone is injured." }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Stadium Assistant Engine</h1>
        <p className="page-description">Normalized FAQ engine with voice capture, synonym mapping, and local rule configurations.</p>
      </div>

      <div className="grid-cols-2">
        {/* Incident Reporter Form */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "var(--color-cyan)" }}>
            <AlertTriangle size={22} />
            Report Stadium Incident
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px" }}>
            See a safety hazard, water spillage, broken facility, or need immediate assistance? Log it below. This generates an instant notification in the Staff Operations dispatch board.
          </p>

          {formSubmitted ? (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--color-emerald)", color: "var(--color-emerald)", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Incident Reported Successfully!</h3>
              <p style={{ fontSize: "0.9rem" }}>A staff dispatch order has been generated automatically. Thank you for keeping our stadium safe!</p>
            </div>
          ) : (
            <form onSubmit={handleIncidentSubmit}>
              <div className="input-group">
                <label className="input-label">Short Title / Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Soda Spill Zone D Row 10" 
                  value={incTitle} 
                  onChange={(e) => setIncTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="grid-cols-2" style={{ gap: "20px", marginBottom: "20px" }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Issue Category</label>
                  <select 
                    className="form-input" 
                    value={incType} 
                    onChange={(e) => setIncType(e.target.value)}
                  >
                    <option value="maintenance">Spillage / Cleanup</option>
                    <option value="facility">Broken Facility / Seat</option>
                    <option value="security">Security Concern</option>
                    <option value="medical">Medical Assistance</option>
                  </select>
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Stadium Location</label>
                  <select 
                    className="form-input" 
                    value={incLoc} 
                    onChange={(e) => setIncLoc(e.target.value)}
                  >
                    <option value="Zone A (Concourse)">Zone A (Concourse)</option>
                    <option value="Zone B (Concourse)">Zone B (Concourse)</option>
                    <option value="Zone C (Seating)">Zone C (Seating)</option>
                    <option value="Zone D (Seating)">Zone D (Seating)</option>
                    <option value="Zone E (Suites)">Zone E (VIP Suites)</option>
                    <option value="Gate 1 Entrance">Gate 1 Entrance</option>
                    <option value="Gate 3 Entrance">Gate 3 Entrance</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Detailed Description</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="Provide precise details (e.g., seat numbers, type of spill, severity) to help staff dispatch teams."
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="interactive-btn" style={{ width: "100%" }}>
                <AlertTriangle size={18} />
                Submit Safety Report
              </button>
            </form>
          )}
        </div>

        {/* Chatbot Interface */}
        <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", height: "570px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
            <h2 style={{ fontSize: "1.4rem", display: "flex", alignItems: "center", gap: "10px", color: "var(--color-purple)" }}>
              <Sparkles size={22} />
              AI Assistant Chat
            </h2>
            
            {/* Language Selector Dropdown */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Language:</span>
              <select 
                className="form-input" 
                style={{ width: "auto", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", background: "rgba(10, 14, 26, 0.6)" }}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English (Direct)</option>
                <option value="es">Español (Gemini Translate)</option>
                <option value="fr">Français (Gemini Translate)</option>
                <option value="de">Deutsch (Gemini Translate)</option>
                <option value="it">Italiano (Gemini Translate)</option>
              </select>
            </div>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "16px" }}>
            Quick replies query the engine. Badges show source classifications.
          </p>

          {/* Chat Messages and History */}
          <div 
            style={{ 
              flexGrow: 1, 
              overflowY: "auto", 
              background: "rgba(10, 14, 26, 0.4)", 
              border: "1px solid var(--border-glass)", 
              borderRadius: "12px", 
              padding: "16px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "12px",
              marginBottom: "16px" 
            }}
          >
            {messages.map((msg, index) => (
              <div 
                key={index}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                  background: msg.sender === "user" 
                    ? "#2563eb" 
                    : "#e0f2fe",
                  color: msg.sender === "user" ? "#ffffff" : "#0f172a",
                  padding: "10px 14px",
                  borderRadius: msg.sender === "user" ? "14px 14px 0 14px" : "14px 14px 14px 0",
                  fontSize: "0.9rem",
                  lineHeight: "1.4",
                  boxShadow: msg.sender === "user" ? "0 4px 10px rgba(99, 102, 241, 0.2)" : "none",
                  whiteSpace: "pre-line",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                {/* Text Response */}
                <div>{msg.text}</div>
                
                {/* Source Attribution Badge */}
                {msg.sender === "genie" && msg.source && (
                  <span 
                    style={{
                      alignSelf: "flex-end",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: "1px solid",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                      marginTop: "4px",
                      background: msg.source === "Rule Engine" 
                        ? "rgba(245, 158, 11, 0.1)" 
                        : msg.source === "Knowledge Base" 
                        ? "rgba(6, 182, 212, 0.1)" 
                        : "rgba(168, 85, 247, 0.1)",
                      color: msg.source === "Rule Engine" 
                        ? "var(--color-amber)" 
                        : msg.source === "Knowledge Base" 
                        ? "var(--color-cyan)" 
                        : "var(--color-purple)",
                      borderColor: msg.source === "Rule Engine" 
                        ? "rgba(245, 158, 11, 0.3)" 
                        : msg.source === "Knowledge Base" 
                        ? "rgba(6, 182, 212, 0.3)" 
                        : "rgba(168, 85, 247, 0.3)"
                    }}
                  >
                    {msg.source === "Rule Engine" && <Cpu size={10} style={{ marginRight: "4px", verticalAlign: "middle" }} />}
                    {msg.source === "Knowledge Base" && <BookOpen size={10} style={{ marginRight: "4px", verticalAlign: "middle" }} />}
                    {msg.source === "Gemini AI" && <Sparkles size={10} style={{ marginRight: "4px", verticalAlign: "middle" }} />}
                    {msg.source}
                  </span>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "14px 14px 14px 0", color: "var(--text-secondary)" }}>
                <Loader2 size={16} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "0.85rem" }}>Genie is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick replies Suggested Buttons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "4px" }}>
            {quickReplies.map((qr, idx) => (
              <button 
                key={idx}
                onClick={() => handleSendMessage(qr.query)}
                style={{
                  background: qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.1)" : "rgba(255, 255, 255, 0.04)",
                  border: "1px solid",
                  borderColor: qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.3)" : "var(--border-glass)",
                  color: qr.text === "Emergency Help" ? "var(--color-rose)" : "var(--text-secondary)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  transition: "var(--transition)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                onMouseOver={(e) => { 
                  e.target.style.background = qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.2)" : "rgba(255, 255, 255, 0.08)"; 
                  e.target.style.borderColor = qr.text === "Emergency Help" ? "var(--color-rose)" : "var(--color-cyan)"; 
                }}
                onMouseOut={(e) => { 
                  e.target.style.background = qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.1)" : "rgba(255, 255, 255, 0.04)"; 
                  e.target.style.borderColor = qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.3)" : "var(--border-glass)"; 
                }}
              >
                {qr.text === "Emergency Help" && <ShieldAlert size={12} />}
                {qr.text}
              </button>
            ))}
          </div>

          {/* Form Send & Voice Input mic */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder={isListening ? "Listening... Speak now." : "Ask anything (e.g. 'Where is the washroom?')..."} 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isTyping || isListening}
            />

            {/* Voice microphone button */}
            <button 
              onClick={startVoiceInput} 
              className={`interactive-btn ${isListening ? 'danger' : 'secondary'}`} 
              style={{ 
                padding: "12px", 
                borderRadius: "12px",
                borderColor: isListening ? "var(--color-rose)" : "var(--border-glass)",
                animation: isListening ? "pulse-border 1s infinite alternate" : "none",
                background: isListening ? "linear-gradient(135deg, var(--color-rose) 0%, #b91c1c 100%)" : "var(--bg-tertiary)"
              }}
              disabled={isTyping}
              title="Voice Input (Speech to Text)"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button 
              onClick={() => handleSendMessage()} 
              className="interactive-btn" 
              style={{ padding: "12px" }}
              disabled={isTyping || isListening}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Submission Panel */}
      <div className="glass-panel" style={{ padding: "30px", marginTop: "30px" }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "12px", color: "var(--color-emerald)", display: "flex", alignItems: "center", gap: "10px" }}>
          Rate Your Stadium Experience
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
          Help us improve our stadium operations. Tell us what went well and what bottlenecks you encountered!
        </p>

        {fbSubmitted ? (
          <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid var(--color-emerald)", color: "var(--color-emerald)", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>Thank You For Your Feedback!</h3>
            <p style={{ fontSize: "0.85rem" }}>Your review has been logged to the Organizer DSS console.</p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
              <div className="input-group" style={{ marginBottom: 0, flexGrow: 1 }}>
                <label className="input-label">Select Star Rating</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setFbRating(stars)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.8rem",
                        cursor: "pointer",
                        color: fbRating >= stars ? "var(--color-amber)" : "rgba(255,255,255,0.15)",
                        transition: "var(--transition)"
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Comments / Suggestions</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Share your thoughts (e.g. queue wait times, volunteer friendliness, parking, Wi-Fi)..."
                value={fbComment}
                onChange={(e) => setFbComment(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="interactive-btn" style={{ alignSelf: "flex-end", padding: "10px 24px" }}>
              Submit Review
            </button>
          </form>
        )}
      </div>
      
      {/* Keyframe animation for spinner */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
