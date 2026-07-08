import React from "react";
import { Send, Loader2, Mic, MicOff, Cpu, BookOpen, Sparkles, ShieldAlert } from "lucide-react";

/**
 * ChatbotPanel component handles the chatbot messaging interface.
 * 
 * @param {Object} props
 * @param {Array} props.messages - Active conversation messages
 * @param {string} props.userInput - Message string typed in input
 * @param {Function} props.setUserInput - Setter for message input state
 * @param {string} props.language - Selected translation target language
 * @param {Function} props.setLanguage - Setter for target language state
 * @param {boolean} props.isTyping - AI concourse resolver status
 * @param {boolean} props.isListening - Microphone audio capture active status
 * @param {Function} props.onVoiceInput - Microphone start audio trigger callback
 * @param {Function} props.onSendMessage - Form message dispatcher callback
 * @param {Array} props.quickReplies - Dynamic suggestion prompts lists
 */
export function ChatbotPanel({
  messages,
  userInput,
  setUserInput,
  language,
  setLanguage,
  isTyping,
  isListening,
  onVoiceInput,
  onSendMessage,
  quickReplies
}) {
  return (
    <div style={styles.chatWrapper}>
      <div>
        <div style={styles.topBar}>
          <h3 style={styles.chatTitle}>Live Support Chat</h3>
          <div style={styles.flexCenter}>
            <label htmlFor="chat-lang-select" className="input-label" style={styles.langLabel}>Language:</label>
            <select id="chat-lang-select" className="form-input" style={styles.langSelect} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English (Default)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
              <option value="it">Italiano (Italian)</option>
            </select>
          </div>
        </div>

        <div style={styles.messageBox}>
          {messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            return (
              <div 
                key={index}
                style={{
                  ...styles.bubble,
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  background: isUser ? "#2563eb" : "#e0f2fe",
                  color: isUser ? "#ffffff" : "#0f172a",
                  borderRadius: isUser ? "14px 14px 0 14px" : "14px 14px 14px 0",
                  boxShadow: isUser ? "0 4px 10px rgba(99, 102, 241, 0.2)" : "none"
                }}
              >
                <div>{msg.text}</div>
                {!isUser && msg.source && (
                  <span style={{
                    ...styles.badge,
                    color: msg.source === "Rule Engine" ? "var(--color-amber)" : msg.source === "Knowledge Base" ? "var(--color-cyan)" : "var(--color-purple)",
                    borderColor: msg.source === "Rule Engine" ? "rgba(245, 158, 11, 0.3)" : msg.source === "Knowledge Base" ? "rgba(6, 182, 212, 0.3)" : "rgba(168, 85, 247, 0.3)"
                  }}>
                    {msg.source === "Rule Engine" && <Cpu size={10} style={styles.badgeIcon} />}
                    {msg.source === "Knowledge Base" && <BookOpen size={10} style={styles.badgeIcon} />}
                    {msg.source === "Gemini AI" && <Sparkles size={10} style={styles.badgeIcon} />}
                    {msg.source}
                  </span>
                )}
              </div>
            );
          })}
          {isTyping && (
            <div style={styles.typingBox}>
              <Loader2 size={16} className="animate-spin" style={styles.spin} />
              <span style={{ fontSize: "0.85rem" }}>Genie is thinking...</span>
            </div>
          )}
        </div>

        <div style={styles.quickRepliesBox}>
          {quickReplies.map((qr, idx) => (
            <button 
              key={idx}
              onClick={() => onSendMessage(qr.query)}
              style={{
                ...styles.chip,
                background: qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.1)" : "rgba(255, 255, 255, 0.04)",
                borderColor: qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.3)" : "var(--border-glass)",
                color: qr.text === "Emergency Help" ? "var(--color-rose)" : "var(--text-secondary)"
              }}
              onMouseOver={(e) => { 
                e.currentTarget.style.background = qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.2)" : "rgba(255, 255, 255, 0.08)"; 
                e.currentTarget.style.borderColor = qr.text === "Emergency Help" ? "var(--color-rose)" : "var(--color-cyan)"; 
              }}
              onMouseOut={(e) => { 
                e.currentTarget.style.background = qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.1)" : "rgba(255, 255, 255, 0.04)"; 
                e.currentTarget.style.borderColor = qr.text === "Emergency Help" ? "rgba(244, 63, 94, 0.3)" : "var(--border-glass)"; 
              }}
            >
              {qr.text === "Emergency Help" && <ShieldAlert size={12} />}
              {qr.text}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.inputBar}>
        <input 
          type="text" 
          className="form-input" 
          placeholder={isListening ? "Listening... Speak now." : "Ask anything (e.g. 'Where is the washroom?')..."} 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
          disabled={isTyping || isListening}
          aria-label="Chat input query"
        />

        <button 
          onClick={onVoiceInput} 
          className={`interactive-btn ${isListening ? 'danger' : 'secondary'}`} 
          style={{ 
            ...styles.micBtn,
            borderColor: isListening ? "var(--color-rose)" : "var(--border-glass)",
            animation: isListening ? "pulse-border 1s infinite alternate" : "none",
            background: isListening ? "linear-gradient(135deg, var(--color-rose) 0%, #b91c1c 100%)" : "var(--bg-tertiary)"
          }}
          title="Speak to Genie"
          disabled={isTyping}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button 
          onClick={() => onSendMessage()} 
          className="interactive-btn"
          style={{ padding: "12px", borderRadius: "12px" }}
          disabled={isTyping || isListening || !userInput.trim()}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

const styles = {
  chatWrapper: { display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" },
  chatTitle: { fontSize: "1.1rem", fontWeight: 700, color: "var(--color-cyan)" },
  flexCenter: { display: "flex", alignItems: "center", gap: "8px" },
  langLabel: { marginBottom: 0, fontSize: "0.75rem" },
  langSelect: { padding: "4px 8px", fontSize: "0.75rem", width: "auto" },
  messageBox: { 
    height: "360px", overflowY: "auto", background: "rgba(10, 14, 26, 0.4)", 
    border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "16px", 
    display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" 
  },
  bubble: {
    maxWidth: "80%", padding: "10px 14px", fontSize: "0.9rem", lineHeight: "1.4",
    whiteSpace: "pre-line", position: "relative", display: "flex", flexDirection: "column", gap: "6px"
  },
  badge: {
    alignSelf: "flex-end", fontSize: "0.65rem", fontWeight: 600, padding: "2px 6px",
    borderRadius: "4px", border: "1px solid", textTransform: "uppercase",
    letterSpacing: "0.02em", marginTop: "4px", background: "rgba(255, 255, 255, 0.02)"
  },
  badgeIcon: { marginRight: "4px", verticalAlign: "middle" },
  typingBox: { display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", background: "var(--bg-tertiary)", padding: "10px 14px", borderRadius: "14px 14px 14px 0", color: "var(--text-secondary)" },
  spin: { animation: "spin 1s linear infinite" },
  quickRepliesBox: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", overflowX: "auto", whiteSpace: "nowrap", paddingBottom: "4px" },
  chip: {
    border: "1px solid", padding: "6px 12px", borderRadius: "20px",
    fontSize: "0.75rem", cursor: "pointer", transition: "var(--transition)",
    display: "flex", alignItems: "center", gap: "4px"
  },
  inputBar: { display: "flex", gap: "10px", alignItems: "center" },
  micBtn: { padding: "12px", borderRadius: "12px" }
};
