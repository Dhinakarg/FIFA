const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

// 1. predictQueueTimes: HTTP Callable function to predict queue wait times
exports.predictQueueTimes = functions.https.onCall(async (data, context) => {
  const gateId = data.gateId || "gate-a";
  const currentCount = data.currentCount || 150;
  const processingRate = data.processingRate || 10; // fans processed per minute

  // Simple prediction: wait time (mins) = current count / processing rate
  const estimatedWaitMinutes = Math.ceil(currentCount / processingRate);

  let status = "low";
  if (estimatedWaitMinutes > 15) status = "medium";
  if (estimatedWaitMinutes > 30) status = "high";

  return {
    gateId,
    estimatedWaitMinutes,
    status,
    timestamp: new Date().toISOString()
  };
});

// 2. onIncidentReported: Firestore trigger on incidents collection creation
exports.onIncidentReported = functions.firestore
  .document("incidents/{incidentId}")
  .onCreate(async (snapshot, context) => {
    const incidentData = snapshot.data();
    const incidentId = context.params.incidentId;

    console.log(`New incident reported: ${incidentId}`, incidentData);

    // Automate task creation for staff when an incident is reported
    const taskRef = admin.firestore().collection("tasks").doc();
    
    let assignedRole = "maintenance";
    if (incidentData.type === "security" || incidentData.type === "medical") {
      assignedRole = "security";
    }

    await taskRef.set({
      title: `Dispatch for Incident: ${incidentData.title || "Spillage/Maintenance"}`,
      description: `Reported Location: ${incidentData.location || "Unknown"}. Details: ${incidentData.description || "No details provided."}`,
      status: "pending",
      assignedRole: assignedRole,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      incidentId: incidentId
    });

    return { success: true };
  });

// 3. generateStadiumReport: HTTPS callable to generate operational briefings via Gemini (DSS Support)
exports.generateStadiumReport = functions.https.onCall(async (data, context) => {
  const crowd = data.crowd || { attendance: 41000, capacity: 50000 };
  const incidents = data.incidents || [];
  const gates = data.gates || [];
  const volunteers = data.volunteers || [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    console.warn("GEMINI_API_KEY is not configured. Falling back to local simulation mode.");
    
    const activeIncs = incidents.filter(i => i.status !== "resolved");
    const activeGates = gates.filter(g => (g.currentCount / g.capacity) > 0.8);
    const availableVols = volunteers.filter(v => v.status === "available");

    let text = `**OPERATIONAL SUMMARY (DSS SIMULATION)**\n\n`;
    text += `* **Crowd Occupancy**: ${Math.round((crowd.attendance / crowd.capacity) * 100)}% load (${crowd.attendance.toLocaleString()} inside).\n`;
    text += `* **Gates Status**: ${activeGates.length} gate(s) experiencing high queue loads (limit > 80%).\n`;
    text += `* **Incident Log**: ${activeIncs.length} unresolved incidents currently in the queue.\n`;
    text += `* **Staff Strength**: ${availableVols.length} active volunteers available for deployment.\n\n`;
    text += `* **Recommendation**: Direct parking ushers to guide traffic away from congested gate turnstiles. Deploy paramedic reserves to active medical concourse points.`;
    
    return {
      reportText: text,
      isSimulated: true
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the chief event operations director at a major stadium.
We have the following real-time data:
- Crowd Attendance: ${crowd.attendance} out of ${crowd.capacity} total seats.
- Gate Loads: ${JSON.stringify(gates)}
- Active Unresolved Incidents: ${JSON.stringify(incidents)}
- Volunteer Force Availability: ${JSON.stringify(volunteers)}

Provide a concise, professional operational briefing (maximum 4 sentences) for the stadium executives. Detail overall crowd ingress rates, highlight critical bottlenecks at gates or active safety incidents, and summarize resource readiness. Do not add any greeting or meta-explanation, return ONLY the raw briefing text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    return {
      reportText: responseText,
      isSimulated: false
    };
  } catch (error) {
    console.error("Gemini generateStadiumReport error:", error);
    return {
      reportText: `SYSTEM WARNING: High crowd density detected stadium-wide. Staff must proceed with standard sector control procedures.`,
      error: error.message,
      isSimulated: true
    };
  }
});


// 4. translateResponse: HTTPS callable to translate answers via Gemini
exports.translateResponse = functions.https.onCall(async (data, context) => {
  const text = data.text;
  const targetLanguage = data.targetLanguage || "es";

  if (!text) {
    throw new functions.https.HttpsError("invalid-argument", "Text to translate must be provided.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    console.warn("GEMINI_API_KEY is not configured. Falling back to local simulation mode.");
    const simulatedTranslations = {
      es: `[Traducido al Español] ${text}`,
      fr: `[Traduit en Français] ${text}`,
      de: `[Übersetzt ins Deutsche] ${text}`,
      it: `[Tradotto in Italiano] ${text}`
    };
    return {
      translatedText: simulatedTranslations[targetLanguage] || `[Translated to ${targetLanguage}] ${text}`,
      isSimulated: true
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Translate the following stadium information response into the language specified. Do not add any greeting or meta-explanation, return ONLY the direct translation:\nTarget Language: ${targetLanguage}\nText: ${text}`;
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    return {
      translatedText: responseText,
      isSimulated: false
    };
  } catch (error) {
    console.error("Gemini translation error:", error);
    return {
      translatedText: `[Translation Fallback] ${text}`,
      error: error.message,
      isSimulated: true
    };
  }
});

// Simple in-memory sliding window rate limiter state for askGenie
const askGenieRateLimits = {};

/**
 * Checks request rate limit constraints for a specific client identifier.
 * 
 * @param {string} identifier - Unique client identifier (UID or IP address)
 * @param {number} maxRequests - Maximum requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if within limits, False if rate limit exceeded
 */
function checkRateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  if (!askGenieRateLimits[identifier]) {
    askGenieRateLimits[identifier] = [];
  }
  askGenieRateLimits[identifier] = askGenieRateLimits[identifier].filter(
    timestamp => now - timestamp < windowMs
  );
  if (askGenieRateLimits[identifier].length >= maxRequests) {
    return false;
  }
  askGenieRateLimits[identifier].push(now);
  return true;
}

/**
 * Cloud Function - HTTPS Callable (askGenie)
 * Processes fan queries via the Google Gemini generative model, falling back to a structured 
 * local simulation response if the API key is not configured.
 * 
 * @param {Object} data - Parameters sent from the client
 * @param {string} data.query - Input question or request string from the user
 * @param {Object} context - Callable context parameters (auth, token details)
 * @returns {Promise<Object>} Object containing the response text
 * @throws {functions.https.HttpsError} If data query is missing or empty
 */
exports.askGenie = functions.https.onCall(async (data, context) => {
  const queryText = data.query;

  if (!queryText) {
    throw new functions.https.HttpsError("invalid-argument", "Query must be provided.");
  }

  // Rate Limiting: Max 5 requests per minute
  const identifier = (context.auth && context.auth.uid) || (context.rawRequest && context.rawRequest.ip) || "anonymous";
  if (!checkRateLimit(identifier, 5, 60000)) {
    throw new functions.https.HttpsError(
      "resource-exhausted",
      "Too many requests. Please wait a minute before querying Genie again."
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  let answer = "";
  let isSimulated = false;

  const systemPrompt = `You are StadiumGenie, an advanced AI concierge assistant located inside a stadium.
We have the following verified data about this stadium:
- 4 Ingress Gates: Gate A (West perimeter, next to Red parking lot), Gate B (North side, next to VIP lobby/fast track), Gate C (South side, close to trains shuttle), Gate D (East side, adjacent to buses).
- Concession stands: Eastern Grill (burgers, fries, beer, halal chicken tenders), Arena Drinks & Snacks (popcorn, soft drinks, nachos, gluten-free snacks), Southern Pizza Hub (pizzas, garlic knots), VIP Champagne Bar (premium liquor, wine, cheese boards).
- Washrooms: North Plaza Washrooms (includes baby changing tables), South Concourse restrooms, East Upper restrooms.
- Medical First Aid outposts: Section 104 (West Concourse), Section 228 (East Concourse). AEDs are at all Gates and First Aid stations.
- Customer Help Hub Center: Section 101 (Lost and found, stroller storage).
- Cashless facility: We accept credit cards, Apple Pay, Google Pay. No cash.
- General Rules: No smoking or vaping inside. Re-entry is not permitted. Bag policy requires clear bags under 12x6x12 inches.

Provide a short, direct, polite answer (maximum 3 sentences) to the following user query. If you cannot answer it based on this metadata, give a helpful fallback to visit Section 101.
User Query: "${queryText}"`;

  if (!apiKey || apiKey === "undefined") {
    console.warn("GEMINI_API_KEY is not configured. Falling back to local simulation mode.");
    isSimulated = true;
    
    const lowerQuery = queryText.toLowerCase();
    if (lowerQuery.includes("parking") || lowerQuery.includes("car")) {
      answer = "General parking is available in Lot Red (Gate A) and Lot Blue (Gate D) for $25. We recommend pre-booking your spot online.";
    } else if (lowerQuery.includes("ticket") || lowerQuery.includes("barcode")) {
      answer = "For ticketing issues or barcode scans that fail, please visit the ticketing resolution windows located at Gates A and C.";
    } else if (lowerQuery.includes("beer") || lowerQuery.includes("alcohol") || lowerQuery.includes("drink")) {
      answer = "Alcohol is served at the Eastern Grill, VIP Bar, and kiosks. All alcohol sales will cease at the 75th minute of the event.";
    } else if (lowerQuery.includes("wifi") || lowerQuery.includes("internet")) {
      answer = "Free public Wi-Fi is available stadium-wide. Connect to the network named '#StadiumGenieFree' and follow the portal instructions.";
    } else {
      answer = `Based on current stadium telemetry, we recommend checking the Interactive Map or visiting the Customer Help Hub at Section 101 for immediate assistance with your query: "${queryText}".`;
    }
  } else {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(systemPrompt);
      answer = result.response.text().trim();
    } catch (error) {
      console.error("Gemini askGenie error:", error);
      answer = `Our systems are experiencing high traffic. Please proceed to the nearest Customer Help Hub at Section 101 for assistance.`;
      isSimulated = true;
    }
  }

  // Write the generated Q&A back to the knowledgeBase collection for staff review
  try {
    const docRef = admin.firestore().collection("knowledgeBase").doc();
    await docRef.set({
      keyword: queryText.toLowerCase().trim(),
      intent: "general_ai",
      synonyms: [],
      response: answer,
      language: "en",
      source: "AI-generated",
      verified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Saved new unverified AI response to knowledgeBase. Doc ID: ${docRef.id}`);
  } catch (dbError) {
    console.error("Failed to write AI-generated response back to Firestore:", dbError);
  }

  return {
    response: answer,
    isSimulated
  };
});

// 6. generateGateSummary: HTTPS callable to generate operational advisory when 2+ gates are congested
exports.generateGateSummary = functions.https.onCall(async (data, context) => {
  const gates = data.gates;

  if (!gates || !Array.isArray(gates)) {
    throw new functions.https.HttpsError("invalid-argument", "Gates list must be provided.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    console.warn("GEMINI_API_KEY is not configured. Falling back to local simulation mode.");
    
    const congestedGates = gates.filter(g => (g.currentCount / g.capacity) > 0.8).map(g => g.name);
    const freeGates = gates.filter(g => (g.currentCount / g.capacity) <= 0.8).map(g => g.name);
    
    return {
      summary: `OPERATIONAL ADVISORY (SIMULATION): Heavy congestion detected at ${congestedGates.join(" and ")} exceeding 80% limit. It is recommended to immediately divert incoming ticketing flows to ${freeGates.join(" or ")} and alert field operations crew to coordinate turnstiles.`,
      isSimulated: true
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the chief operations advisor at a stadium.
We have the following live gate telemetry:
${JSON.stringify(gates, null, 2)}

Provide a concise, professional operational advisory summary (maximum 3 sentences) for the stadium operations team. Focus on which gates are congested (occupancy > 80%) and suggest routing recommendations to less congested gates. Do not add any greeting or meta-explanation, return ONLY the raw advisory text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    return {
      summary: responseText,
      isSimulated: false
    };
  } catch (error) {
    console.error("Gemini generateGateSummary error:", error);
    return {
      summary: `SYSTEM ADVISORY: Multiple gates are experiencing high congestion loads. Please coordinate with local stewards to manually redistribute incoming fan columns.`,
      error: error.message,
      isSimulated: true
    };
  }
});

// 7. generateTacticalDispatch: HTTPS callable to analyze multiple incidents or unstructured reports via Gemini
exports.generateTacticalDispatch = functions.https.onCall(async (data, context) => {
  const activeIncidents = data.activeIncidents || [];
  const unstructuredText = data.unstructuredText || "";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    console.warn("GEMINI_API_KEY is not configured. Falling back to local simulation mode.");
    
    let summary = `[TACTICAL DISPATCH ADVISORY - SIMULATED]\n\n`;
    summary += `### 1. Prioritized Action Summary\n`;
    summary += `- Address security issues immediately to maintain crowd control.\n`;
    if (activeIncidents.some(i => i.type === "medical")) {
      summary += `- Clear concourse path for emergency medical responders.\n`;
    }
    summary += `- Instruct stewards in affected zones to implement local checkpoints.\n\n`;
    
    summary += `### 2. Resource Recommendations\n`;
    summary += `- Deploy 2 Security Teams, 1 Medical Outpost Unit, and 1 Maintenance Dispatch crew.\n\n`;
    
    summary += `### 3. Draft PA Announcement\n`;
    summary += `*"Attention all guests: We are resolving a minor incident in the concourse. Please follow instructions from nearby stewards. Operations continue normally."*`;
    
    return {
      dispatchReport: summary,
      isSimulated: true
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the chief emergency response commander at a large stadium.
We have these active unresolved incidents:
${JSON.stringify(activeIncidents, null, 2)}
Unstructured free-text details: "${unstructuredText}"

Based on the above, generate a detailed emergency response analysis. Group it strictly into these three sections (use markdown headings):
1. PRIORITIZED ACTION SUMMARY: Step-by-step immediate steps for the operations dispatch team.
2. RESOURCE RECOMMENDATIONS: Specific personnel, equipment, or outposts to deploy.
3. DRAFT PA COMMUNICATION ANNOUNCEMENT: A draft announcement text to read over the PA speaker system to guide or reassure the crowd.

Do not write any greeting or meta-explanation. Return ONLY the raw analysis text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    return {
      dispatchReport: responseText,
      isSimulated: false
    };
  } catch (error) {
    console.error("Gemini generateTacticalDispatch error:", error);
    return {
      dispatchReport: `SYSTEM EXCEPTION: Emergency responders are currently active. Direct all support personnel to follow standard radio protocol.`,
      error: error.message,
      isSimulated: true
    };
  }
});

// 8. classifyEmergency: HTTPS callable to classify unstructured emergency reports into predefined types via Gemini
exports.classifyEmergency = functions.https.onCall(async (data, context) => {
  const description = data.description;

  if (!description) {
    throw new functions.https.HttpsError("invalid-argument", "Description must be provided.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined") {
    console.warn("GEMINI_API_KEY is not configured. Falling back to local keyword rules.");
    
    const text = description.toLowerCase();
    if (text.includes("fire") || text.includes("smoke") || text.includes("burn")) return { type: "fire" };
    if (text.includes("fight") || text.includes("hit") || text.includes("beat") || text.includes("weapon")) return { type: "fight" };
    if (text.includes("child") || text.includes("kid") || text.includes("boy") || text.includes("girl") || text.includes("lost")) return { type: "lost child" };
    if (text.includes("power") || text.includes("light") || text.includes("outage") || text.includes("dark")) return { type: "power failure" };
    return { type: "medical" }; // default fallback
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Classify the following emergency report description into exactly one of these five categories:
- medical
- fire
- lost child
- fight
- power failure

Return ONLY the lowercase category name and nothing else (do not include punctuation or explanations).
Report: "${description}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim().toLowerCase();

    const valid = ["medical", "fire", "lost child", "fight", "power failure"];
    const matched = valid.includes(responseText) ? responseText : "medical";

    return {
      type: matched,
      isSimulated: false
    };
  } catch (error) {
    console.error("Gemini classifyEmergency error:", error);
    return {
      type: "medical",
      error: error.message,
      isSimulated: true
    };
  }
});

// 9. summarizeFeedback: HTTPS callable to summarize guest reviews/comments in Firestore via Gemini
exports.summarizeFeedback = functions.https.onCall(async (data, context) => {
  const feedbacks = [];
  try {
    const snapshot = await admin.firestore().collection("feedback").get();
    snapshot.forEach(doc => feedbacks.push(doc.data()));
  } catch (err) {
    console.error("Firestore feedback fetch error:", err);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "undefined" || feedbacks.length === 0) {
    console.warn("GEMINI_API_KEY is not configured or no feedback found. Returning simulated summary.");
    
    const list = feedbacks.length > 0 ? feedbacks : [
      { rating: 5, comment: "Loved the easy parking access at Lot Red." },
      { rating: 2, comment: "Wait times at Eastern Grill concession was 30 minutes! Unacceptable." },
      { rating: 4, comment: "Staff was friendly, security check at Gate B was slow though." },
      { rating: 5, comment: "Wi-fi worked great throughout the match." },
      { rating: 1, comment: "I got lost looking for Section 228. Need better signs." }
    ];

    const avgRating = (list.reduce((acc, curr) => acc + curr.rating, 0) / list.length).toFixed(1);

    let summary = `### GUEST FEEDBACK ANALYTICS (SIMULATED)\n`;
    summary += `*Average Guest Rating: **${avgRating} / 5.0** (${list.length} total reviews)*\n\n`;
    summary += `#### 1. Top Praises\n`;
    summary += `- High praise for the free public Wi-Fi speed and availability.\n`;
    summary += `- Staff volunteers received positive remarks for friendly service.\n\n`;
    summary += `#### 2. Top Complaints\n`;
    summary += `- Extreme queue congestion at food concession stands, particularly Eastern Grill.\n`;
    summary += `- Clear directional signs are lacking for upper concourses (e.g. Section 228).\n\n`;
    summary += `#### 3. Suggested Improvements\n`;
    summary += `- Deploy line coordinators to concessions to pre-take orders and speed up processing.\n`;
    summary += `- Install larger, high-visibility signage indicating washroom and first-aid routes.`;

    return {
      summaryText: summary,
      isSimulated: true
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a hospitality analytics expert at a stadium.
We have collected the following real guest feedback ratings and comments:
${JSON.stringify(feedbacks, null, 2)}

Provide an operational hospitality report grouped strictly into these sections (using markdown headings):
1. TOP PRAISES: Highlights of what guests liked.
2. TOP COMPLAINTS: Primary issues or bottlenecks reported by guests.
3. SUGGESTED IMPROVEMENTS: Specific suggestions to address complaints.

Also, calculate the average rating from the data and state it at the top.
Do not add any greeting or meta-explanation, return ONLY the raw analysis report text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    return {
      summaryText: responseText,
      isSimulated: false
    };
  } catch (error) {
    console.error("Gemini summarizeFeedback error:", error);
    return {
      summaryText: `SYSTEM REPORT: Feedback logs show general satisfaction. Concession delays remain a minor ticket priority.`,
      error: error.message,
      isSimulated: true
    };
  }
});




