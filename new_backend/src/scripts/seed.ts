import dotenv from "dotenv";
dotenv.config();

import { pool } from "../config/db";

interface SeedRow {
  content_type: string;
  title: string;
  description_short: string;
  description_detailed: string;
  balances_doshas: string[];
  aggravates_doshas: string[];
  best_for_season: string;
  best_time_of_day: string;
  helps_with_emotions: string[];
  duration_minutes: number;
  difficulty: string;
  steps: { step: number; instruction: string }[];
  precautions: string[];
  traditional_source: string;
}

const PRACTICES: SeedRow[] = [
  // ─── BREATHING 
  {
    content_type: "breathing",
    title: "Nadi Shodhana (Alternate Nostril Breathing)",
    description_short: "Balances all three doshas and calms the nervous system.",
    description_detailed:
      "Nadi Shodhana purifies the energy channels (nadis) by alternating breath between left and right nostrils. " +
      "It is the single most recommended pranayama for overall balance in Ayurveda.",
    balances_doshas: ["Vata", "Pitta", "Kapha"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "morning",
    helps_with_emotions: ["anxiety", "stress", "fear", "worry"],
    duration_minutes: 10,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Sit comfortably with your spine straight." },
      { step: 2, instruction: "Close your right nostril with your thumb. Inhale through the left nostril for 4 counts." },
      { step: 3, instruction: "Close both nostrils. Hold the breath for 4 counts." },
      { step: 4, instruction: "Open the right nostril. Exhale for 4 counts." },
      { step: 5, instruction: "Inhale through the right nostril for 4 counts." },
      { step: 6, instruction: "Close both nostrils. Hold for 4 counts." },
      { step: 7, instruction: "Open the left nostril. Exhale for 4 counts." },
      { step: 8, instruction: "Repeat for 5–10 rounds." },
    ],
    precautions: ["Do not hold breath if you feel dizzy.", "Avoid during heavy cold or congestion."],
    traditional_source: "Hatha Yoga Pradipika",
  },
  {
    content_type: "breathing",
    title: "Kapalabhati (Skull-Shining Breath)",
    description_short: "Energising breath that stimulates Pitta and clears mental fog.",
    description_detailed:
      "Rapid forceful exhales through the nose activate the diaphragm and increase alertness. " +
      "Best for Kapha-dominant individuals who feel sluggish or lethargic.",
    balances_doshas: ["Kapha"],
    aggravates_doshas: ["Vata", "Pitta"],
    best_for_season: "winter",
    best_time_of_day: "morning",
    helps_with_emotions: ["lethargy", "sadness", "depression"],
    duration_minutes: 5,
    difficulty: "intermediate",
    steps: [
      { step: 1, instruction: "Sit tall. Rest hands on knees." },
      { step: 2, instruction: "Take a normal inhale." },
      { step: 3, instruction: "Forcefully exhale through the nose while pulling the belly in sharply." },
      { step: 4, instruction: "Allow the inhale to happen passively." },
      { step: 5, instruction: "Repeat 20–30 times, then rest and breathe normally." },
    ],
    precautions: ["Stop if dizzy or lightheaded.", "Avoid during pregnancy or menstruation."],
    traditional_source: "Gheranda Samhita",
  },
  {
    content_type: "breathing",
    title: "Bhramari (Bee Breath)",
    description_short: "Humming exhale that instantly calms anxiety and anger.",
    description_detailed:
      "The vibration of the hum stimulates the vagus nerve, lowering cortisol within minutes. " +
      "Excellent for Pitta imbalances and pre-sleep calm.",
    balances_doshas: ["Pitta", "Vata"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "evening",
    helps_with_emotions: ["anxiety", "anger", "frustration", "stress"],
    duration_minutes: 5,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Close your eyes and plug your ears gently with your thumbs." },
      { step: 2, instruction: "Inhale deeply through the nose." },
      { step: 3, instruction: "Exhale while humming 'Mmmm' for as long as possible." },
      { step: 4, instruction: "Repeat 5–10 times." },
    ],
    precautions: ["Avoid if you have sinus infection."],
    traditional_source: "Pranayama Swadhyaya",
  },

  // ─── YOGA ───────────────────────────────────────────
  {
    content_type: "yoga",
    title: "Surya Namaskar (Sun Salutation)",
    description_short: "Full-body flow that activates and balances all doshas.",
    description_detailed:
      "12 linked poses that warm the body, stretch every muscle group, and synchronise breath with movement. " +
      "A cornerstone of Ayurvedic morning routines.",
    balances_doshas: ["Vata", "Pitta", "Kapha"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "morning",
    helps_with_emotions: ["stress", "lethargy", "sadness", "anxiety"],
    duration_minutes: 15,
    difficulty: "intermediate",
    steps: [
      { step: 1, instruction: "Stand at the top of your mat. Hands in prayer position." },
      { step: 2, instruction: "Raise arms overhead and arch back gently." },
      { step: 3, instruction: "Forward fold, fingertips to the floor." },
      { step: 4, instruction: "Step back into a lunge, then plank." },
      { step: 5, instruction: "Lower to the ground — Chaturanga." },
      { step: 6, instruction: "Cobra or upward dog." },
      { step: 7, instruction: "Downward dog." },
      { step: 8, instruction: "Walk feet forward, fold, rise, repeat on other side." },
    ],
    precautions: ["Skip if you have wrist or lower-back injury.", "Modify for beginners with knees down."],
    traditional_source: "Acharya Suryanamaskara",
  },
  {
    content_type: "yoga",
    title: "Balasana (Child's Pose)",
    description_short: "Restorative pose that instantly calms Vata and eases anxiety.",
    description_detailed:
      "A surrendering posture that compresses the belly gently, slowing the breath and quieting the mind. " +
      "Perfect at any point when you need to pause and reset.",
    balances_doshas: ["Vata"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "any",
    helps_with_emotions: ["anxiety", "fear", "stress", "worry"],
    duration_minutes: 5,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Kneel on the floor. Sit back on your heels." },
      { step: 2, instruction: "Slowly fold forward, forehead resting on the mat." },
      { step: 3, instruction: "Arms can extend forward or rest alongside your body." },
      { step: 4, instruction: "Breathe deeply into the belly. Hold for 1–5 minutes." },
    ],
    precautions: ["Avoid if pregnant or if knees are very sensitive."],
    traditional_source: "Traditional Hatha Yoga",
  },

  // ─── DIET ───────────────────────────────────────────
  {
    content_type: "diet",
    title: "Warm Spiced Milk (Ashwagandha Latte)",
    description_short: "Calming evening drink that pacifies Vata and aids sleep.",
    description_detailed:
      "Warm milk with ashwagandha, cardamom, and a pinch of nutmeg. " +
      "Ashwagandha is an adaptogen that reduces cortisol; warm milk provides tryptophan for serotonin production.",
    balances_doshas: ["Vata"],
    aggravates_doshas: ["Kapha"],
    best_for_season: "winter",
    best_time_of_day: "evening",
    helps_with_emotions: ["anxiety", "stress", "fear", "lethargy"],
    duration_minutes: 10,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Heat 1 cup of whole milk (or oat milk) on low flame." },
      { step: 2, instruction: "Add 1 tsp ashwagandha powder." },
      { step: 3, instruction: "Add a pinch of cardamom and nutmeg." },
      { step: 4, instruction: "Stir for 2 minutes. Add honey to taste after removing from heat." },
      { step: 5, instruction: "Sip slowly 30 minutes before bed." },
    ],
    precautions: ["Consult doctor if on thyroid medication.", "Avoid if allergic to dairy."],
    traditional_source: "Charaka Samhita",
  },
  {
    content_type: "diet",
    title: "Pitta-Cooling Salad",
    description_short: "Fresh greens and cucumber that calm Pitta-driven anger and inflammation.",
    description_detailed:
      "A light, raw salad with cucumber, mint, pomegranate, and a lime-coconut dressing. " +
      "All ingredients are inherently cooling and sweet, directly opposing Pitta's fire.",
    balances_doshas: ["Pitta"],
    aggravates_doshas: ["Vata", "Kapha"],
    best_for_season: "summer",
    best_time_of_day: "afternoon",
    helps_with_emotions: ["anger", "frustration", "irritation"],
    duration_minutes: 10,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Chop 1 cucumber, handful of spinach, pomegranate seeds." },
      { step: 2, instruction: "Mix 2 tbsp coconut cream + juice of 1 lime + pinch of salt." },
      { step: 3, instruction: "Toss everything. Top with fresh mint leaves." },
      { step: 4, instruction: "Eat at room temperature, chewing slowly." },
    ],
    precautions: ["Add protein if eating as a main meal."],
    traditional_source: "Ayurvedic Cuisine Traditions",
  },

  // ─── HERBS ──────────────────────────────────────────
  {
    content_type: "herb",
    title: "Tulsi (Holy Basil) Tea",
    description_short: "Sacred adaptogenic herb that eases stress and balances all doshas.",
    description_detailed:
      "Tulsi has been used for 5,000+ years in Ayurveda. It lowers cortisol, supports immunity, " +
      "and gently balances blood sugar — making it one of the most versatile herbs available.",
    balances_doshas: ["Vata", "Pitta", "Kapha"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "morning",
    helps_with_emotions: ["stress", "anxiety", "depression", "lethargy"],
    duration_minutes: 5,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Place 5–6 fresh tulsi leaves (or 1 tsp dried) in a cup." },
      { step: 2, instruction: "Pour hot water over them. Steep 5 minutes." },
      { step: 3, instruction: "Add honey and a squeeze of lemon if desired." },
      { step: 4, instruction: "Drink 1–2 cups daily, ideally in the morning." },
    ],
    precautions: ["May thin blood — pause before surgery.", "Avoid excessive amounts during pregnancy."],
    traditional_source: "Sushruta Samhita",
  },
  {
    content_type: "herb",
    title: "Chamomile + Brahmi Blend",
    description_short: "Calms racing thoughts and supports memory and focus.",
    description_detailed:
      "Brahmi (Bacopa monnieri) is a Medhya Rasayana — an Ayurvedic herb specifically for the mind. " +
      "Combined with chamomile's gentle sedative effect, it creates a powerful calm-focus blend.",
    balances_doshas: ["Vata", "Pitta"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "evening",
    helps_with_emotions: ["anxiety", "worry", "stress", "fear"],
    duration_minutes: 5,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Mix 1 tsp chamomile and ½ tsp brahmi powder." },
      { step: 2, instruction: "Steep in hot water for 5–7 minutes." },
      { step: 3, instruction: "Strain and sip warm." },
    ],
    precautions: ["Brahmi can cause mild diarrhea in some people. Start with ¼ tsp."],
    traditional_source: "Charaka Samhita — Rasayana Sthana",
  },

  // ─── LIFESTYLE ──────────────────────────────────────
  {
    content_type: "lifestyle",
    title: "Dinacharya Morning Routine",
    description_short: "Ayurveda's ideal morning ritual that sets the tone for the whole day.",
    description_detailed:
      "A structured 20-minute morning practice: tongue scraping, oil pulling, warm water with lemon, " +
      "5 min meditation, and a short walk. Each step has a specific dosha-balancing purpose.",
    balances_doshas: ["Vata", "Pitta", "Kapha"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "morning",
    helps_with_emotions: ["stress", "lethargy", "anxiety"],
    duration_minutes: 20,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Wake before 7 AM. Scrape tongue with a copper or silver scraper (front to back, 7 times)." },
      { step: 2, instruction: "Oil pull: swish 1 tbsp sesame oil in your mouth for 5–10 minutes. Spit it out." },
      { step: 3, instruction: "Drink a glass of warm water with a squeeze of lemon." },
      { step: 4, instruction: "Sit quietly for 5 minutes. Focus on breath or repeat a mantra." },
      { step: 5, instruction: "Take a short walk outside to absorb morning sunlight." },
    ],
    precautions: ["Oil pulling is not a substitute for brushing teeth — brush after."],
    traditional_source: "Charaka Samhita — Vata Sthana",
  },
  {
    content_type: "lifestyle",
    title: "Digital Detox Hour",
    description_short: "One screen-free hour before bed to reset Vata and improve sleep.",
    description_detailed:
      "Blue light and constant stimulation aggravate Vata, making sleep difficult. " +
      "Spending one hour before bed with no screens — reading, journaling, or simply sitting — dramatically improves sleep quality.",
    balances_doshas: ["Vata"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "evening",
    helps_with_emotions: ["anxiety", "stress", "lethargy"],
    duration_minutes: 60,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Set an alarm 1 hour before your target bedtime." },
      { step: 2, instruction: "Put all screens away when the alarm goes off." },
      { step: 3, instruction: "Choose one activity: read a book, journal, do gentle stretching, or listen to calm music." },
      { step: 4, instruction: "Drink warm milk or tulsi tea during this time." },
      { step: 5, instruction: "Go to bed feeling calm and screen-free." },
    ],
    precautions: [],
    traditional_source: "Modern Ayurvedic Wellness",
  },
  {
    content_type: "lifestyle",
    title: "Gratitude Journaling",
    description_short: "Writing 3 things you're grateful for shifts Kapha and builds emotional resilience.",
    description_detailed:
      "Research shows gratitude journaling increases serotonin and dopamine. " +
      "From an Ayurvedic view, it counters the heaviness of Kapha by bringing lightness and positivity to the mind.",
    balances_doshas: ["Kapha", "Vata"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "evening",
    helps_with_emotions: ["sadness", "depression", "grief", "lethargy"],
    duration_minutes: 10,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Open a notebook or journal." },
      { step: 2, instruction: "Write today's date." },
      { step: 3, instruction: "List 3 things you are grateful for — no matter how small." },
      { step: 4, instruction: "For each one, write one sentence about WHY it made you feel grateful." },
      { step: 5, instruction: "Close your eyes and sit with that warm feeling for 30 seconds." },
    ],
    precautions: [],
    traditional_source: "Positive Psychology + Ayurvedic Mind Science",
  },

  // ─── MANTRA ─────────────────────────────────────────
  {
    content_type: "mantra",
    title: "So Hum Meditation",
    description_short: "Effortless breathing mantra that silences inner chatter and calms Vata.",
    description_detailed:
      "One of the oldest mantras in Vedic tradition. 'So' on the inhale, 'Hum' on the exhale. " +
      "It synchronises the nervous system and is traditionally used for deep relaxation.",
    balances_doshas: ["Vata", "Pitta"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "morning",
    helps_with_emotions: ["anxiety", "stress", "fear", "worry"],
    duration_minutes: 15,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Sit comfortably with eyes closed." },
      { step: 2, instruction: "Take a natural inhale. In your mind, hear 'Sooo…'" },
      { step: 3, instruction: "Exhale slowly. In your mind, hear 'Hummm…'" },
      { step: 4, instruction: "Don't force the breath — let it flow naturally." },
      { step: 5, instruction: "If thoughts come, gently return to the mantra. Continue for 15 minutes." },
    ],
    precautions: ["No physical contraindications. Suitable for all."],
    traditional_source: "Vedic Tradition",
  },
  {
    content_type: "mantra",
    title: "Om Chanting",
    description_short: "Universal vibration that harmonises all three doshas and calms the nervous system.",
    description_detailed:
      "The primordial sound 'Om' is believed to contain all of creation. " +
      "Chanting it aloud vibrates the vagus nerve, lowers blood pressure, and induces a meditative state.",
    balances_doshas: ["Vata", "Pitta", "Kapha"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "morning",
    helps_with_emotions: ["anxiety", "anger", "sadness", "stress"],
    duration_minutes: 10,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Sit with spine straight, hands in lap." },
      { step: 2, instruction: "Take a deep inhale through the nose." },
      { step: 3, instruction: "Exhale while chanting 'Ohhh… Mmmmm…' until lungs are empty." },
      { step: 4, instruction: "Feel the vibration in your chest and head." },
      { step: 5, instruction: "Repeat for 10–21 rounds." },
    ],
    precautions: ["Speak at a comfortable volume. No strain."],
    traditional_source: "Upanishads",
  },

  // ─── EXTRA BREATHING ────────────────────────────────
  {
    content_type: "breathing",
    title: "4-7-8 Breathing (Relaxing Breath)",
    description_short: "Scientifically proven to activate the parasympathetic nervous system within 30 seconds.",
    description_detailed:
      "Inhale 4 counts, hold 7 counts, exhale 8 counts. The extended exhale signals the vagus nerve to slow the heart rate. " +
      "Particularly effective for acute anxiety or before sleep.",
    balances_doshas: ["Vata", "Pitta"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "evening",
    helps_with_emotions: ["anxiety", "fear", "stress", "panic"],
    duration_minutes: 3,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Sit or lie down comfortably." },
      { step: 2, instruction: "Inhale quietly through the nose for 4 seconds." },
      { step: 3, instruction: "Hold the breath for 7 seconds." },
      { step: 4, instruction: "Exhale completely through the mouth for 8 seconds." },
      { step: 5, instruction: "Repeat 3–4 cycles." },
    ],
    precautions: ["If dizzy, stop and breathe normally."],
    traditional_source: "Dr. Andrew Weil / Pranayama Tradition",
  },

  // ─── EXTRA YOGA ─────────────────────────────────────
  {
    content_type: "yoga",
    title: "Viparita Karani (Legs Up the Wall)",
    description_short: "Passive inversion that drains fatigue and calms both Vata and Pitta.",
    description_detailed:
      "Lying on your back with legs up a wall reverses blood flow, eases swollen ankles, " +
      "and has a deeply calming effect on the nervous system. Ideal for after a long stressful day.",
    balances_doshas: ["Vata", "Pitta"],
    aggravates_doshas: [],
    best_for_season: "any",
    best_time_of_day: "evening",
    helps_with_emotions: ["stress", "lethargy", "anxiety", "sadness"],
    duration_minutes: 15,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Place a folded blanket near the base of a wall." },
      { step: 2, instruction: "Sit on the blanket with hips close to the wall." },
      { step: 3, instruction: "Swing your legs up the wall as you lie back." },
      { step: 4, instruction: "Let your arms rest open at your sides, palms up." },
      { step: 5, instruction: "Stay for 10–20 minutes. Breathe deeply and relax fully." },
    ],
    precautions: ["Avoid during menstruation or if you have glaucoma."],
    traditional_source: "Iyengar Yoga Tradition",
  },

  // ─── EXTRA LIFESTYLE 
  {
    content_type: "lifestyle",
    title: "Abhyanga (Self Oil Massage)",
    description_short: "Daily self-massage with warm sesame oil that nourishes skin and calms Vata.",
    description_detailed:
      "Abhyanga is one of the most powerful Ayurvedic daily rituals. " +
      "Warm oil penetrates the skin, lubricates joints, and pacifies Vata — the dosha most responsible for anxiety and dryness.",
    balances_doshas: ["Vata"],
    aggravates_doshas: [],
    best_for_season: "winter",
    best_time_of_day: "morning",
    helps_with_emotions: ["anxiety", "stress", "lethargy"],
    duration_minutes: 15,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Warm ¼ cup of sesame oil (place the bottle in a bowl of hot water for 10 min)." },
      { step: 2, instruction: "Start at the top of your head. Massage scalp in circular motions." },
      { step: 3, instruction: "Move to neck, shoulders, arms — always massage toward the heart." },
      { step: 4, instruction: "Massage the torso in circular motions on the belly." },
      { step: 5, instruction: "Legs: long strokes from hip to ankle, circles on joints." },
      { step: 6, instruction: "Sit for 5 minutes to let the oil absorb, then shower with warm water." },
    ],
    precautions: ["Use unscented sesame oil. Avoid if you have a rash or skin infection."],
    traditional_source: "Charaka Samhita — Sthana 2",
  },

  // ─── EXTRA HERB
  {
    content_type: "herb",
    title: "Ashwagandha Root Tea",
    description_short: "King of Ayurvedic adaptogenic herbs — reduces cortisol and builds resilience.",
    description_detailed:
      "Ashwagandha (Withania somnifera) has been called 'Indian Ginseng' for its ability to combat stress " +
      "without causing drowsiness. It supports the adrenal glands and helps the body adapt to physical and emotional stress.",
    balances_doshas: ["Vata", "Kapha"],
    aggravates_doshas: ["Pitta"],
    best_for_season: "winter",
    best_time_of_day: "evening",
    helps_with_emotions: ["anxiety", "stress", "fear", "depression"],
    duration_minutes: 5,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Add 1 tsp ashwagandha root powder to a cup." },
      { step: 2, instruction: "Pour hot (not boiling) water. Steep 10 minutes." },
      { step: 3, instruction: "Strain. Add honey and a pinch of cardamom." },
      { step: 4, instruction: "Drink 30 minutes before bed for best results." },
    ],
    precautions: [
      "Consult a doctor if pregnant, nursing, or on thyroid/blood pressure medication.",
      "Some may experience mild digestive upset initially.",
    ],
    traditional_source: "Charaka Samhita — Rasayana",
  },

  // ─── EXTRA DIET 
  {
    content_type: "diet",
    title: "Kapha-Boosting Warm Soup",
    description_short: "Light, pungent soup that stimulates sluggish Kapha digestion.",
    description_detailed:
      "When Kapha is imbalanced (sluggish, heavy, sad), light and pungent foods are prescribed. " +
      "This ginger-turmeric lentil soup does exactly that — warms the gut and lifts heavy emotions.",
    balances_doshas: ["Kapha"],
    aggravates_doshas: ["Vata"],
    best_for_season: "winter",
    best_time_of_day: "afternoon",
    helps_with_emotions: ["lethargy", "sadness", "depression", "grief"],
    duration_minutes: 30,
    difficulty: "beginner",
    steps: [
      { step: 1, instruction: "Soak ½ cup red lentils for 30 minutes. Drain." },
      { step: 2, instruction: "In a pot, sauté 1 tbsp ghee with 1 tsp grated ginger and ½ tsp turmeric." },
      { step: 3, instruction: "Add lentils + 3 cups water. Bring to boil." },
      { step: 4, instruction: "Simmer 20 minutes until lentils are soft." },
      { step: 5, instruction: "Season with salt and a squeeze of lemon. Serve warm." },
    ],
    precautions: ["Adjust spice level to your tolerance."],
    traditional_source: "Traditional Indian Kitchen + Ayurvedic Diet",
  },
];

async function main() {
  console.log("🌱 Seeding ayurveda_knowledge …");

  for (const p of PRACTICES) {
    await pool.query(
      `INSERT INTO ayurveda_knowledge
         (content_type, title, description_short, description_detailed,
          balances_doshas, aggravates_doshas, best_for_season, best_time_of_day,
          helps_with_emotions, duration_minutes, difficulty, steps, precautions, traditional_source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        p.content_type,
        p.title,
        p.description_short,
        p.description_detailed,
        p.balances_doshas,
        p.aggravates_doshas,
        p.best_for_season,
        p.best_time_of_day,
        p.helps_with_emotions,
        p.duration_minutes,
        p.difficulty,
        JSON.stringify(p.steps),
        p.precautions,
        p.traditional_source,
      ]
    );
    console.log(`  ✓ ${p.title}`);
  }

  console.log(`\n✅ Seeded ${PRACTICES.length} practices into ayurveda_knowledge.`);
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  pool.end();
  process.exit(1);
});