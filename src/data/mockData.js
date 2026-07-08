/**
 * @file mockData.js
 * @description Central repository of initial mock/seed data used across the
 * application when Firebase is unavailable or during local simulation mode.
 */

/** @type {Array} Default incidents to seed into local state */
export const initialMockIncidents = [
  {
    id: "inc-1",
    title: "Soda Spill Zone B",
    description: "Large soda spill near Seat Row 12, sticky hazard.",
    type: "maintenance",
    location: "Zone B (Concourse)",
    status: "pending",
    reportedBy: "Fan Anonymous",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  },
  {
    id: "inc-2",
    title: "Blocked Exit Gate 3",
    description: "Discarded merchandise boxes blocking egress corridor.",
    type: "security",
    location: "Gate 3 Entrance",
    status: "in-progress",
    reportedBy: "Staff Member",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: "inc-3",
    title: "Medical Assist Zone E",
    description: "Elderly fan feeling dizzy, requesting water & checkup.",
    type: "medical",
    location: "Zone E Row 4",
    status: "resolved",
    reportedBy: "Fan Seat 442",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
];

/** @type {Array} Default tasks to seed into local state */
export const initialMockTasks = [
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
];

/** @type {Array} Default queue data to seed into local state */
export const initialMockQueues = [
  { id: "gate-a", name: "Main Gate A", type: "gate", waitTime: 8, capacity: 35, status: "low" },
  { id: "gate-b", name: "North Gate B", type: "gate", waitTime: 42, capacity: 92, status: "high" },
  { id: "gate-c", name: "South Gate C", type: "gate", waitTime: 18, capacity: 55, status: "medium" },
  { id: "con-east", name: "Eastern Grill Concession", type: "concession", waitTime: 12, capacity: 40, status: "low" },
  { id: "con-west", name: "Arena Drinks & Snacks", type: "concession", waitTime: 28, capacity: 78, status: "high" },
  { id: "wc-north", name: "North Plaza Washrooms", type: "concession", waitTime: 4, capacity: 20, status: "low" }
];

/** @type {Array} Default gate telemetry data to seed into local state */
export const initialMockGates = [
  { id: "gate-a", name: "Main Gate A", currentCount: 140, capacity: 1500, status: "Low" },
  { id: "gate-b", name: "North Gate B", currentCount: 1250, capacity: 1500, status: "High" },
  { id: "gate-c", name: "South Gate C", currentCount: 680, capacity: 1200, status: "Medium" },
  { id: "gate-d", name: "East Gate D", currentCount: 95, capacity: 1000, status: "Low" }
];

/** @type {Array} Default guest feedback entries */
export const initialMockFeedbacks = [
  { rating: 5, comment: "Loved the easy parking access at Lot Red." },
  { rating: 2, comment: "Wait times at Eastern Grill concession was 30 minutes! Unacceptable." },
  { rating: 4, comment: "Staff was friendly, security check at Gate B was slow though." },
  { rating: 5, comment: "Wi-fi worked great throughout the match." },
  { rating: 1, comment: "I got lost looking for Section 228. Need better signs." }
];

/** @type {Array} Default FAQ knowledge base entries */
export const initialMockFaqs = [
  { id: "faq-1", keyword: "gates open", intent: "gates_schedule", synonyms: ["opening time", "enter"], response: "Stadium gates open 2 hours prior to the event kick-off time. VIP gates open 2.5 hours early.", language: "en", source: "manual", verified: true },
  { id: "faq-2", keyword: "toilets", intent: "locate_restroom", synonyms: ["restrooms", "bathrooms", "washrooms", "wc"], response: "Restrooms are located in the concourse near Sections 104, 118, 202, and 228.", language: "en", source: "manual", verified: true },
  { id: "faq-3", keyword: "food concession", intent: "locate_food", synonyms: ["buy food", "where to eat", "concessions", "drinks"], response: "Eastern Grill, Arena Snacks, and Southern Pizza Hub are open. Check the concessions list on the Map view.", language: "en", source: "manual", verified: true }
];

/** @type {Array} Default facility map entries */
export const initialMockFacilities = [
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
];

/** @type {Array} Default volunteer roster entries */
export const initialMockVolunteers = [
  { id: "vol-1", name: "David Miller", zone: "Zone A", role: "usher", status: "available", contactMethod: "Radio Ch 3 / WhatsApp" },
  { id: "vol-2", name: "Sarah Connor", zone: "Zone B", role: "medical-responder", status: "busy", contactMethod: "Phone +1555019" },
  { id: "vol-3", name: "James Carter", zone: "Zone C", role: "security-assistant", status: "available", contactMethod: "Radio Ch 5" },
  { id: "vol-4", name: "Emma Watson", zone: "Zone D", role: "usher", status: "available", contactMethod: "WhatsApp Only" },
  { id: "vol-5", name: "Robert Downey", zone: "Zone E", role: "security-assistant", status: "busy", contactMethod: "Radio Ch 12" }
];

/**
 * Standard Operating Procedures indexed by incident type keyword.
 * Shared across NavigationWrapper and StaffOperations.
 * @type {Object.<string, string>}
 */
export const predefinedSOPs = {
  "fire": "🚨 SOP-FIRE:\n1. Alert fire marshall & call Fire Dispatch immediately.\n2. Engage local alarm pulls and trigger PA evacuation broadcast.\n3. Instruct stewards to open all Gates and clear exit egress paths.\n4. Deploy fire extinguishers only for minor localized hotspots.",
  "medical": "✙ SOP-MEDICAL:\n1. Dispatch closest zone first-aid responder with AED.\n2. Clear aisle space for paramedics stretchers.\n3. Monitor patient vital signs until ambulance crew arrives.\n4. Record incident details in medical logs.",
  "lost child": "👦 SOP-LOST-CHILD:\n1. Distribute description to all perimeter gate ushers immediately.\n2. Monitor exit CCTV cameras and freeze turnstiles egress.\n3. Guide guardian to Customer Help Hub (Section 101) to announce child name.",
  "fight": "👊 SOP-CROWD-FIGHT:\n1. Dispatch Zone Security squad (minimum 3 officers).\n2. Stewards must maintain distance and observe details (film on phones if possible).\n3. Alert local police dispatcher for fast-track arrest assistance.",
  "power failure": "🔌 SOP-POWER-FAILURE:\n1. Verify backup generator engagement (automatic within 10 seconds).\n2. Manually deploy flashlight guards to emergency staircases.\n3. Broadcast reassurance announcement via PA battery system.\n4. Alert main grid contractor."
};
