export const Definitions = {
  //================================================  Player
  player: {
    baseHp: 100,
    baseStats: {
      strength: 1,
      defense: 0,
      critChance: 5,
      critMultiplier: 1.5,
    },
    baseActionPoints: 3,
  },
  //================================================ Items
  items: {
    heil_trank_klein: {
      id: "heil_trank_klein",
      name: "Kleiner Heiltrank",
      type: "consumable",
      description:
        "Eine schmale Glasphiole, gefüllt mit einer sanft schimmernden, rubinroten Flüssigkeit. Feine goldene Schlieren durchziehen den Trank und leuchten schwach im Dunkeln. Dieser Trank stellt 30 HP wieder her.",
      value: 30,
      effect: "heal",
      goldValue: 5,
    },
    heil_trank_mittel: {
      id: "heil_trank_mittel",
      name: "Mittlerer Heiltrank",
      type: "consumable",
      description:
        "Eine langgestreckte Glasphiole, gefüllt mit einer beträchtlichen Menge der sanft schimmernden, rubinroten Flüssigkeit. Die feinen goldenen Schlieren sind hier dichter verwoben und durchziehen den Trank wie ein leuchtendes Geflecht, das die Umgebung in ein stetiges, warmes Licht taucht. Dieser Trank stellt 60 HP wieder her.",
      value: 50,
      effect: "heal",
      goldValue: 10,
    },
    lederkutte:{
      id: 'lederkutte',
      name: 'Lederkutte',
      type: 'armor',
      description: 'Die blutige Lederkutte des Ruhestifters',
      goldValue: 40,
      defense: 3,
    }
  },
  //================================================ Waffen
  weapons: {
    stein_in_socke: {
      id: "stein_in_socke",
      name: "Stein in einer Socke",
      type: "weapon",
      description:
        "Eine ausgeleierte, ehemals weiße Socke, nun grau vor Schmutz und Blut, am Ende fest verknotet. In ihrem Inneren ruht ein faustgroßer Feldstein – unscheinbar, aber schwer genug, um Knochen splittern zu lassen. Bei jedem Schwung pfeift die improvisierte Waffe durch die Luft, unberechenbar und roh. Sie zeugt nicht von Handwerkskunst, sondern von Verzweiflung und Einfallsreichtum. In den richtigen Händen ist sie mehr als nur ein Stück Stoff und Stein – sie ist ein Argument.",
      value: 1,
      damageType: "hieb",
      damage: 1,
      critChance: 5,
    },
    zerbrochene_flasche: {
      id: "zerbrochene_flasche",
      name: "Zerbrochene Glasflasche",
      type: "weapon",
      description:
        "Der Hals einer einst gewöhnlichen Flasche, nun gezackt und scharf wie die Zähne eines Raubtiers. Splitter aus trübem Glas ragen ungleichmäßig hervor, bereit, Fleisch aufzureißen. Getrocknete Tropfen am Griff zeugen davon, dass diese improvisierte Waffe bereits ihren Zweck erfüllt hat.",
      damageType: "stich",
      damage: 1,
      critChance: 5,
    },
    angeschliffenes_hufeisen: {
      id: "angeschliffenes_hufeisen",
      name: "Angeschliffenes Hufeisen",
      type: "weapon",
      description:
        "Ein schweres, verrostetes Hufeisen, das wohl einst ein kräftiges Kaltblut getragen hat. Einer der Schenkel wurde mühsam an einem Bordstein flachgeschliffen, bis das Metall eine unebene aber scharfe Schneide bildete. Der gegenüberliegende Schenkel dient als Griff und ist mit ein paar Lagen modrigem Stroh und grobem Bindfaden umwickelt, um die Hand vor dem rostigen Eisen zu schützen.",
      value: 1,
      damageType: "schlitz",
      damage: 1,
      critChance: 5,
    },
  },

  //================================================ Fähigkeiten
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
      damageMult: 1.5,
      accuracy: 0.7,
      text: "holt weit aus",
      apCost: 2,
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

  //================================================ Effekt
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
      value: 0.2,
    },
  },

  //================================================ Gegner
  enemies: {

    //---------------------------------------------- Bosse
    der_ruhestifter: {
      id: 'der_ruhestifter',
      name: 'Der Ruhestifter',
      hp: 30,
      strength: 5,
      defense: 0,
      xp: 100,
      gold: 40,
      weaknesses: ['hieb'],
      resistances: ['stich'],
      lootTable: [{itemId: "lederkutte", chance: 1}]
    }
  },

  //================================================ Welten
  worlds: {
    story_forest: {
      id: 'story_forest',
      name: 'Düsterwald',
      description: 'Ein dunkler Wald voller Gefahren.',
      type: 'story',
      baseSecurity: 100,
      requiredAchievement: null,
      events: ['test'],
    },
    boss_forest: {
      id: "boss_forest",
      name: "Düsterwald - Die Lichtung",
      description: "Die Lichtung des Düsteren Waldes",
      baseSecurity: 100,
      bossId: 'der_ruhestifter',
      requiredAchievement: null,
      events: ["test"],
    },
  },

  //================================================ Events
  events: {
    test: {
      id: 'test',
      name: 'test',
      text: 'test',
      securityCost: 4,
      type: 'choice',
      choices: [
        { text: "test1", effect: "none" },
        { text: "test2", effect: "none" },
      ],
    }
  },

  //================================================ Händler
  merchants: {
    traveling_merchant: {
      id: "traveling_merchant",
      name: "Der zwielichtige Händler",
      offers: [
        { id: "heil_trank_klein", price: 10 },
      ],
    },
  },

  //================================================ Erfolge
  achievements: {

  }
};
