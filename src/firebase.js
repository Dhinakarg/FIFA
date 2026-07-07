import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

// Web app's Firebase configuration (loaded from Vite environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let db = null;
let auth = null;
let functions = null;
let isFirebaseSupported = false;
let askGenieCallable = null;
let translateResponseCallable = null;
let generateGateSummaryCallable = null;
let generateTacticalDispatchCallable = null;
let classifyEmergencyCallable = null;
let generateStadiumReportCallable = null;
let summarizeFeedbackCallable = null;

// Check if we have valid-looking config keys (at least apiKey and projectId should be present)
const hasValidConfig = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "undefined" && 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "undefined";

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    functions = getFunctions(app);
    askGenieCallable = httpsCallable(functions, "askGenie");
    translateResponseCallable = httpsCallable(functions, "translateResponse");
    generateGateSummaryCallable = httpsCallable(functions, "generateGateSummary");
    generateTacticalDispatchCallable = httpsCallable(functions, "generateTacticalDispatch");
    classifyEmergencyCallable = httpsCallable(functions, "classifyEmergency");
    generateStadiumReportCallable = httpsCallable(functions, "generateStadiumReport");
    summarizeFeedbackCallable = httpsCallable(functions, "summarizeFeedback");
    isFirebaseSupported = true;
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.warn("Failed to initialize Firebase SDK, falling back to Local Simulation Mode:", error);
  }
} else {
  console.log("No Firebase config found in environment. Running in Local Simulation Mode.");
}

export { 
  db, 
  auth, 
  functions, 
  askGenieCallable, 
  translateResponseCallable, 
  generateGateSummaryCallable, 
  generateTacticalDispatchCallable, 
  classifyEmergencyCallable, 
  generateStadiumReportCallable,
  summarizeFeedbackCallable,
  isFirebaseSupported 
};


