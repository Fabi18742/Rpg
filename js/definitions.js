const Definitions = {
  // ===== SPIELER-STANDARD-WERTE =====
  player: {
    level: 1,
    hp: 100,
    maxHp: 100,
    gold: 0,
    actionPoints: 3,
    maxActionPoints: 3,
    stats: {
      strength: 5,
      defense: 0,
      glitzer: 0,
    },
    startWeapon: "dagger",
    startAbilities: ["stich"],
  },

  // ===== ITEMS =====
  items: {
    // Währungen & Konsum
    glitzer: {
      id: "glitzer",
      name: "Glitzer",
      type: "currency",
      description: "Funkelnder Glitzer.",
    },
    heiltrank: {
      id: "heiltrank",
      name: "Kleiner Heiltrank",
      type: "consumable",
      description: "Heilt 30 HP",
      healAmount: 30,
      glitzerValue: 5,
    },
    heiltrank_gross: {
      id: "heiltrank_gross",
      name: "Großer Heiltrank",
      type: "consumable",
      description: "Heilt 80 HP",
      healAmount: 80,
      glitzerValue: 15,
    },
    maxHpTrank: {
      id: "maxHpTrank",
      name: "Lebenselixier",
      type: "consumable",
      description: "Erhöht Maximale HP um 50",
      maxHpIncrease: 50,
      glitzerValue: 1,
    },

    // ===== RITUAL-ITEMS (CRAFTING MATS) =====
    // Tier 1 (Welt 1)
    ritual_knochen: {
      id: "ritual_knochen",
      name: "Morscher Knochen",
      type: "ritual",
      description: "Ein alter Knochen (Tier 1)",
      modifierType: "none",
      value: 1,
      glitzerValue: 1,
    },
    ritual_harz: {
      id: "ritual_harz",
      name: "Klebriges Harz",
      type: "ritual",
      description: "Riecht streng (Tier 1)",
      modifierType: "poison",
      value: 2,
      glitzerValue: 2,
    },

    // Tier 2 (Welt 2)
    ritual_sumpfkraut: {
      id: "ritual_sumpfkraut",
      name: "Sumpfkraut",
      type: "ritual",
      description: "Giftiges Gewächs (Tier 2)",
      modifierType: "poison",
      value: 3,
      glitzerValue: 5,
    },
    ritual_eisen: {
      id: "ritual_eisen",
      name: "Rostiges Eisen",
      type: "ritual",
      description: "Hartes Metall (Tier 2)",
      modifierType: "testdamage",
      value: 4,
      glitzerValue: 8,
    },

    // Tier 3 (Welt 3)
    ritual_stahl: {
      id: "ritual_stahl",
      name: "Alter Stahl",
      type: "ritual",
      description: "Gut zum Schmieden (Tier 3)",
      modifierType: "testdamage",
      value: 5,
      glitzerValue: 12,
    },
    ritual_geiststaub: {
      id: "ritual_geiststaub",
      name: "Geiststaub",
      type: "ritual",
      description: "Schimmert fahl (Tier 3)",
      modifierType: "none",
      value: 6,
      glitzerValue: 15,
    },

    // Tier 4 (Welt 4)
    ritual_magma: {
      id: "ritual_magma",
      name: "Erkaltetes Magma",
      type: "ritual",
      description: "Noch immer warm (Tier 4)",
      modifierType: "testdamage",
      value: 7,
      glitzerValue: 25,
    },
    ritual_obsidian: {
      id: "ritual_obsidian",
      name: "Scharfer Obsidian",
      type: "ritual",
      description: "Schneidet alles (Tier 4)",
      modifierType: "poison",
      value: 8,
      glitzerValue: 30,
    },

    // Tier 5 (Welt 5)
    ritual_void: {
      id: "ritual_void",
      name: "Essenz der Leere",
      type: "ritual",
      description: "Verschluckt Licht (Tier 5)",
      modifierType: "none",
      value: 9,
      glitzerValue: 50,
    },
    ritual_sternensplitter: {
      id: "ritual_sternensplitter",
      name: "Sternensplitter",
      type: "ritual",
      description: "Pure Macht (Tier 5)",
      modifierType: "testdamage",
      value: 10,
      glitzerValue: 100,
    },
  },

  // ===== WAFFENBASEN =====
  weaponBases: {
    // Spieler Waffen
    dagger: {
      id: "dagger",
      name: "Rostiger Dolch",
      type: "physical",
      damage: 4,
      description: "Besser als nichts.",
      baseGlitzerValue: 1,
      ritualValue: 5,
    },
    shortsword: {
      id: "shortsword",
      name: "Kurzschwert",
      type: "physical",
      damage: 8,
      description: "Eine solide Waffe.",
      baseGlitzerValue: 10,
      ritualValue: 15,
    },
    axe: {
      id: "axe",
      name: "Holzfälleraxt",
      type: "physical",
      damage: 12,
      description: "Wuchtig aber effektiv.",
      baseGlitzerValue: 20,
      ritualValue: 25,
    },
    knightsword: {
      id: "knightsword",
      name: "Ritterschwert",
      type: "physical",
      damage: 18,
      description: "Von einem gefallenen Helden.",
      baseGlitzerValue: 50,
      ritualValue: 35,
    },
    warhammer: {
      id: "warhammer",
      name: "Kriegshammer",
      type: "physical",
      damage: 25,
      description: "Zerschmettert Rüstungen.",
      baseGlitzerValue: 80,
      ritualValue: 45,
    },
    voidblade: {
      id: "voidblade",
      name: "Klinge der Leere",
      type: "physical",
      damage: 50,
      description: "Eine Waffe aus einer anderen Welt.",
      baseGlitzerValue: 200,
      ritualValue: 60,
    },

    // Monster Waffen
    monster_claws: {
      id: "monster_claws",
      name: "Scharfe Klauen",
      type: "physical",
      damage: 5,
      description: "",
      baseGlitzerValue: 0,
      ritualValue: 0,
    },
    monster_teeth: {
      id: "monster_teeth",
      name: "Faulige Zähne",
      type: "physical",
      damage: 8,
      description: "",
      baseGlitzerValue: 0,
      ritualValue: 0,
    },
    monster_slime: {
      id: "monster_slime",
      name: "Säure-Spucke",
      type: "physical",
      damage: 12,
      description: "",
      baseGlitzerValue: 0,
      ritualValue: 0,
    },
    monster_fire: {
      id: "monster_fire",
      name: "Feuerball",
      type: "physical",
      damage: 20,
      description: "",
      baseGlitzerValue: 0,
      ritualValue: 0,
    },
    monster_void: {
      id: "monster_void",
      name: "Existenzlöschung",
      type: "physical",
      damage: 35,
      description: "",
      baseGlitzerValue: 0,
      ritualValue: 0,
    },
  },

  // ===== EFFEKT-SYSTEM =====
  effects: {
    testdamage: {
      id: "testdamage",
      name: "Schärfe",
      description: "+5 Direktschaden",
      glitzerValueMultiplier: 1.5,
      type: "damage",
      value: 5,
    },
    poison: {
      id: "poison",
      name: "Gift",
      description: "Chance auf Gift",
      glitzerValueMultiplier: 2.0,
      type: "poison",
      value: 3,
      applyChance: 0.4,
      stacksToApply: 3,
      ignoreArmor: true,
    },
  },

  // ===== FÄHIGKEITEN-SYSTEM =====
  abilities: {
    stich: {
      id: "stich",
      name: "Schneller Stich",
      description: "Ein schneller Angriff.",
      damageType: "physical",
      apCost: 1,
      attacks: 1,
      damageMultiplier: 1.0,
      hitChance: 1.0,
    },
    doppelhit: {
      id: "doppelhit",
      name: "Doppelschlag",
      description: "Zwei Angriffe, weniger Schaden pro Schlag.",
      damageType: "physical",
      apCost: 2,
      attacks: 2,
      damageMultiplier: 0.8,
      hitChance: 0.9,
    },
    wuchtschlag: {
      id: "wuchtschlag",
      name: "Wuchtschlag",
      description: "Ein schwerer Treffer mit viel Schaden.",
      damageType: "physical",
      apCost: 2,
      attacks: 1,
      damageMultiplier: 2.5,
      hitChance: 0.85,
    },
    riskanterSchlag: {
      id: "riskanterSchlag",
      name: "Todesroulette",
      description: "Massiver Schaden, aber trifft oft nicht.",
      damageType: "physical",
      apCost: 1,
      attacks: 1,
      damageMultiplier: 3.5,
      hitChance: 0.5,
    },
    rageAttack: {
      id: "rageAttack",
      name: "Raserei",
      description: "Ein Hagel aus Schlägen.",
      damageType: "physical",
      apCost: 3,
      attacks: 6,
      damageMultiplier: 0.5,
      hitChance: 0.9,
    },
  },

  // ===== GEGNER =====
  enemies: {
    // Welt 1
    ratte: {
      id: "ratte",
      name: "Riesenratte",
      hp: 30,
      maxHp: 30,
      stats: { strength: 0, defense: 0, magic: 0, speed: 2 },
      weapon: { baseId: "monster_teeth", effects: [] },
      drops: ["ritual_knochen"],
    },
    wolf: {
      id: "wolf",
      name: "Hungriger Wolf",
      hp: 50,
      maxHp: 50,
      stats: { strength: 2, defense: 0, magic: 0, speed: 5 },
      weapon: { baseId: "monster_claws", effects: [] },
      drops: ["ritual_knochen", "ritual_harz"],
    },
    // Welt 2
    schleim: {
      id: "schleim",
      name: "Giftschleim",
      hp: 70,
      maxHp: 70,
      stats: { strength: 0, defense: 2, magic: 0, speed: 1 },
      weapon: { baseId: "monster_slime", effects: ["poison"] },
      drops: ["ritual_sumpfkraut", "heiltrank"],
    },
    sumpfhexe: {
      id: "sumpfhexe",
      name: "Sumpfhexe",
      hp: 90,
      maxHp: 90,
      stats: { strength: 0, defense: 0, magic: 5, speed: 3 },
      weapon: { baseId: "monster_claws", effects: ["poison"] },
      drops: ["ritual_eisen", "ritual_sumpfkraut"],
    },
    // Welt 3
    skelett: {
      id: "skelett",
      name: "Klappergestell",
      hp: 120,
      maxHp: 120,
      stats: { strength: 5, defense: 5, magic: 0, speed: 2 },
      weapon: { baseId: "shortsword", effects: [] },
      drops: ["ritual_knochen", "ritual_stahl"],
    },
    ritter: {
      id: "ritter",
      name: "Dunkler Knappe",
      hp: 160,
      maxHp: 160,
      stats: { strength: 8, defense: 10, magic: 0, speed: 1 },
      weapon: { baseId: "knightsword", effects: [] },
      drops: ["maxHpTrank", "ritual_geiststaub"],
    },
    // Welt 4
    feuergeist: {
      id: "feuergeist",
      name: "Glutgeist",
      hp: 220,
      maxHp: 220,
      stats: { strength: 0, defense: 5, magic: 10, speed: 6 },
      weapon: { baseId: "monster_fire", effects: ["testdamage"] },
      drops: ["ritual_magma"],
    },
    golem: {
      id: "golem",
      name: "Lavagolem",
      hp: 300,
      maxHp: 300,
      stats: { strength: 15, defense: 20, magic: 0, speed: 0 },
      weapon: { baseId: "warhammer", effects: [] },
      drops: ["ritual_obsidian", "ritual_magma"],
    },
    // Welt 5
    schatten: {
      id: "schatten",
      name: "Schattenriss",
      hp: 400,
      maxHp: 400,
      stats: { strength: 20, defense: 10, magic: 20, speed: 10 },
      weapon: { baseId: "monster_void", effects: [] },
      drops: ["ritual_void"],
    },
    voidwalker: {
      id: "voidwalker",
      name: "Leerenwandler",
      hp: 550,
      maxHp: 550,
      stats: { strength: 15, defense: 15, magic: 20, speed: 8 },
      weapon: { baseId: "voidblade", effects: ["poison"] },
      drops: ["ritual_sternensplitter"],
    },
  },

  // ===== BOSSE =====
  bosses: {
    boss1: {
      id: "boss_faulwurz",
      name: "Faulwurz der Alte",
      hp: 250,
      maxHp: 250,
      actionPoints: 2,
      stats: { strength: 5, defense: 2 },
      weapon: { baseId: "monster_claws", effects: [] },
      drops: [{ type: "ability", id: "doppelhit" }, "ritual_harz"],
    },
    boss2: {
      id: "boss_schlammkoenig",
      name: "Gubba der Schlammkönig",
      hp: 600,
      maxHp: 600,
      actionPoints: 2,
      stats: { strength: 8, defense: 5 },
      weapon: { baseId: "monster_slime", effects: ["poison"] },
      drops: [{ type: "ability", id: "wuchtschlag" }, "ritual_eisen"],
    },
    boss3: {
      id: "boss_schwarzer_ritter",
      name: "Lord Rassel",
      hp: 1200,
      maxHp: 1200,
      actionPoints: 3,
      stats: { strength: 15, defense: 20 },
      weapon: { baseId: "knightsword", effects: ["testdamage"] },
      drops: [{ type: "ability", id: "riskanterSchlag" }, "ritual_geiststaub"],
    },
    boss4: {
      id: "boss_inferno",
      name: "Ignis der Verbrenner",
      hp: 2500,
      maxHp: 2500,
      actionPoints: 3,
      stats: { strength: 25, defense: 10 },
      weapon: { baseId: "monster_fire", effects: ["testdamage", "testdamage"] },
      drops: [{ type: "ability", id: "rageAttack" }, "ritual_obsidian"],
    },
    boss5: {
      id: "boss_endboss",
      name: "DER WELTENFRESSER",
      hp: 5000,
      maxHp: 5000,
      actionPoints: 4,
      stats: { strength: 40, defense: 30 },
      weapon: { baseId: "monster_void", effects: ["poison", "testdamage"] },
      drops: ["glitzer"], //dafuq fehler
    },
  },

  // ===== BOSS-WELTEN =====
  // Jede Welt hat min. 4 Events die IMMER möglich sind (min:0, max:null)
  bossWorlds: {
    welt1: {
      id: "welt1",
      name: "Der Modrige Wald",
      description: "Es riecht nach Erde.",
      boss: "boss1",
      allowedEvents: [
        "combat_w1_easy",
        "combat_w1_med",
        "combat_w1_hard",
        "combat_w1_uni",
        "story_w1_falle",
        "story_w1_beere",
        "story_generic_loot",
        "story_generic_exit",
      ],
    },
    welt2: {
      id: "welt2",
      name: "Der Nebelsumpf",
      description: "Giftige Dämpfe.",
      boss: "boss2",
      allowedEvents: [
        "combat_w2_easy",
        "combat_w2_med",
        "combat_w2_hard",
        "combat_w2_uni",
        "story_w2_gas",
        "story_w2_leiche",
        "story_generic_loot",
        "story_generic_exit",
      ],
    },
    welt3: {
      id: "welt3",
      name: "Die Rostigen Ruinen",
      description: "Klappernde Knochen.",
      boss: "boss3",
      allowedEvents: [
        "combat_w3_easy",
        "combat_w3_med",
        "combat_w3_hard",
        "combat_w3_uni",
        "story_w3_altar",
        "story_w3_schmiede",
        "story_generic_loot",
        "story_generic_exit",
      ],
    },
    welt4: {
      id: "welt4",
      name: "Die Vulkanfestung",
      description: "Unerträgliche Hitze.",
      boss: "boss4",
      allowedEvents: [
        "combat_w4_easy",
        "combat_w4_med",
        "combat_w4_hard",
        "combat_w4_uni",
        "story_w4_lava",
        "story_w4_statue",
        "story_generic_loot",
        "story_generic_exit",
      ],
    },
    welt5: {
      id: "welt5",
      name: "Die Leere",
      description: "Nichts.",
      boss: "boss5",
      allowedEvents: [
        "combat_w5_easy",
        "combat_w5_med",
        "combat_w5_hard",
        "combat_w5_uni",
        "story_w5_whisper",
        "story_w5_void",
        "story_generic_loot",
        "story_generic_exit",
      ],
    },
  },

  // ===== CRAWL-EVENTS =====
  // Chaos 0-4 (Leicht), 5-7 (Mittel), 8-10 (Schwer)
  // Universal Events (maxChaos: null) sind IMMER möglich.
  // Erlaubte Effekte: 'addItem', 'addChaos'
  crawlEvents: {
    // --- GENERIC ---
    // Ersatz für den Händler, immer verfügbar
    story_generic_loot: {
      id: "story_generic_loot",
      name: "Verlorener Rucksack",
      description: "Jemand hat das hier liegen lassen.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 1,
      choices: [
        {
          text: "Durchsuchen",
          effects: [{ type: "addItem", itemId: "glitzer", amount: 5 }],
        },
        {
          text: "Liegen lassen",
          effects: [],
        },
      ],
    },

    story_generic_exit: {
      id: "story_generic_exit",
      name: "Geheimer Ausgang",
      description: "Ein kühler Luftzug verrät einen Spalt im Fels, der nach draußen führt. Willst du den Dungeon verlassen?",
      type: "multipleChoice",
      minChaos: 5,
      maxChaos: null, // Immer möglich
      securityDecrease: 0, // Kostet keine Sicherheit, da man ja geht (oder bleibt)
      choices: [
        {
          text: "Gebiet verlassen",
          effects: [{ type: "returnToHideout" }],
        },
        {
          text: "Weiter erkunden",
          effects: [{ type: "addChaos", amount: 1 }], // Kleiner Zeitverlust
        },
      ],
    },

    // --- WELT 1 EVENTS (Wald) ---
    combat_w1_easy: {
      id: "combat_w1_easy",
      name: "Rattenplage",
      description: "Ein paar Ratten greifen an!",
      type: "combat",
      minChaos: 0,
      maxChaos: 4,
      securityDecrease: 2,
      enemies: ["ratte", "ratte"],
    },
    combat_w1_med: {
      id: "combat_w1_med",
      name: "Wolfsrudel",
      description: "Wölfe kreisen dich ein.",
      type: "combat",
      minChaos: 5,
      maxChaos: 7,
      securityDecrease: 5,
      enemies: ["wolf", "ratte"],
    },
    combat_w1_hard: {
      id: "combat_w1_hard",
      name: "Alphatier",
      description: "Ein riesiger Wolf versperrt den Weg.",
      type: "combat",
      minChaos: 8,
      maxChaos: null,
      securityDecrease: 8,
      enemies: ["wolf", "wolf"],
    },

    // Universal Combat (immer möglich)
    combat_w1_uni: {
      id: "combat_w1_uni",
      name: "Streunender Wolf",
      description: "Ein einzelner Wolf sucht Beute.",
      type: "combat",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 3,
      enemies: ["wolf"],
    },

    story_w1_falle: {
      id: "story_w1_falle",
      name: "Bärenfalle",
      description: "Eine rostige Falle liegt im Laub.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 3,
      choices: [
        {
          text: "Entschärfen (Riskant)",
          effects: [
            { type: "addChaos", amount: 1 },
            { type: "addItem", itemId: "ritual_eisen", amount: 1 },
          ],
        },
        {
          text: "Drumherum laufen",
          effects: [{ type: "addChaos", amount: 2 }],
        },
      ],
    },
    story_w1_beere: {
      id: "story_w1_beere",
      name: "Roter Busch",
      description: "Sieht lecker aus.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 1,
      choices: [
        {
          text: "Essen",
          effects: [{ type: "addItem", itemId: "heiltrank", amount: 1 }],
        },
        {
          text: "Sammeln",
          effects: [{ type: "addItem", itemId: "ritual_harz", amount: 1 }],
        },
      ],
    },

    // --- WELT 2 EVENTS (Sumpf) ---
    combat_w2_easy: {
      id: "combat_w2_easy",
      name: "Schleimpfütze",
      description: "Der Boden lebt!",
      type: "combat",
      minChaos: 0,
      maxChaos: 4,
      securityDecrease: 3,
      enemies: ["schleim"],
    },
    combat_w2_med: {
      id: "combat_w2_med",
      name: "Hexenstunde",
      description: "Eine Hexe kichert im Nebel.",
      type: "combat",
      minChaos: 5,
      maxChaos: 7,
      securityDecrease: 6,
      enemies: ["sumpfhexe"],
    },
    combat_w2_hard: {
      id: "combat_w2_hard",
      name: "Sumpf-Hinterhalt",
      description: "Alles greift an!",
      type: "combat",
      minChaos: 8,
      maxChaos: null,
      securityDecrease: 10,
      enemies: ["sumpfhexe", "schleim", "schleim"],
    },

    // Universal Combat
    combat_w2_uni: {
      id: "combat_w2_uni",
      name: "Verirrter Schleim",
      description: "Er glibbert vor sich hin.",
      type: "combat",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 3,
      enemies: ["schleim"],
    },

    story_w2_gas: {
      id: "story_w2_gas",
      name: "Gaswolke",
      description: "Grüner Nebel zieht auf.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 5,
      choices: [
        {
          text: "Luft anhalten und rennen",
          effects: [{ type: "addChaos", amount: 1 }],
        },
        { text: "Atmen...", effects: [{ type: "addChaos", amount: 3 }] },
      ],
    },
    story_w2_leiche: {
      id: "story_w2_leiche",
      name: "Versunkener Abenteurer",
      description: "Nur noch der Arm schaut heraus.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 2,
      choices: [
        {
          text: "Plündern",
          effects: [
            { type: "addItem", itemId: "heiltrank", amount: 1 },
            { type: "addChaos", amount: 2 },
          ],
        },
        {
          text: "Ruhen lassen",
          effects: [{ type: "addItem", itemId: "heiltrank", amount: 1 }],
        },
      ],
    },

    // --- WELT 3 EVENTS (Ruinen) ---
    combat_w3_easy: {
      id: "combat_w3_easy",
      name: "Knochenhaufen",
      description: "Skelette erheben sich.",
      type: "combat",
      minChaos: 0,
      maxChaos: 4,
      securityDecrease: 4,
      enemies: ["skelett", "skelett"],
    },
    combat_w3_med: {
      id: "combat_w3_med",
      name: "Wache",
      description: "Ein dunkler Ritter hält Wache.",
      type: "combat",
      minChaos: 5,
      maxChaos: 7,
      securityDecrease: 7,
      enemies: ["ritter"],
    },
    combat_w3_hard: {
      id: "combat_w3_hard",
      name: "Todespatrouille",
      description: "Schwer gepanzerter Tod.",
      type: "combat",
      minChaos: 8,
      maxChaos: null,
      securityDecrease: 12,
      enemies: ["ritter", "skelett", "skelett"],
    },

    // Universal Combat
    combat_w3_uni: {
      id: "combat_w3_uni",
      name: "Einsames Skelett",
      description: "Klapper, klapper.",
      type: "combat",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 3,
      enemies: ["skelett"],
    },

    story_w3_altar: {
      id: "story_w3_altar",
      name: "Blutiger Altar",
      description: "Ein Opfer wird verlangt.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 5,
      choices: [
        {
          text: "Blut opfern (Riskant)",
          effects: [
            { type: "addChaos", amount: 4 },
            { type: "addItem", itemId: "ritual_stahl", amount: 2 },
          ],
        },
        {
          text: "Entweihen",
          effects: [
            { type: "addChaos", amount: 3 },
            { type: "addItem", itemId: "glitzer", amount: 5 },
          ],
        },
      ],
    },
    story_w3_schmiede: {
      id: "story_w3_schmiede",
      name: "Alte Schmiede",
      description: "Hier liegt noch brauchbares Material.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 2,
      choices: [
        {
          text: "Suchen",
          effects: [{ type: "addItem", itemId: "ritual_eisen", amount: 2 }],
        },
        {
          text: "Heilung suchen",
          effects: [{ type: "addItem", itemId: "heiltrank_gross", amount: 1 }],
        },
      ],
    },

    // --- WELT 4 EVENTS (Vulkan) ---
    combat_w4_easy: {
      id: "combat_w4_easy",
      name: "Funkenflug",
      description: "Kleine Feuergeister.",
      type: "combat",
      minChaos: 0,
      maxChaos: 4,
      securityDecrease: 5,
      enemies: ["feuergeist", "feuergeist"],
    },
    combat_w4_med: {
      id: "combat_w4_med",
      name: "Magma-Wall",
      description: "Ein Golem blockiert den Weg.",
      type: "combat",
      minChaos: 5,
      maxChaos: 7,
      securityDecrease: 8,
      enemies: ["golem"],
    },
    combat_w4_hard: {
      id: "combat_w4_hard",
      name: "Inferno",
      description: "Hitze und Tod.",
      type: "combat",
      minChaos: 8,
      maxChaos: null,
      securityDecrease: 15,
      enemies: ["golem", "feuergeist", "feuergeist"],
    },

    // Universal Combat
    combat_w4_uni: {
      id: "combat_w4_uni",
      name: "Laufende Flamme",
      description: "Ein Feuergeist greift an.",
      type: "combat",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 5,
      enemies: ["feuergeist"],
    },

    story_w4_lava: {
      id: "story_w4_lava",
      name: "Lavastrom",
      description: "Der Weg ist weg.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 5,
      choices: [
        {
          text: "Springen (Riskant)",
          effects: [{ type: "addChaos", amount: 5 }],
        },
        {
          text: "Umweg suchen (Zeitverlust)",
          effects: [{ type: "addChaos", amount: 2 }],
        },
      ],
    },
    story_w4_statue: {
      id: "story_w4_statue",
      name: "Weinende Statue",
      description: "Ihre Tränen sind aus Gold.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 2,
      choices: [
        {
          text: "Tränen nehmen",
          effects: [
            { type: "addItem", itemId: "glitzer", amount: 10 },
            { type: "addChaos", amount: 2 },
          ],
        },
        {
          text: "Beten",
          effects: [{ type: "addItem", itemId: "heiltrank_gross", amount: 1 }],
        },
      ],
    },

    // --- WELT 5 EVENTS (Void) ---
    combat_w5_easy: {
      id: "combat_w5_easy",
      name: "Schatten",
      description: "Sie flüstern deinen Namen.",
      type: "combat",
      minChaos: 0,
      maxChaos: 4,
      securityDecrease: 6,
      enemies: ["schatten", "schatten"],
    },
    combat_w5_med: {
      id: "combat_w5_med",
      name: "Leerenwächter",
      description: "Er existiert kaum.",
      type: "combat",
      minChaos: 5,
      maxChaos: 7,
      securityDecrease: 10,
      enemies: ["voidwalker"],
    },
    combat_w5_hard: {
      id: "combat_w5_hard",
      name: "TOTALE FINSTERNIS",
      description: "Du siehst nichts, aber es tut weh.",
      type: "combat",
      minChaos: 8,
      maxChaos: null,
      securityDecrease: 20,
      enemies: ["voidwalker", "schatten", "schatten"],
    },

    // Universal Combat
    combat_w5_uni: {
      id: "combat_w5_uni",
      name: "Schattenriss",
      description: "Ein Schatten löst sich aus der Wand.",
      type: "combat",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 6,
      enemies: ["schatten"],
    },

    story_w5_whisper: {
      id: "story_w5_whisper",
      name: "Stimmen",
      description: '"GIB AUF... GIB AUF..."',
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 5,
      choices: [
        { text: "NIEMALS!", effects: [{ type: "addChaos", amount: 3 }] },
        { text: "...", effects: [{ type: "addChaos", amount: 5 }] },
      ],
    },
    story_w5_void: {
      id: "story_w5_void",
      name: "Riss in der Realität",
      description: "Ein Blick in die Unendlichkeit.",
      type: "multipleChoice",
      minChaos: 0,
      maxChaos: null,
      securityDecrease: 5,
      choices: [
        {
          text: "Hineingreifen",
          effects: [
            { type: "addItem", itemId: "ritual_void", amount: 1 },
            { type: "addChaos", amount: 5 },
          ],
        },
        { text: "Wegsehen", effects: [] },
      ],
    },
  },

  // ===== SHOP-SYSTEM =====
  merchants: {
    testhaendler: {
      id: "testhaendler",
      name: "Reisender Händler",
      description: "Er hat Items aus allen Welten.",
      offers: [
        { itemId: "heiltrank", price: 10, currency: "glitzer" },
        { itemId: "heiltrank_gross", price: 25, currency: "glitzer" },
        { itemId: "ritual_knochen", price: 5, currency: "glitzer" },
        { itemId: "ritual_eisen", price: 15, currency: "glitzer" },
        { itemId: "ritual_magma", price: 50, currency: "glitzer" },
        { itemId: "maxHpTrank", price: 100, currency: "glitzer" },
      ],
    },
  },
};
