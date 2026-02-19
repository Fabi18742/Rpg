// src/data/definitions.js

export const Definitions = {
  player: {
    baseHp: 100,
    baseStats: {
      strength: 5,
      defense: 0,
      speed: 10,
      critChance: 5,
      critMultiplier: 1.5,
    },
    baseActionPoints: 3,
  },

  items: {
    iron_shield: {
      id: "iron_shield",
      name: "Eisenschild",
      type: "armor",
      defense: 3,
      value: 15,
    },
    potion_small: {
      id: "potion_small",
      name: "Kleiner Heiltrank",
      type: "consumable",
      effect: "heal",
      value: 30,
      goldValue: 5,
    },
    goblin_ear: {
      id: "goblin_ear",
      name: "Goblinohr",
      type: "material",
      description: "Glibberig.",
      goldValue: 2,
    },
    ritual_shard: {
      id: "ritual_shard",
      name: "Ritualsplitter",
      type: "ritual",
      description: "Ein energetisch geladenes Fragment.",
      ritualValue: 5, // Hoher Wert
      modifierType: "sharpness",
    },
    ritual_essence: {
      id: "ritual_essence",
      name: "Wald-Essenz",
      type: "ritual",
      description: "Die pure Kraft der Natur.",
      ritualValue: 3, // Mittlerer Wert
      modifierType: "lifesteal",
    },
    ritual_stone: {
      id: "ritual_stone",
      name: "Runenstein",
      type: "ritual",
      description: "Ein schwerer Stein mit Gravuren.",
      ritualValue: 8, // Sehr hoher Wert
      modifierType: "poison",
    },
  },

  weapons: {
    rusty_sword: {
      id: "rusty_sword",
      name: "Rostiges Schwert",
      type: "weapon",
      damage: 5,
      critChance: 10,
      value: 10,
    },
    dagger: {
      id: "dagger",
      name: "Ritual-Dolch",
      type: "weapon",
      damage: 8,
      critChance: 15, // Dolche sind schnell -> mehr Crit
      ritualValue: 12,
      description: "Eine leichte, schnelle Klinge aus dem Ritual.",
    },

    // Tier 2 (Summe ~20-25)
    sword: {
      id: "sword",
      name: "Ritual-Schwert",
      type: "weapon",
      damage: 12,
      critChance: 10,
      ritualValue: 22,
      description: "Eine ausgewogene Waffe, geschmiedet durch Magie.",
    },

    // Tier 3 (Summe ~30+)
    axe: {
      id: "axe",
      name: "Ritual-Axt",
      type: "weapon",
      damage: 18,
      critChance: 5, // Äxte sind wuchtig -> weniger Crit, mehr Damage
      ritualValue: 32,
      description: "Eine schwere Waffe voller roher Energie.",
    },
  },

  effects: {
    sharpness: {
      id: "sharpness",
      name: "Schärfe",
      description: "Erhöht den Schaden.",
      type: "stat_boost", // Passiv: Erhöht einfach einen Wert
      stat: "damage",
      value: 3,
    },
    poison: {
      id: "poison",
      name: "Gift",
      description: "Verursacht Giftschaden, der sich hochstapelt.",
      type: "on_hit",
      trigger: "apply_status",
      statusId: "poison_dot",
      statusType: "dot",
      baseDamage: 1,
      stacksToApply: 2,
      applyChance: 0.6,
    },
    lifesteal: {
      id: "lifesteal",
      name: "Vampirismus",
      description: "Heilt dich bei jedem Treffer.",
      type: "on_hit",
      trigger: "heal_attacker",
      value: 0.2, // 20% des verursachten Schadens als Heilung
    },
  },

  abilities: {
    normal_attack: {
      id: "normal_attack",
      name: "Angriff",
      type: "attack",
      damageMult: 1.0,
      text: "greift an",
      apCost: 1,
    },
    heavy_strike: {
      id: "heavy_strike",
      name: "Wuchtschlag",
      type: "attack",
      damageMult: 1.5, // 150% Schaden
      accuracy: 0.7, // 70% Trefferchance (Logik bauen wir gleich)
      text: "holt weit aus",
      apCost: 2,
    },
    quick_heal: {
      id: "quick_heal",
      name: "Verband",
      type: "heal",
      value: 15,
      text: "verbindet die Wunden",
      apCost: 1,
    },
  },

  enemies: {
    goblin: {
      id: "goblin",
      name: "Frecher Goblin",
      hp: 30,
      strength: 3,
      defense: 0,
      xp: 15,
      lootTable: [
        { itemId: "goblin_ear", chance: 0.8 },
        { itemId: "potion_small", chance: 0.2 },
      ],
    },
    wolf: {
      id: "wolf",
      name: "Hungriger Wolf",
      hp: 50,
      strength: 5,
      defense: 1,
      xp: 25,
      lootTable: [{ itemId: "goblin_ear", chance: 0.1 }],
    },
  },

  worlds: {
    forest: {
      id: "forest",
      name: "Düsterwald",
      description: "Ein dunkler Wald voller Gefahren.",
      baseSecurity: 100,
      events: ["combat_goblin", "combat_wolf", "event_shrine"],
    },
  },

  events: {
    combat_goblin: {
      id: "combat_goblin",
      type: "combat",
      enemies: ["goblin", "goblin"],
      securityCost: 5,
      text: "Ein Goblin springt aus dem Gebüsch!",
    },
    combat_wolf: {
      id: "combat_wolf",
      type: "combat",
      enemyId: "wolf",
      securityCost: 10,
      text: "Ein Wolf knurrt dich an.",
    },
    event_shrine: {
      id: "event_shrine",
      type: "choice",
      name: "Verlassener Schrein",
      text: "Du findest einen alten Schrein. Er leuchtet schwach.",
      securityCost: 1,
      choices: [
        { text: "Beten (+10 HP)", effect: "heal_10" },
        { text: "Ignorieren", effect: "none" },
      ],
    },
  },
  
  merchants: {
    traveling_merchant: {
      id: "traveling_merchant",
      name: "Der zwielichtige Händler",
      offers: [
        { id: "potion_small", price: 10 },
        { id: "rusty_sword", price: 25 },
        { id: "ritual_stone", price: 80 },
      ],
    },
  },
};
