const admin = require("firebase-admin");

// Check if running against local emulator
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log(`Connecting to Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
  admin.initializeApp({ projectId: "stadiumgenie-demo" });
} else {
  try {
    const serviceAccount = require("./service-account.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Connected using service-account.json credential.");
  } catch (e) {
    console.log("Service account file not found. Falling back to default emulator project id 'stadiumgenie-demo'.");
    // This allows seamless seeding of the emulator even if variables aren't preset
    admin.initializeApp({ projectId: "stadiumgenie-demo" });
  }
}

const db = admin.firestore();

// 1. Gates Dataset (4 items)
const gates = [
  { id: "gate-a", name: "Main Gate A", currentCount: 140, capacity: 1500, status: "Low" },
  { id: "gate-b", name: "North Gate B", currentCount: 1250, capacity: 1500, status: "High" },
  { id: "gate-c", name: "South Gate C", currentCount: 680, capacity: 1200, status: "Medium" },
  { id: "gate-d", name: "East Gate D", currentCount: 95, capacity: 1000, status: "Low" }
];

// 2. Facilities Dataset (10 items)
const facilities = [
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

// 3. KnowledgeBase FAQ Dataset (50 items, English only)
const knowledgeBase = [
  // Category: Gates & Ingress (10 items)
  { keyword: "gates open", intent: "gates_schedule", synonyms: ["opening time", "enter stadium", "when can i enter"], response: "Stadium gates open 2 hours prior to the event kick-off time. For VIP ticket holders, gates open 2.5 hours early.", language: "en", source: "manual", verified: true },
  { keyword: "gate a location", intent: "locate_gate", synonyms: ["where is gate a", "find gate a"], response: "Gate A is located on the West perimeter, directly adjacent to Parking Lot Red.", language: "en", source: "manual", verified: true },
  { keyword: "gate b location", intent: "locate_gate", synonyms: ["where is gate b", "find gate b"], response: "Gate B is located on the North side, next to the VIP lounge driveway.", language: "en", source: "manual", verified: true },
  { keyword: "gate c location", intent: "locate_gate", synonyms: ["where is gate c", "find gate c"], response: "Gate C is on the South side, close to the local train shuttle station.", language: "en", source: "manual", verified: true },
  { keyword: "gate d location", intent: "locate_gate", synonyms: ["where is gate d", "find gate d"], response: "Gate D is on the East side, adjacent to the public bus terminal.", language: "en", source: "manual", verified: true },
  { keyword: "fastest gate", intent: "recommend_gate", synonyms: ["least busy gate", "shortest queue", "which gate is empty"], response: "Gate D and Gate A currently have the lowest wait times. Check the live Map page for telemetry times.", language: "en", source: "AI-generated", verified: true },
  { keyword: "re-entry policy", intent: "reentry", synonyms: ["can i exit and return", "leave and come back"], response: "Re-entry is not permitted. Once your ticket is scanned at ingress, you cannot leave and return on the same ticket.", language: "en", source: "manual", verified: true },
  { keyword: "bag policy", intent: "security_bags", synonyms: ["backpacks", "purse size", "clear bag rules"], response: "Only clear plastic bags under 12x6x12 inches or small clutches under 4.5x6.5 inches are allowed.", language: "en", source: "manual", verified: true },
  { keyword: "ticket scan failed", intent: "ticket_trouble", synonyms: ["code not reading", "turnstile reject"], response: "If the scanner rejects your ticket, please visit the ticketing resolution windows at Gate A or Gate C Help Hubs.", language: "en", source: "manual", verified: true },
  { keyword: "vip entrance", intent: "locate_gate", synonyms: ["club ticket door", "vip lobby"], response: "VIP and suite holders should enter through Gate B (North Entrance) for dedicated fast-track lanes.", language: "en", source: "manual", verified: true },

  // Category: Facilities & Restrooms (5 items)
  { keyword: "toilets", intent: "locate_restroom", synonyms: ["restrooms", "bathrooms", "washrooms", "wc"], response: "Restrooms are located in the concourse near Sections 104, 118, 202, and 228. Check the Stadium Map for the closest one.", language: "en", source: "manual", verified: true },
  { keyword: "family washroom", intent: "locate_restroom", synonyms: ["baby changing", "diaper desk", "gender neutral wc"], response: "Family restrooms with baby changing desks are available at the North Plaza Washrooms and VIP Concourse.", language: "en", source: "manual", verified: true },
  { keyword: "disabled toilets", intent: "locate_restroom", synonyms: ["ada bathrooms", "wheelchair toilet"], response: "All restroom hubs feature dedicated, wheelchair-accessible stalls with support handrails.", language: "en", source: "manual", verified: true },
  { keyword: "restroom queue time", intent: "restroom_wait", synonyms: ["restroom line", "are toilets busy"], response: "North Plaza toilets have the shortest wait. South Concourse restrooms are currently congested.", language: "en", source: "AI-generated", verified: true },
  { keyword: "drinking fountain", intent: "locate_facility", synonyms: ["water taps", "free water"], response: "Drinking water fountains are located next to each washroom hub along the concourse.", language: "en", source: "manual", verified: true },

  // Category: Food & Drinks (10 items)
  { keyword: "food concession", intent: "locate_food", synonyms: ["buy food", "where to eat", "concessions"], response: "Eastern Grill, Arena Snacks, and Southern Pizza Hub are open. Check the concessions list on the Map view.", language: "en", source: "manual", verified: true },
  { keyword: "beer locations", intent: "locate_alcohol", synonyms: ["buy alcohol", "where is beer", "draft pints"], response: "Alcoholic beverages are sold at the Eastern Grill, VIP Bar, and dedicated kiosks. Sales cut off at the 75th minute.", language: "en", source: "manual", verified: true },
  { keyword: "gluten free", intent: "dietary_restrictions", synonyms: ["gf options", "allergies", "vegan food"], response: "Arena Drinks & Snacks offers gluten-free popcorn and nachos. VIP Champagne Bar features vegan cheese boards.", language: "en", source: "manual", verified: true },
  { keyword: "water bottle cost", intent: "concession_prices", synonyms: ["soft drink price", "how much is coke"], response: "Dasani water bottle is $4.50. Soft drinks are $5.50. Draft beers start at $9.00.", language: "en", source: "manual", verified: true },
  { keyword: "closest food stand", intent: "recommend_food", synonyms: ["nearest burgers", "pizza near me"], response: "Southern Pizza is close to Section 112. Eastern Grill serves Sections 120-130.", language: "en", source: "AI-generated", verified: true },
  { keyword: "halal options", intent: "dietary_restrictions", synonyms: ["halal meat", "kosher meals"], response: "Halal chicken tenders are served exclusively at the Eastern Grill Concession booth.", language: "en", source: "manual", verified: true },
  { keyword: "can i bring snacks", intent: "food_policy", synonyms: ["outside food", "personal water", "sandwich box"], response: "Outside food and drinks are prohibited, except for medically documented dietary items or empty plastic bottles under 32oz.", language: "en", source: "manual", verified: true },
  { keyword: "longest food line", intent: "food_wait", synonyms: ["concession queues", "drinks queue"], response: "Arena Drinks & Snacks has a 25-minute wait. Eastern Grill currently has a 5-minute wait.", language: "en", source: "AI-generated", verified: true },
  { keyword: "kiddy menus", intent: "food_selection", synonyms: ["children meals", "hot dogs kids"], response: "Arena Snacks offers a 'Genie Kid Meal' with a small hot dog, chips, juice box, and souvenir toy.", language: "en", source: "manual", verified: true },
  { keyword: "credit card pay", intent: "payment_method", synonyms: ["cashless stadium", "apple pay", "google wallet"], response: "StadiumGenie operates a cashless stadium. All stands accept major credit cards, Apple Pay, and Google Pay.", language: "en", source: "manual", verified: true },

  // Category: Ticketing & seating (5 items)
  { keyword: "box office", intent: "ticketing", synonyms: ["buy tickets", "will call", "ticket counter"], response: "The Box Office is located outside Gate A and is open from 10:00 AM until the event starts.", language: "en", source: "manual", verified: true },
  { keyword: "lost ticket", intent: "ticketing", synonyms: ["mobile ticket lost", "app not loading barcode"], response: "Please visit the ticket resolution desk at Gate A or C with valid photo ID matching the purchase receipt.", language: "en", source: "manual", verified: true },
  { keyword: "child ticket policy", intent: "ticketing", synonyms: ["toddler tickets", "infant entrance"], response: "Children under 2 years old do not need a ticket if they sit on an adult's lap. Kids 2+ require tickets.", language: "en", source: "manual", verified: true },
  { keyword: "upgrades seat", intent: "ticketing", synonyms: ["swap to vip", "better seats booking"], response: "Seat upgrades can be checked on the StadiumGenie app under 'My Tickets' depending on remaining occupancy.", language: "en", source: "AI-generated", verified: true },
  { keyword: "group bookings", intent: "ticketing", synonyms: ["discount for 10", "corporate reservations"], response: "For groups of 15 or more, email groupsales@stadiumgenie.com for discount tier approvals.", language: "en", source: "manual", verified: true },

  // Category: Parking & transport (5 items)
  { keyword: "parking lots", intent: "transit", synonyms: ["where to park", "car parking cost", "valet parking"], response: "Lot Red (Gate A) and Lot Blue (Gate D) are open. General parking is $25. Pre-booking online is recommended.", language: "en", source: "manual", verified: true },
  { keyword: "uber pickup", intent: "transit", synonyms: ["rideshare stand", "taxi location", "lyft spot"], response: "The designated rideshare pickup zone is in Parking Lot Green, located 200 meters outside Gate C.", language: "en", source: "manual", verified: true },
  { keyword: "train shuttle", intent: "transit", synonyms: ["rail station", "subway route", "stadium express"], response: "Shuttle trains run every 8 minutes from Central Station directly to the Gate C transport loop.", language: "en", source: "manual", verified: true },
  { keyword: "bike parking", intent: "transit", synonyms: ["bicycle racks", "motorcycle stands"], response: "Free bicycle parking racks are available next to the security outposts at Gate A and Gate D.", language: "en", source: "manual", verified: true },
  { keyword: "ev chargers", intent: "transit", synonyms: ["tesla chargers", "charge electric car"], response: "10 EV charging points are available on a first-come basis in Parking Lot Red, Section E.", language: "en", source: "manual", verified: true },

  // Category: Safety & security (5 items)
  { keyword: "lost and found", intent: "info", synonyms: ["lost phone", "found wallet", "missing keys"], response: "Lost items are turned in to the Customer Help Hub Center at Section 101. Claim forms are on the app.", language: "en", source: "manual", verified: true },
  { keyword: "report suspicious activity", intent: "security_emergency", synonyms: ["fight", "scary person", "suspicious bag"], response: "Report immediately to the nearest security steward or file a 'Security Concern' incident in the Fan Assistant portal.", language: "en", source: "manual", verified: true },
  { keyword: "prohibited items", intent: "security_rules", synonyms: ["weapons", "umbrella", "air horn", "laser pointer"], response: "Weapons, fireworks, laser pointers, professional cameras, air horns, and large umbrellas are strictly prohibited.", language: "en", source: "manual", verified: true },
  { keyword: "evacuation procedure", intent: "security_emergency", synonyms: ["fire exit", "stadium alarm", "emergency path"], response: "In an evacuation, remain calm. Listen to PA announcements and follow staff guides to the nearest exits (Gates A-D).", language: "en", source: "manual", verified: true },
  { keyword: "stewards help", intent: "info", synonyms: ["find staff", "where are guards"], response: "Stewards wear bright yellow high-visibility jackets and are stationed at the end of every row and concourse gate.", language: "en", source: "manual", verified: true },

  // Category: First Aid & medical (5 items)
  { keyword: "medical outpost", intent: "locate_medical", synonyms: ["doctor room", "hospital check", "first aid location"], response: "Medical rooms are located at Section 104 (West Concourse) and Section 228 (East Concourse).", language: "en", source: "manual", verified: true },
  { keyword: "defibrillator aed", intent: "locate_medical", synonyms: ["aed machine", "heart attack emergency"], response: "AED units are mounted on walls next to every Gate entry box and concourse First Aid station.", language: "en", source: "manual", verified: true },
  { keyword: "wheelchair assistance", intent: "locate_facility", synonyms: ["escort service", "stadium wheelchair rental"], response: "Complimentary wheelchair escorts from gates to seats are available. Request at any Customer Help Hub.", language: "en", source: "manual", verified: true },
  { keyword: "sensory room", intent: "locate_facility", synonyms: ["quiet room", "autism shelter"], response: "A dedicated quiet sensory room for neurodivergent guests is located near Suite Level Elevator 2.", language: "en", source: "manual", verified: true },
  { keyword: "sunscreen first aid", intent: "locate_medical", synonyms: ["sunburn gel", "need band aid"], response: "Basic items like band-aids, sunscreen, and aspirin can be retrieved free of charge at any First Aid station.", language: "en", source: "manual", verified: true },

  // Category: General Rules & timings (5 items)
  { keyword: "stadium wifi", intent: "internet", synonyms: ["free wifi", "stadium connection", "internet log"], response: "Connect to the free public Wi-Fi network: '#StadiumGenieFree' via the browser splash portal.", language: "en", source: "manual", verified: true },
  { keyword: "merchandise stand", intent: "shopping", synonyms: ["buy jerseys", "genie shirt", "fan shop"], response: "The main Stadium Store is near Gate A. 3 smaller merchandise trailers are open in the North and South Plazas.", language: "en", source: "manual", verified: true },
  { keyword: "smoking policy", intent: "rules", synonyms: ["vaping rules", "e-cigarette zone", "where can i smoke"], response: "StadiumGenie is a smoke-free facility. Smoking and vaping are strictly prohibited inside the arena bowl and corridors.", language: "en", source: "manual", verified: true },
  { keyword: "stroller check", intent: "info", synonyms: ["stroller storage", "pram park"], response: "Strollers can be checked in for free storage during events at the Customer Help Hub Center (Section 101).", language: "en", source: "manual", verified: true },
  { keyword: "lost child help", intent: "security_emergency", synonyms: ["missing kid", "lost family", "separated"], response: "Immediately report to any security officer. Separated families will be guided to wait at the Customer Help Hub.", language: "en", source: "manual", verified: true }
];

// 4. Incidents Dataset (10 items)
const incidents = [
  { id: "inc-101", type: "maintenance", description: "Large soda spill near Seat Row 12, sticky hazard.", location: "Zone B (Concourse)", severity: "Low", timestamp: new Date(Date.now() - 1000 * 60 * 20), status: "pending" },
  { id: "inc-102", type: "security", description: "Discarded merchandise boxes blocking egress corridor.", location: "Gate 3 Entrance", severity: "Medium", timestamp: new Date(Date.now() - 1000 * 60 * 45), status: "in-progress" },
  { id: "inc-103", type: "medical", description: "Elderly fan feeling dizzy, requesting water & checkup.", location: "Zone E Row 4", severity: "High", timestamp: new Date(Date.now() - 1000 * 60 * 120), status: "resolved" },
  { id: "inc-104", type: "facility", description: "RFID turnstile scanner unresponsive at Lane 3.", location: "Gate 1 Entrance", severity: "Medium", timestamp: new Date(Date.now() - 1000 * 60 * 90), status: "in-progress" },
  { id: "inc-105", type: "maintenance", description: "Paper towel dispenser empty, water on floor.", location: "North Plaza Washrooms", severity: "Low", timestamp: new Date(Date.now() - 1000 * 60 * 15), status: "pending" },
  { id: "inc-106", type: "security", description: "Minor verbal altercation between fans in Section 202.", location: "Zone C (Seating)", severity: "Medium", timestamp: new Date(Date.now() - 1000 * 60 * 60), status: "resolved" },
  { id: "inc-107", type: "facility", description: "Broken cup holder at Seat 14, sharp plastic edges.", location: "Zone D (Seating)", severity: "Low", timestamp: new Date(Date.now() - 1000 * 60 * 240), status: "pending" },
  { id: "inc-108", type: "medical", description: "Minor cut from soda can tab, requested band-aid.", location: "Eastern Grill Concession", severity: "Low", timestamp: new Date(Date.now() - 1000 * 60 * 30), status: "resolved" },
  { id: "inc-109", type: "maintenance", description: "Leaking pipe behind concession wall panel.", location: "Arena Drinks & Snacks", severity: "Medium", timestamp: new Date(Date.now() - 1000 * 60 * 180), status: "pending" },
  { id: "inc-110", type: "security", description: "Unattended backpack found leaning on gate columns.", location: "Gate 3 Entrance", severity: "High", timestamp: new Date(Date.now() - 1000 * 60 * 10), status: "pending" }
];

// 5. Volunteers Dataset (5 items)
const volunteers = [
  { id: "vol-1", name: "David Miller", zone: "Zone A", role: "usher", status: "available", contactMethod: "Radio Ch 3 / WhatsApp" },
  { id: "vol-2", name: "Sarah Connor", zone: "Zone B", role: "medical-responder", status: "busy", contactMethod: "Phone +1555019" },
  { id: "vol-3", name: "James Carter", zone: "Zone C", role: "security-assistant", status: "available", contactMethod: "Radio Ch 5" },
  { id: "vol-4", name: "Emma Watson", zone: "Zone D", role: "usher", status: "available", contactMethod: "WhatsApp Only" },
  { id: "vol-5", name: "Robert Downey", zone: "Zone E", role: "security-assistant", status: "busy", contactMethod: "Radio Ch 12" }
];

// Seeding Script Logic
async function seedDatabase() {
  console.log("Starting Firestore Seeding process...");

  try {
    // A. Seed Gates
    console.log("Seeding gates...");
    for (const gate of gates) {
      await db.collection("gates").doc(gate.id).set(gate);
    }
    console.log(`Successfully seeded ${gates.length} gates.`);

    // B. Seed Facilities
    console.log("Seeding facilities...");
    for (const facility of facilities) {
      await db.collection("facilities").doc(facility.id).set(facility);
    }
    console.log(`Successfully seeded ${facilities.length} facilities.`);

    // C. Seed FAQ KnowledgeBase (50 items)
    console.log("Seeding FAQ knowledgeBase...");
    let faqCount = 0;
    const batch = db.batch();
    knowledgeBase.forEach((faq, index) => {
      const docRef = db.collection("knowledgeBase").doc(`faq-${index + 1}`);
      batch.set(docRef, faq);
      faqCount++;
    });
    await batch.commit();
    console.log(`Successfully seeded ${faqCount} FAQ entries.`);

    // D. Seed Incidents
    console.log("Seeding incidents...");
    for (const incident of incidents) {
      await db.collection("incidents").doc(incident.id).set({
        ...incident,
        timestamp: admin.firestore.Timestamp.fromDate(incident.timestamp)
      });
    }
    console.log(`Successfully seeded ${incidents.length} sample incidents.`);

    // E. Seed Volunteers
    console.log("Seeding volunteers...");
    for (const volunteer of volunteers) {
      await db.collection("volunteers").doc(volunteer.id).set(volunteer);
    }
    console.log(`Successfully seeded ${volunteers.length} volunteers.`);

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase().then(() => process.exit(0));
