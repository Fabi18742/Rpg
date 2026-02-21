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
    lederwams: {
      id: "lederwams",
      name: "Lederwams",
      type: "armor",
      defense: 2,
      value: 20,
      description: "Bietet grundlegenden Schutz vor Schlägen.",
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
      damageType: "schlitz",
      damage: 5,
      critChance: 10,
      value: 10,
    },
    dagger: {
      id: "dagger",
      name: "Ritual-Dolch",
      type: "weapon",
      damageType: "stich",
      damage: 8,
      critChance: 15,
      ritualValue: 12,
      description: "Eine leichte, schnelle Klinge aus dem Ritual.",
    },
    sword: {
      id: "sword",
      name: "Ritual-Schwert",
      type: "weapon",
      damageType: "schlitz",
      damage: 12,
      critChance: 10,
      ritualValue: 22,
      description: "Eine ausgewogene Waffe, geschmiedet durch Magie.",
    },
    axe: {
      id: "axe",
      name: "Ritual-Axt",
      type: "weapon",
      damageType: "hieb",
      damage: 18,
      critChance: 5,
      ritualValue: 32,
      description: "Eine schwere Waffe voller roher Energie.",
    },
  },

  effects: {
    sharpness: {
      id: "sharpness",
      name: "Schärfe",
      description: "Erhöht den Schaden.",
      type: "stat_boost",
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
    cleave: {
      id: "cleave",
      name: "Rundumschlag",
      type: "attack",
      damageMult: 0.8,
      isAoE: true,
      text: "schwingt die Waffe im weiten Bogen",
      apCost: 2,
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
      weaknesses: ["schlitz"],
      resistances: ["hieb"],
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
      weaknesses: ["stich"],
      resistances: ["schlitz"],
      lootTable: [{ itemId: "goblin_ear", chance: 0.1 }],
    },

    //Bosse
    boss_forest: {
      id: "boss_forest",
      name: "Großer Wald-Wächter",
      hp: 100,
      strength: 8,
      defense: 1,
      xp: 100,
      gold: 50,
      lootTable: [{ itemId: "ritual_stone", chance: 1.0 }],
    },
    boss_city: {
      id: "boss_city",
      name: "Korrupter Stadthalter",
      hp: 200,
      strength: 12,
      defense: 3,
      xp: 250,
      gold: 120,
      lootTable: [{ itemId: "potion_small", chance: 1.0 }],
    },
  },

  worlds: {
    forest: {
      id: "forest",
      name: "Düsterwald",
      description: "Ein dunkler Wald voller Gefahren.",
      baseSecurity: 10,
      bossId: "boss_forest",
      requiredBoss: null,
      events: ["combat_goblin", "combat_wolf", "event_shrine"],
    },
    city: {
      id: "city",
      name: "Die dunkle Stadt",
      description: "Eine verlassene Stadt voller Diebe und Halsabschneider.",
      baseSecurity: 15,
      bossId: "boss_city",
      requiredBoss: "boss_forest",
      events: ["combat_goblin", "combat_wolf", "event_shrine"],
    },
    village_story: {
      id: "village_story",
      type: "story",
      name: "Verlassenes Dorf",
      description: "Folge den Spuren des alten Kults.",
      baseSecurity: 20,
      bossId: null,
      events: [
        "story_village_start",
        "combat_goblin",
        "event_shrine",
        "combat_wolf_2",
      ],
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
    combat_wolf_2: {
      id: "combat_wolf_2",
      type: "combat",
      enemies: ["wolf", "wolf"],
      securityCost: 10,
      minChaos: 3,
      maxChaos: 10,
      text: "Ein Wolf knurrt dich an.",
    },
    event_shrine: {
      id: "event_shrine",
      type: "choice",
      name: "Verlassener Schrein",
      text: "Du findest einen alten Schrein. Er leuchtet schwach.",
      securityCost: 1,
      choices: [
        { text: "Beten", effect: "heal_10" },
        { text: "Ignorieren", effect: "none" },
      ],
    },

    story_village_start: {
      id: "story_village_start",
      type: "choice",
      name: "Die alte Taverne",
      text: `Du betrittst eine zerstörte Taverne. Im Schatten sitzt eine vermummte Gestalt.`,
      securityCost: 0,
      choices: [
        {
          text: "Mit ihm sprechen",
          effect: "none",
          nextEvent: "story_village_talk",
        },
        {
          text: "Sofort angreifen!",
          effect: "none",
          nextEvent: "combat_village_stranger",
        },
      ],
    },

    //TEIL 2
    story_village_talk: {
      id: "story_village_talk",
      type: "choice",
      name: "Der Kultist",
      text: "Er lacht: 'Du kommst zu spät!' und verschwindet in einer Rauchwolke. Er lässt etwas fallen.",
      securityCost: 0,
      choices: [
        {
          text: "Aufheben und gehen",
          effect: "loot_ritual_shard",
          nextEvent: "story_village_exit",
        },
      ],
    },

    combat_village_stranger: {
      id: "combat_village_stranger",
      type: "combat",
      enemies: ["wolf"],
      securityCost: 0,
      text: "Die Gestalt wirft ihren Mantel ab - es ist ein Werwolf!",
      onWinEvent: "story_village_exit",
    },

    story_village_exit: {
      id: "story_village_exit",
      type: "choice",
      name: "Der geheime Ausgang",
      text: "Du hast gefunden, wonach du gesucht hast. Ein Pfad führt zurück.",
      securityCost: 0,
      choices: [
        { text: "Dungeon verlassen", effect: "exit" },
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
    mystic_merchant: {
      id: "mystic_merchant",
      name: "Der Kult-Apotheker",
      offers: [
        { id: "potion_small", price: 8 },
        { id: "ritual_shard", price: 40 },
        { id: "ritual_essence", price: 90 },
      ],
    },
  },

  achievements: {
    boss_forest_kill: {
      id: "boss_forest_kill",
      name: "Holzfäller",
      description: "Besiege den Großen Wald-Wächter im Düsterwald.",
      triggerType: "boss_kill",
      targetId: "boss_forest",
      rewardText: "Schaltet Fähigkeit frei: Rundumschlag",
      unlocksSkill: "cleave",
    },
    boss_city_kill: {
      id: "boss_city_kill",
      name: "Stadthälter",
      description: "Besiege den Boss in der Stadt.",
      triggerType: "boss_kill",
      targetId: "boss_city",
      rewardText: "Schaltet einen neuen Händler frei",
      unlocksMerchant: "mystic_merchant",
    },
  },
};
