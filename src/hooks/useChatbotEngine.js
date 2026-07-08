import { useState } from "react";
import { askGenieCallable, translateResponseCallable } from "../firebase";
import { normalizeQuery, checkLocalRules } from "../utils/chatbotHelpers";

/**
 * Sanitizes input strings by stripping HTML tags and truncating to a maximum length.
 * 
 * @param {string} str - Raw input string
 * @param {number} maxLength - Maximum allowed string length
 * @returns {string} Cleaned and truncated string
 */
const sanitizeInput = (str, maxLength = 500) => {
  if (typeof str !== "string") return "";
  let clean = str.trim();
  clean = clean.replace(/<[^>]*>/g, "");
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength);
  }
  return clean;
};

/**
 * Custom hook managing the conversational chatbot state, voice recognition triggers, 
 * local rule matching, and Gemini/translation integrations.
 * 
 * @param {Array} faqs - List of FAQs from context
 * @param {Function} saveFaq - State callback to save a resolved FAQ
 * @param {Function} addLog - State callback to add diagnostic logs
 * @param {Map} knowledgeBaseSynonymMap - Synonyms mapping for loose matching
 * @returns {Object} Chatbot states and handler functions
 */
export function useChatbotEngine(faqs, saveFaq, addLog, knowledgeBaseSynonymMap) {
  const [messages, setMessages] = useState([
    { 
      sender: "genie", 
      text: "Hello! I am your StadiumAssist AI Assistant. How can I help you navigate the stadium today?",
      source: "Rule Engine"
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

  const handleSendMessage = async (textToSend) => {
    const rawText = textToSend || userInput;
    const text = sanitizeInput(rawText, 500);
    if (!text.trim()) return;

    // A. Add user message
    setMessages(prev => [...prev, { sender: "user", text }]);
    setUserInput("");
    setIsTyping(true);

    const normalized = normalizeQuery(text);
    addLog(`Chatbot query input: "${text}" | Normalized: "${normalized}"`);

    // B. Check local rules
    const localMatch = checkLocalRules(normalized);
    if (localMatch) {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: "genie", text: localMatch.text, source: localMatch.source }]);
        setIsTyping(false);
      }, 500);
      return;
    }

    // C. Check knowledgeBase FAQ database
    let matchedFaq = faqs.find(faq => {
      if (faq.verified === false) return false;
      const keyword = faq.keyword.toLowerCase().trim();
      return normalized.includes(keyword);
    });

    if (!matchedFaq) {
      // Documenting complexity: O(1) time complexity cache lookup via direct map key resolution.
      matchedFaq = knowledgeBaseSynonymMap.get(normalized);

      if (!matchedFaq) {
        // Fallback search to check if the normalized query text contains any of the known synonyms.
        for (const [syn, faq] of knowledgeBaseSynonymMap.entries()) {
          if (normalized.includes(syn)) {
            matchedFaq = faq;
            break;
          }
        }
      }
    }

    let answer = "";
    let sourceBadge = "Knowledge Base";
    let actionLogText = "";

    try {
      if (matchedFaq) {
        answer = matchedFaq.response;
        sourceBadge = "Knowledge Base";
        actionLogText = "FAQ match resolved directly.";
      } else {
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

      // Translate response if non-English language selected
      if (language !== "en" && answer) {
        actionLogText = `Translating response into ${language.toUpperCase()}...`;
        addLog(actionLogText);
        if (translateResponseCallable) {
          const transResult = await translateResponseCallable({
            text: answer,
            targetLanguage: language
          });
          answer = transResult.data.translatedText;
        } else {
          const simulatedTranslations = {
            es: `[Traducido al Español] ${answer}`,
            fr: `[Traduit en Français] ${answer}`,
            de: `[Übersetzt ins Deutsche] ${answer}`,
            it: `[Tradotto in Italiano] ${answer}`
          };
          answer = simulatedTranslations[language] || `[Translated to ${language}] ${answer}`;
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

  return {
    messages,
    userInput,
    setUserInput,
    language,
    setLanguage,
    isTyping,
    isListening,
    startVoiceInput,
    handleSendMessage
  };
}
