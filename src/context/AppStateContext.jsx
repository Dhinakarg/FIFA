/* eslint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isFirebaseSupported, db, auth } from "../firebase";
import { useFirestoreCollection } from "../hooks/useFirestoreCollection";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  getDoc,
  setDoc,
  serverTimestamp, 
  orderBy,
  limit
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  initialMockIncidents, initialMockTasks, initialMockQueues, 
  initialMockGates, initialMockFeedbacks, initialMockFaqs, 
  initialMockFacilities, initialMockVolunteers 
} from "../data/mockData";

const AppStateContext = createContext();

export const useAppState = () => useContext(AppStateContext);

export const AppStateProvider = ({ children }) => {
  // Global States
  const [userRole, setUserRole] = useState("admin"); 
  const [currentUser, setCurrentUser] = useState(null);
  const [evacuationAlarm, setEvacuationAlarm] = useState(false);
  const [activeEvent, setActiveEvent] = useState({
    id: "evt-1",
    name: "Grand Championship Final",
    attendance: 41250,
    capacity: 50000,
    startTime: "20:00",
    date: "Today",
    vipOccupancy: 82
  });

  // Local State collections (synced with Firestore or fallback simulation mode)
  const [incidents, setIncidents] = useFirestoreCollection("incidents", () => [orderBy("createdAt", "desc"), limit(20)], initialMockIncidents);
  const [tasks, setTasks] = useFirestoreCollection("tasks", () => [orderBy("createdAt", "desc"), limit(20)], initialMockTasks);
  const [queues, setQueues] = useFirestoreCollection("queues", () => [limit(20)], initialMockQueues);
  const [gates, setGates] = useFirestoreCollection("gates", () => [limit(20)], initialMockGates);
  const [feedbacks, setFeedbacks] = useFirestoreCollection("feedback", () => [limit(20)], initialMockFeedbacks);
  const [faqs, setFaqs] = useFirestoreCollection("knowledgeBase", () => [limit(20)], initialMockFaqs);
  const [facilities, setFacilities] = useFirestoreCollection("facilities", () => [limit(20)], initialMockFacilities);
  const [volunteers, setVolunteers] = useFirestoreCollection("volunteers", () => [limit(20)], initialMockVolunteers);

  const [systemLogs, setSystemLogs] = useState([
    { time: "20:55:12", event: "Admin dashboard initialized in Simulation Mode" },
    { time: "20:56:04", event: "Crowd telemetry simulated sensor check OK" },
    { time: "20:57:30", event: "Real-time queue update trigger fired" }
  ]);

  const addLog = useCallback((message) => {
    const time = new Date().toTimeString().split(' ')[0];
    setSystemLogs(prev => [{ time, event: message }, ...prev.slice(0, 19)]);
  }, []);

  const reportIncident = useCallback(async (title, description, type, location, reportedBy = "Fan", severity = "Medium") => {
    const cleanTitle = (title || "").trim().replace(/<[^>]*>/g, "").slice(0, 100);
    const cleanDesc = (description || "").trim().replace(/<[^>]*>/g, "").slice(0, 1000);
    const cleanLoc = (location || "").trim().replace(/<[^>]*>/g, "").slice(0, 150);

    const newIncident = {
      title: cleanTitle,
      description: cleanDesc,
      type,
      location: cleanLoc,
      status: "pending",
      severity,
      reportedBy,
      createdAt: new Date().toISOString()
    };

    addLog(`Incident Reported: "${cleanTitle}" in ${cleanLoc} [Severity: ${severity}]`);

    if (isFirebaseSupported) {
      try {
        await addDoc(collection(db, "incidents"), {
          ...newIncident,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firestore Incident add error:", err);
      }
    } else {
      // Simulate Cloud Functions onIncidentReported trigger locally
      const mockId = `inc-${Date.now()}`;
      const incidentObject = { id: mockId, ...newIncident };
      
      setIncidents(prev => [incidentObject, ...prev]);

      // Automatically dispatch a staff task after a brief lag
      setTimeout(() => {
        let assignedRole = "maintenance";
        if (type === "security" || type === "medical") {
          assignedRole = "security";
        }
        const mockTaskId = `task-${Date.now()}`;
        setTasks(prev => [
          {
            id: mockTaskId,
            title: `Dispatch for Incident: ${cleanTitle}`,
            description: `Location: ${cleanLoc}. Details: ${cleanDesc}`,
            status: "pending",
            assignedRole: assignedRole,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
        addLog(`System Auto-Task Dispatched to ${assignedRole} for incident "${cleanTitle}"`);
      }, 1500);
    }
  }, [addLog, setIncidents, setTasks]);

  // Log Firebase status on mount
  useEffect(() => {
    if (isFirebaseSupported) {
      addLog("Firebase SDK active. Real-time Firestore listeners enabled via custom hooks.");
    } else {
      addLog("Firebase SDK disabled or unsupported. Operating in local Simulation Mode.");
    }
  }, [addLog]);

  // Background Simulation: periodically change queue times and logs to make app feel ALIVE
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Slightly fluctuate queue wait times
      setQueues(prevQueues => 
        prevQueues.map(q => {
          if (evacuationAlarm) {
            // Under evacuation, gate queue times shoot up or become invalid
            return { ...q, waitTime: q.type === "gate" ? 99 : 0, capacity: 100, status: "high" };
          }
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const newWait = Math.max(1, q.waitTime + delta);
          let status = "low";
          if (newWait > 15) status = "medium";
          if (newWait > 30) status = "high";
          return {
            ...q,
            waitTime: newWait,
            capacity: Math.min(100, Math.max(5, Math.ceil(newWait * 2 + (Math.random() * 10)))) ,
            status
          };
        })
      );

      // Fluctuate gate counts dynamically
      setGates(prevGates => 
        prevGates.map(g => {
          if (evacuationAlarm) {
            return { ...g, currentCount: g.capacity, status: "High" };
          }
          const delta = Math.floor(Math.random() * 100) - 40; // -40 to +60
          const newCount = Math.max(50, Math.min(g.capacity, g.currentCount + delta));
          const loadPercent = newCount / g.capacity;
          let status = "Low";
          if (loadPercent > 0.5) status = "Medium";
          if (loadPercent > 0.8) status = "High";
          return {
            ...g,
            currentCount: newCount,
            status
          };
        })
      );

      // 2. Slow increase in attendance until capacity is reached
      setActiveEvent(prev => {
        if (prev.attendance < prev.capacity && !evacuationAlarm) {
          const added = Math.floor(Math.random() * 25) + 5;
          return {
            ...prev,
            attendance: Math.min(prev.capacity, prev.attendance + added)
          };
        }
        return prev;
      });

      // 3. Occasional system logs
      const randomLogs = [
        "Sensors check: Gate A scanner throughput stable.",
        "Crowd flow analytics updated.",
        "Concession stand VIP sensor triggered.",
        "Telemetry heartbeat registered.",
        "Access control database synchronized."
      ];
      if (Math.random() > 0.7) {
        addLog(randomLogs[Math.floor(Math.random() * randomLogs.length)]);
      }

      // 4. Occasional random low-severity mock incidents spawner (purely scripted rules, no AI)
      if (Math.random() > 0.92 && !evacuationAlarm) {
        const types = ["medical", "lost child", "fight", "power failure", "maintenance"];
        const categories = {
          medical: ["Heat stroke Section 104", "Dehydration report Section 202", "Minor cut at Gate A"],
          "lost child": ["Child separated Section 112", "Parent seeking child Gate C"],
          fight: ["Altercation near food kiosk Section 118", "Loud verbal fight Section 204"],
          "power failure": ["Flickering lights Section 101 corridor", "Concession register offline"],
          maintenance: ["Water bottle spill Section 120 aisle", "Broken cup spill Zone D"]
        };
        const randomType = types[Math.floor(Math.random() * types.length)];
        const list = categories[randomType];
        const randomTitle = list[Math.floor(Math.random() * list.length)];
        const locations = ["Zone A (Concourse)", "Zone B (Concourse)", "Zone C (Seating)", "Zone D (Seating)", "Zone E (VIP Suites)"];
        const randomLoc = locations[Math.floor(Math.random() * locations.length)];
        
        reportIncident(
          randomTitle,
          "Simulated telemetry trigger sensor log.",
          randomType,
          randomLoc,
          "Simulation Sensor",
          "Low"
        );
      }

    }, 8000); // every 8 seconds

    return () => clearInterval(interval);
  }, [evacuationAlarm, gates, incidents, volunteers, addLog, reportIncident, setQueues, setGates]);

  // Actions
  const submitFeedback = async (rating, comment) => {
    const newFeedback = {
      rating: parseInt(rating),
      comment,
      createdAt: new Date().toISOString()
    };
    addLog(`Guest Feedback Submitted: ${rating} Stars`);
    if (isFirebaseSupported) {
      try {
        await addDoc(collection(db, "feedback"), {
          ...newFeedback,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firestore feedback add error:", err);
      }
    } else {
      setFeedbacks(prev => [newFeedback, ...prev]);
    }
  };

  const updateIncidentStatus = async (id, status) => {
    addLog(`Incident ${id} updated to status "${status}"`);
    if (isFirebaseSupported) {
      try {
        await updateDoc(doc(db, "incidents", id), { status });
      } catch (err) {
        console.error("Firestore Incident update error:", err);
      }
    } else {
      setIncidents(prev => 
        prev.map(inc => inc.id === id ? { ...inc, status } : inc)
      );
    }
  };

  const updateTaskStatus = async (id, status) => {
    addLog(`Task ${id} status changed to "${status}"`);
    if (isFirebaseSupported) {
      try {
        await updateDoc(doc(db, "tasks", id), { status });
      } catch (err) {
        console.error("Firestore Task update error:", err);
      }
    } else {
      setTasks(prev => 
        prev.map(task => task.id === id ? { ...task, status } : task)
      );
    }
  };

  useEffect(() => {
    if (isFirebaseSupported && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          addLog(`Firebase Auth: User authenticated (${user.email})`);
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            let role = "staff"; // default role is staff
            if (userDoc.exists()) {
              role = userDoc.data().role || "staff";
            } else {
              await setDoc(userDocRef, { email: user.email, role });
              addLog(`Created user profile doc in Firestore users collection.`);
            }
            setCurrentUser({ uid: user.uid, email: user.email, role });
          } catch (err) {
            console.error("Firestore user doc fetch error:", err);
            setCurrentUser({ uid: user.uid, email: user.email, role: "staff" });
          }
        } else {
          setCurrentUser(null);
        }
      });
      return () => unsubscribe();
    }
  }, [addLog]);

  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.role);
    } else {
      setUserRole("fan"); // Default to fan if signed out
    }
  }, [currentUser]);

  const loginWithEmail = async (email, password) => {
    addLog(`Attempting auth login for: ${email}`);
    if (isFirebaseSupported && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        addLog("Firebase Auth Login successful.");
      } catch (err) {
        addLog(`Firebase Auth Login failed: ${err.message}`);
        throw err;
      }
    } else {
      // Local simulated login fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          let simulatedRole = "staff";
          if (email.includes("admin")) simulatedRole = "admin";
          else if (email.includes("organizer")) simulatedRole = "organizer";
          else if (email.includes("fan")) simulatedRole = "fan";
          
          setCurrentUser({
            uid: `mock-user-${Date.now()}`,
            email: email,
            role: simulatedRole
          });
          addLog(`Simulated Login successful as role: ${simulatedRole.toUpperCase()}`);
          resolve();
        }, 1000);
      });
    }
  };

  const registerWithEmail = async (email, password, role = "staff") => {
    addLog(`Attempting auth registration for: ${email}`);
    if (isFirebaseSupported && auth) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", credential.user.uid), {
          email,
          role,
          createdAt: new Date().toISOString()
        });
        addLog(`Firebase Auth Registration successful with role: ${role}`);
      } catch (err) {
        addLog(`Firebase Auth Registration failed: ${err.message}`);
        throw err;
      }
    } else {
      // Local simulated registration fallback
      return new Promise((resolve) => {
        setTimeout(() => {
          setCurrentUser({
            uid: `mock-user-${Date.now()}`,
            email: email,
            role: role
          });
          addLog(`Simulated Registration successful with role: ${role.toUpperCase()}`);
          resolve();
        }, 1000);
      });
    }
  };

  const logout = async () => {
    addLog("Logging out authenticated session...");
    if (isFirebaseSupported && auth) {
      try {
        await signOut(auth);
        addLog("Firebase Auth Logged out successfully.");
      } catch (err) {
        console.error("Firebase Auth Logout error:", err);
      }
    } else {
      setCurrentUser(null);
      addLog("Simulated Session cleared.");
    }
  };

  const triggerEvacuationAlarm = (isActive) => {
    setEvacuationAlarm(isActive);
    if (isActive) {
      addLog("⚠️ EVACUATION ALARM ACTIVATED BY OPERATIONS CENTER ⚠️");
    } else {
      addLog("Evacuation alarm deactivated. Normal operations resumed.");
    }
  };

  const saveFaq = async (faq) => {
    const faqData = {
      keyword: faq.keyword,
      intent: faq.intent,
      synonyms: faq.synonyms || [],
      response: faq.response,
      language: faq.language || "en",
      source: faq.source || "manual",
      verified: faq.verified ?? true
    };

    if (faq.id) {
      addLog(`FAQ "${faq.keyword}" updated.`);
      if (isFirebaseSupported) {
        try {
          await updateDoc(doc(db, "knowledgeBase", faq.id), faqData);
        } catch (err) {
          console.error("Firestore FAQ update error:", err);
        }
      } else {
        setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, ...faqData } : f));
      }
    } else {
      addLog(`FAQ "${faq.keyword}" created.`);
      if (isFirebaseSupported) {
        try {
          await addDoc(collection(db, "knowledgeBase"), faqData);
        } catch (err) {
          console.error("Firestore FAQ create error:", err);
        }
      } else {
        const mockId = `faq-${Date.now()}`;
        setFaqs(prev => [{ id: mockId, ...faqData }, ...prev]);
      }
    }
  };

  const deleteFaq = async (faqId) => {
    addLog(`FAQ deletion triggered for ${faqId}`);
    if (isFirebaseSupported) {
      try {
        await deleteDoc(doc(db, "knowledgeBase", faqId));
      } catch (err) {
        console.error("Firestore FAQ delete error:", err);
      }
    } else {
      setFaqs(prev => prev.filter(f => f.id !== faqId));
    }
  };

  const saveFacility = async (fac) => {
    const facData = {
      name: fac.name,
      category: fac.category,
      description: fac.description,
      x: parseFloat(fac.x),
      y: parseFloat(fac.y)
    };

    if (fac.id) {
      addLog(`Facility "${fac.name}" updated.`);
      if (isFirebaseSupported) {
        try {
          await updateDoc(doc(db, "facilities", fac.id), facData);
        } catch (err) {
          console.error("Firestore Facility update error:", err);
        }
      } else {
        setFacilities(prev => prev.map(f => f.id === fac.id ? { ...f, ...facData } : f));
      }
    } else {
      addLog(`Facility "${fac.name}" created.`);
      if (isFirebaseSupported) {
        try {
          await addDoc(collection(db, "facilities"), facData);
        } catch (err) {
          console.error("Firestore Facility create error:", err);
        }
      } else {
        const mockId = `fac-${Date.now()}`;
        setFacilities(prev => [{ id: mockId, ...facData }, ...prev]);
      }
    }
  };

  const deleteFacility = async (facId) => {
    addLog(`Facility deletion triggered for ${facId}`);
    if (isFirebaseSupported) {
      try {
        await deleteDoc(doc(db, "facilities", facId));
      } catch (err) {
        console.error("Firestore Facility delete error:", err);
      }
    } else {
      setFacilities(prev => prev.filter(f => f.id !== facId));
    }
  };

  const saveGate = async (gate) => {
    const gateData = {
      name: gate.name,
      currentCount: parseInt(gate.currentCount || 0),
      capacity: parseInt(gate.capacity || 1000),
      status: gate.status || "Low"
    };

    if (gate.id) {
      addLog(`Gate "${gate.name}" updated.`);
      if (isFirebaseSupported) {
        try {
          await updateDoc(doc(db, "gates", gate.id), gateData);
        } catch (err) {
          console.error("Firestore Gate update error:", err);
        }
      } else {
        setGates(prev => prev.map(g => g.id === gate.id ? { ...g, ...gateData } : g));
      }
    } else {
      addLog(`Gate "${gate.name}" created.`);
      if (isFirebaseSupported) {
        try {
          await addDoc(collection(db, "gates"), gateData);
        } catch (err) {
          console.error("Firestore Gate create error:", err);
        }
      } else {
        const mockId = `gate-${Date.now()}`;
        setGates(prev => [{ id: mockId, ...gateData }, ...prev]);
      }
    }
  };

  const deleteGate = async (gateId) => {
    addLog(`Gate deletion triggered for ${gateId}`);
    if (isFirebaseSupported) {
      try {
        await deleteDoc(doc(db, "gates", gateId));
      } catch (err) {
        console.error("Firestore Gate delete error:", err);
      }
    } else {
      setGates(prev => prev.filter(g => g.id !== gateId));
    }
  };

  const triggerDemoScenario = async (scenarioKey) => {
    addLog(`Demo Mode: Scenario trigger "${scenarioKey.toUpperCase()}"`);

    if (scenarioKey === "crowd_rush") {
      const updatedGates = gates.map(g => {
        if (g.id === "gate-b") return { ...g, currentCount: 1420, status: "High" };
        if (g.id === "gate-c") return { ...g, currentCount: 1080, status: "High" };
        return g;
      });
      setGates(updatedGates);
      
      if (isFirebaseSupported) {
        try {
          await updateDoc(doc(db, "gates", "gate-b"), { currentCount: 1420, status: "High" });
          await updateDoc(doc(db, "gates", "gate-c"), { currentCount: 1080, status: "High" });
        } catch (err) {
          console.error("Firestore gate update failed:", err);
        }
      }
      addLog("Scenario: Crowd Rush activated. Gates B and C are congested.");
    }

    else if (scenarioKey === "concourse_fire") {
      setEvacuationAlarm(true);
      addLog("⚠️ EVACUATION ALARM ACTIVATED BY OPERATIONS CENTER ⚠️");

      await reportIncident(
        "CRITICAL EMERGENCY: Fire Alert Sector 104",
        "Active fire and smoke reported near Sector 104 concourse washrooms. Smoke alarm triggered.",
        "fire",
        "Zone A (Concourse)",
        "Security System",
        "Critical"
      );

      const updatedGates = gates.map(g => {
        if (g.id === "gate-b") return { ...g, currentCount: 1450, status: "High" };
        if (g.id === "gate-c") return { ...g, currentCount: 1180, status: "High" };
        return g;
      });
      setGates(updatedGates);

      if (isFirebaseSupported) {
        try {
          await updateDoc(doc(db, "gates", "gate-b"), { currentCount: 1450, status: "High" });
          await updateDoc(doc(db, "gates", "gate-c"), { currentCount: 1180, status: "High" });
        } catch (err) {
          console.error("Firestore gate update failed:", err);
        }
      }
    }

    else if (scenarioKey === "lost_child") {
      await reportIncident(
        "CRITICAL ALERT: Lost Child Sector 112",
        "7-year-old girl in pink dress and blue cap separated from parents near Section 112 aisle.",
        "lost child",
        "Zone C (Seating)",
        "Customer Service Desk",
        "Critical"
      );
    }

    else if (scenarioKey === "fight") {
      await reportIncident(
        "CRITICAL ALERT: Crowd Altercation Section 120",
        "Physical fight reported between spectators in Row 18. Security team required immediately.",
        "fight",
        "Zone D (Seating)",
        "Steward Supervisor",
        "Critical"
      );
    }

    else if (scenarioKey === "power_outage") {
      await reportIncident(
        "CRITICAL ALERT: Power Blackout Sector A",
        "Total light failure and offline register POS systems in the West stand concourse corridors.",
        "power failure",
        "Zone A (Concourse)",
        "Facilities Dispatch",
        "Critical"
      );
    }

    else if (scenarioKey === "normal_ops") {
      setEvacuationAlarm(false);
      addLog("Evacuation alarm deactivated. Normal operations resumed.");

      // Resolve all active incidents in the local and firestore lists
      const activeIncs = incidents.filter(i => i.status !== "resolved");
      for (const inc of activeIncs) {
        await updateIncidentStatus(inc.id, "resolved");
      }

      const resetGates = gates.map(g => {
        let count = 120;
        if (g.id === "gate-a") count = 140;
        if (g.id === "gate-b") count = 450;
        if (g.id === "gate-c") count = 350;
        if (g.id === "gate-d") count = 95;
        return { ...g, currentCount: count, status: count > 400 ? "Medium" : "Low" };
      });
      setGates(resetGates);

      if (isFirebaseSupported) {
        try {
          await updateDoc(doc(db, "gates", "gate-a"), { currentCount: 140, status: "Low" });
          await updateDoc(doc(db, "gates", "gate-b"), { currentCount: 450, status: "Medium" });
          await updateDoc(doc(db, "gates", "gate-c"), { currentCount: 350, status: "Low" });
          await updateDoc(doc(db, "gates", "gate-d"), { currentCount: 95, status: "Low" });
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  const saveVolunteer = async (vol) => {
    const volData = {
      name: vol.name,
      zone: vol.zone,
      role: vol.role,
      status: vol.status || "available",
      contactMethod: vol.contactMethod
    };

    if (vol.id) {
      addLog(`Volunteer "${vol.name}" updated.`);
      if (isFirebaseSupported) {
        try {
          await updateDoc(doc(db, "volunteers", vol.id), volData);
        } catch (err) {
          console.error("Firestore Volunteer update error:", err);
        }
      } else {
        setVolunteers(prev => prev.map(v => v.id === vol.id ? { ...v, ...volData } : v));
      }
    } else {
      addLog(`Volunteer "${vol.name}" created.`);
      if (isFirebaseSupported) {
        try {
          await addDoc(collection(db, "volunteers"), volData);
        } catch (err) {
          console.error("Firestore Volunteer create error:", err);
        }
      } else {
        const mockId = `vol-${Date.now()}`;
        setVolunteers(prev => [{ id: mockId, ...volData }, ...prev]);
      }
    }
  };

  const deleteVolunteer = async (volId) => {
    addLog(`Volunteer deletion triggered for ${volId}`);
    if (isFirebaseSupported) {
      try {
        await deleteDoc(doc(db, "volunteers", volId));
      } catch (err) {
        console.error("Firestore Volunteer delete error:", err);
      }
    } else {
      setVolunteers(prev => prev.filter(v => v.id !== volId));
    }
  };

  /**
   * Resets local state back to the canonical mock seed data.
   * Useful for test environment resets and demo resets.
   */
  const seedTestData = () => {
    setIncidents(initialMockIncidents.map(i => ({ ...i, createdAt: new Date().toISOString() })));
    setTasks(initialMockTasks.map(t => ({ ...t, createdAt: new Date().toISOString() })));
    addLog("Database reset and seeded with standard test datasets.");
  };

  return (
    <AppStateContext.Provider
      value={{
        userRole,
        setUserRole,
        evacuationAlarm,
        triggerEvacuationAlarm,
        activeEvent,
        setActiveEvent,
        incidents,
        reportIncident,
        updateIncidentStatus,
        tasks,
        updateTaskStatus,
        queues,
        faqs,
        setFaqs,
        facilities,
        volunteers,
        gates,
        setGates,
        feedbacks,
        submitFeedback,
        saveFaq,
        deleteFaq,
        saveFacility,
        deleteFacility,
        saveGate,
        deleteGate,
        saveVolunteer,
        deleteVolunteer,
        triggerDemoScenario,
        currentUser,
        loginWithEmail,
        registerWithEmail,
        logout,
        systemLogs,
        addLog,
        seedTestData,
        isFirebaseActive: isFirebaseSupported
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
