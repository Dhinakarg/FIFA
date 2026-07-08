/**
 * Normalizes user queries by converting to lowercase, removing punctuation, 
 * and applying common synonyms for restrooms, gates, and concessions.
 * 
 * @param {string} text - Raw input query
 * @returns {string} Normalized query string
 */
export const normalizeQuery = (text) => {
  let norm = text.toLowerCase().trim();
  norm = norm.replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "");

  const synonymMap = {
    "washroom": "toilets",
    "restroom": "toilets",
    "toilet": "toilets",
    "wc": "toilets",
    "bathroom": "toilets",
    "latrine": "toilets",
    "entrance": "gate",
    "door": "gate",
    "ingress": "gate",
    "access": "gate",
    "gateways": "gate",
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
 * Checks local rules for greetings, thanks, or safety hazards prior to Firestore lookups.
 * 
 * @param {string} normalizedQuery - Normalized query string
 * @returns {Object|null} Matching response and source object, or null
 */
export const checkLocalRules = (normalizedQuery) => {
  const q = normalizedQuery.toLowerCase();
  
  if (q.includes("emergency") || q.includes("fire") || q.includes("injury") || q.includes("danger") || q.includes("police") || q.includes("evacuate") || q.includes("hurt") || q.includes("medical emergency")) {
    return {
      text: "⚠️ CRITICAL SAFETY RULE INSTRUCTION: If you are in immediate danger or witness an active emergency, please evacuate calmly through the nearest exit gate. Report safety hazards immediately to the nearest Security Steward (wearing high-visibility yellow jackets) or dial local emergency services (911/112).",
      source: "Rule Engine"
    };
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey") || q.includes("greetings") || q.includes("who are you")) {
    return {
      text: "Hello! I am StadiumAssist, your interactive stadium operations assistant. You can ask me questions about gates, washrooms, concessions, or parking. I can also translate answers into multiple languages!",
      source: "Rule Engine"
    };
  }

  if (q.includes("thank you") || q.includes("thanks") || q.includes("awesome") || q.includes("perfect")) {
    return {
      text: "You're very welcome! I'm here to ensure your stadium visit is safe and pleasant. Enjoy the event!",
      source: "Rule Engine"
    };
  }

  return null;
};
