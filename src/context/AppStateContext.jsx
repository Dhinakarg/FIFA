import React, { createContext, useContext, useState, useEffect } from "react";
import { isFirebaseSupported, db, auth } from "../firebase";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  getDoc,
  setDoc,
  serverTimestamp, 
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

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

  // Local State collections (fallbacks for Simulation Mode)
  const [incidents, setIncidents] = useState([
    {
      id: "inc-1",
      title: "Soda Spill Zone B",
      description: "Large soda spill near Seat Row 12, sticky hazard.",
      type: "maintenance",
      location: "Zone B (Concourse)",
      status: "pending",
      reportedBy: "Fan Anonymous",
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() // 20m ago
    },
    {
      id: "inc-2",
      title: "Blocked Exit Gate 3",
      description: "Discarded merchandise boxes blocking egress corridor.",
      type: "security",
      location: "Gate 3 Entrance",
      status: "in-progress",
      reportedBy: "Staff Member",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45m ago
    },
    {
      id: "inc-3",
      title: "Medical Assist Zone E",
      description: "Elderly fan feeling dizzy, requesting water & checkup.",
      type: "medical",
      location: "Zone E Row 4",
      status: "resolved",
      reportedBy: "Fan Seat 442",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2h ago
    }
  ]);

  const [tasks, setTasks] = useState([
    {
      id: "task-1",
      title: "Check ticket scanner readers - Gate A",
      description: "Reports of slow RFID scan responses at lanes 3 & 4.",
      assignedRole: "maintenance",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
      id: "task-2",
      title: "Deploy wet floor sign Zone B",
      description: "Associated with soda spill incident inc-1.",
      assignedRole: "maintenance",
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: "task-3",
      title: "Inspect Gate 3 corridor blockage",
      description: "Dispatch security to clear vendor boxes from exit path.",
      assignedRole: "security",
      status: "in-progress",
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
    }
  ]);

  const [queues, setQueues] = useState([
    { id: "gate-a", name: "Main Gate A", type: "gate", waitTime: 8, capacity: 35, status: "low" },
    { id: "gate-b", name: "North Gate B", type: "gate", waitTime: 42, capacity: 92, status: "high" },
    { id: "gate-c", name: "South Gate C", type: "gate", waitTime: 18, capacity: 55, status: "medium" },
    { id: "con-east", name: "Eastern Grill Concession", type: "concession", waitTime: 12, capacity: 40, status: "low" },
    { id: "con-west", name: "Arena Drinks & Snacks", type: "concession", waitTime: 28, capacity: 78, status: "high" },
    { id: "wc-north", name: "North Plaza Washrooms", type: "concession", waitTime: 4, capacity: 20, status: "low" }
  ]);

  const [gates, setGates] = useState([
    { id: "gate-a", name: "Main Gate A", currentCount: 140, capacity: 1500, status: "Low" },
    { id: "gate-b", name: "North Gate B", currentCount: 1250, capacity: 1500, status: "High" },
    { id: "gate-c", name: "South Gate C", currentCount: 680, capacity: 1200, status: "Medium" },
    { id: "gate-d", name: "East Gate D", currentCount: 95, capacity: 1000, status: "Low" }
  ]);

  const [feedbacks, setFeedbacks] = useState([
    { rating: 5, comment: "Loved the easy parking access at Lot Red." },
    { rating: 2, comment: "Wait times at Eastern Grill concession was 30 minutes! Unacceptable." },
    { rating: 4, comment: "Staff was friendly, security check at Gate B was slow though." },
    { rating: 5, comment: "Wi-fi worked great throughout the match." },
    { rating: 1, comment: "I got lost looking for Section 228. Need better signs." }
  ]);

  const [faqs, setFaqs] = useState([
    { keyword: "gates open", intent: "gates_schedule", synonyms: ["opening time", "enter"], response: "Stadium gates open 2 hours prior to the event kick-off time. VIP gates open 2.5 hours early.", language: "en", source: "manual", verified: true },
    { keyword: "toilets", intent: "locate_restroom", synonyms: ["restrooms", "bathrooms", "washrooms", "wc"], response: "Restrooms are located in the concourse near Sections 104, 118, 202, and 228.", language: "en", source: "manual", verified: true },
    { keyword: "food concession", intent: "locate_food", synonyms: ["buy food", "where to eat", "concessions", "drinks"], response: "Eastern Grill, Arena Snacks, and Southern Pizza Hub are open. Check the concessions list on the Map view.", language: "en", source: "manual", verified: true }
  ]);

  const [facilities, setFacilities] = useState([
    { id: "fac-1", name: "Eastern Grill Concession", category: "concession", description: "Fresh burgers, fries, draft beers", x: 76, y: 35 },
    { id: "fac-2", name: "Arena Drinks & Snacks", category: "concession", description: "Popcorn, sodas, nachos, candies", x: 23, y: 35 },
    { id: "fac-3", name: "Southern Pizza Hub", category: "concession", description: "Personal pizzas, garlic knots", x: 45, y: 88 },
    { id: "fac-4", name: "VIP Champagne Bar", category: "concession", description: "Premium liquors, wines, cheese boards", x: 80, y: 15 },
    { id: "fac-5", name: "North Plaza Washrooms", category: "restroom", description: "High-capacity toilets & family stalls", x: 73, y: 65 },
    { id: "fac-6", name: "South Concourse restrooms", category: "restroom", description: "Toilets next to Southern Pizza", x: 38, y: 88 },
    { id: "fac-7", name: "East Upper restrooms", category: "restroom", description: "Toilets near VIP Suites Section", x: 85, y: 25 },
    { id: "fac-8", name: "First Aid Section 104", category: "medical", description: "Primary medical emergency outpost", x: 18, y: 70 },
    { id: "fac-9", name: "First Aid Section 228", category: "medical", description: "Secondary paramedic support station", x: 82, y: 70 },
    { id: "fac-10", name: "Customer Help Hub Center", category: "info", description: "Lost & Found, guidebooks, maps", x: 50, y: 20 }
  ]);

  const [volunteers, setVolunteers] = useState([
    { id: "vol-1", name: "David Miller", zone: "Zone A", role: "usher", status: "available", contactMethod: "Radio Ch 3 / WhatsApp" },
    { id: "vol-2", name: "Sarah Connor", zone: "Zone B", role: "medical-responder", status: "busy", contactMethod: "Phone +1555019" },
    { id: "vol-3", name: "James Carter", zone: "Zone C", role: "security-assistant", status: "available", contactMethod: "Radio Ch 5" },
    { id: "vol-4", name: "Emma Watson", zone: "Zone D", role: "usher", status: "available", contactMethod: "WhatsApp Only" },
    { id: "vol-5", name: "Robert Downey", zone: "Zone E", role: "security-assistant", status: "busy", contactMethod: "Radio Ch 12" }
  ]);

  const [systemLogs, setSystemLogs] = useState([
    { time: "20:55:12", event: "Admin dashboard initialized in Simulation Mode" },
    { time: "20:56:04", event: "Crowd telemetry simulated sensor check OK" },
    { time: "20:57:30", event: "Real-time queue update trigger fired" }
  ]);

  const addLog = (message) => {
    const time = new Date().toTimeString().split(' ')[0];
    setSystemLogs(prev => [{ time, event: message }, ...prev.slice(0, 19)]);
  };

  // Firestore bindings if Firebase is supported
  useEffect(() => {
    if (!isFirebaseSupported) return;

    addLog("Firebase SDK active. Fetching database streams...");

    // Live Stream Incidents
    const qIncidents = query(collection(db, "incidents"), orderBy("createdAt", "desc"));
    const unsubscribeIncidents = onSnapshot(qIncidents, (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      if (docs.length > 0) setIncidents(docs);
    });

    // Live Stream Tasks
    const qTasks = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      if (docs.length > 0) setTasks(docs);
    });

    // Live Stream Queues
    const unsubscribeQueues = onSnapshot(collection(db, "queues"), (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      if (docs.length > 0) setQueues(docs);
    });

    // Live Stream FAQs
    const unsubscribeFaqs = onSnapshot(collection(db, "knowledgeBase"), (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      if (docs.length > 0) setFaqs(docs);
    });

    // Live Stream Facilities
    const unsubscribeFacilities = onSnapshot(collection(db, "facilities"), (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      if (docs.length > 0) setFacilities(docs);
    });

    // Live Stream Volunteers
    const unsubscribeVolunteers = onSnapshot(collection(db, "volunteers"), (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      if (docs.length > 0) setVolunteers(docs);
    });

    // Live Stream Gates
    const unsubscribeGates = onSnapshot(collection(db, "gates"), (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      if (docs.length > 0) setGates(docs);
    });

    // Live Stream Feedbacks
    const unsubscribeFeedbacks = onSnapshot(collection(db, "feedback"), (snapshot) => {
      const docs = [];
      snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));
      if (docs.length > 0) setFeedbacks(docs);
    });

    return () => {
      unsubscribeIncidents();
      unsubscribeTasks();
      unsubscribeQueues();
      unsubscribeFaqs();
      unsubscribeFacilities();
      unsubscribeVolunteers();
      unsubscribeGates();
      unsubscribeFeedbacks();
    };
  }, []);

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
  }, [evacuationAlarm, gates, incidents, volunteers]);

  // Actions
  const reportIncident = async (title, description, type, location, reportedBy = "Fan", severity = "Medium") => {
    const newIncident = {
      title,
      description,
      type,
      location,
      status: "pending",
      severity,
      reportedBy,
      createdAt: new Date().toISOString()
    };

    addLog(`Incident Reported: "${title}" in ${location} [Severity: ${severity}]`);

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
            title: `Dispatch for Incident: ${title}`,
            description: `Location: ${location}. Details: ${description}`,
            status: "pending",
            assignedRole: assignedRole,
            createdAt: new Date().toISOString()
          },
          ...prev
        ]);
        addLog(`System Auto-Task Dispatched to ${assignedRole} for incident "${title}"`);
      }, 1500);
    }
  };

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
  }, []);

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

  const seedTestData = () => {
    setIncidents([
      {
        id: "inc-1",
        title: "Soda Spill Zone B",
        description: "Large soda spill near Seat Row 12, sticky hazard.",
        type: "maintenance",
        location: "Zone B (Concourse)",
        status: "pending",
        reportedBy: "Fan Anonymous",
        createdAt: new Date().toISOString()
      },
      {
        id: "inc-2",
        title: "Blocked Exit Gate 3",
        description: "Discarded merchandise boxes blocking egress corridor.",
        type: "security",
        location: "Gate 3 Entrance",
        status: "in-progress",
        reportedBy: "Staff Member",
        createdAt: new Date().toISOString()
      }
    ]);

    setTasks([
      {
        id: "task-1",
        title: "Check ticket scanner readers - Gate A",
        description: "Reports of slow RFID scan responses at lanes 3 & 4.",
        assignedRole: "maintenance",
        status: "pending",
        createdAt: new Date().toISOString()
      },
      {
        id: "task-2",
        title: "Deploy wet floor sign Zone B",
        description: "Associated with soda spill incident inc-1.",
        assignedRole: "maintenance",
        status: "pending",
        createdAt: new Date().toISOString()
      }
    ]);
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
