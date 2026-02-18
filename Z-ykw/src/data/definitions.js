// src/data/definitions.js

export const Definitions = {
  player: {
    baseHp: 100,
    baseStats: {
      strength: 5,
      defense: 0,
      speed: 10,
      critChance: 5,
      critMultiplier: 1.5
    },
    baseActionPoints: 3,
  },

  items: {
    rusty_sword: {
      id: "rusty_sword",
      name: "Rostiges Schwert",
      type: "weapon",
      damage: 5,
      critChance: 10,
      value: 10,
    },
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
    magic_shard: {
      id: "magic_shard",
      name: "Magiesplitter",
      type: "ritual",
      description: "Ein vibrierendes Kristallstück.",
      goldValue: 10,
      ritualValue: 5,
      modifierType: "sharpness"
    },
    ancient_wood: {
      id: "ancient_wood",
      name: "Uraltes Holz",
      type: "ritual",
      description: "Hart wie Eisen.",
      goldValue: 5,
      ritualValue: 3,
      modifierType: "defense"
    },
    
  },

  abilities: {
    normal_attack: {
      id: "normal_attack",
      name: "Angriff",
      type: "attack",
      damageMult: 1.0, // 100% Schaden
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
      lootTable: [{ itemId: "goblin_ear", chance: 0.1 }], // Platzhalter Loot
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
      securityCost: 0,
      choices: [
        { text: "Beten (+10 HP)", effect: "heal_10" },
        { text: "Ignorieren", effect: "none" },
      ],
    },
  },
};
