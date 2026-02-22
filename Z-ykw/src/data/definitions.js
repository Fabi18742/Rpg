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
      requiredAchievement: null,
      events: ['story_forest_01_entrance'],
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
    //---------------------------------------------- Forest Story Events
    story_forest_01_entrance: {
      id: 'story_forest_01_entrance',
      name: 'Der unnatürliche Wald',
      text: 'Der Wald begrüßt dich nicht mit Vogelgesang, sondern mit einer bedrückenden Stille. Die Bäume wachsen hier nicht wild. Jemand hat das Unterholz mit brutaler Gewalt gezwungen, sich einem unsichtbaren Raster zu beugen. Vor dir gabelt sich der modrige Pfad. Zu deiner Linken ist der Boden mit perfekten, hauchdünnen Holzspänen bedeckt. Zu deiner Rechten spannt sich eine straffe Schnur aus getrockneten Därmen genau auf Kniehöhe in das Dickicht.',
      type: 'choice',
      choices: [
        {
          text: "Folge den Holzspänen.",
          effect: "none",
          nextEvent: "story_forest_02_shavings",
        },
        {
          text: "Folge der Darmschnur.",
          effect: "none",
          nextEvent: "story_forest_03_gutstring",
        },
      ],
    },

    story_forest_02_shavings: {
      id: 'story_forest_02_shavings',
      name: 'Der verworfene Rest',
      text: 'Deine Stiefel zerdrücken die makellosen Späne mit einem Geräusch, das in der Stille wie Knochenbrechen klingt. Im Gestrüpp findest du einen ledernen Stiefel. Er ist nicht leer – ein sauber abgetrennter Fuß steckt noch darin. Ein kleines Pergament ist mit einem massiven, goldenen Nagel an die Ferse geheftet: "Asymmetrie des Knöchels. Unverwertbares Gefälle. Aussortiert."',
      type: 'choice',
      choices: [
        {
          text: "Den goldenen Nagel herausziehen und einstecken.",
          effect: "none",
          nextEvent: "story_forest_04_boot",
        },
        {
          text: "Den Stiefel ignorieren und tiefer in den Wald gehen.",
          effect: "none",
          nextEvent: "story_forest_05_tree",
        },
      ],
    },

    story_forest_03_gutstring: {
      id: 'story_forest_03_gutstring',
      name: 'Die Vermessung der Leere',
      text: 'Du folgst der straffen Darmschnur. Sie weicht keinem Hindernis aus; wo ein massiver Fels im Weg lag, wurde eine exakte, quadratische Schneise hineingeschlagen. Am Ende der Schnur hängt ein toter Plünderer, mit einem Eisennagel an einen Baumstamm fixiert. Ihm wurde der Unterkiefer entfernt. Auf seiner Stirn steht in feiner Schrift: "Kieferstellung mangelhaft. Platzverschwendung."',
      type: 'choice',
      choices: [
        {
          text: "Die Taschen des Toten durchsuchen.",
          effect: "none",
          nextEvent: "story_forest_06_thief",
        },
        {
          text: "Einen weiten Bogen um die Leiche machen.",
          effect: "none",
          nextEvent: "story_forest_05_tree",
        },
      ],
    },

    story_forest_04_boot: {
      id: 'story_forest_04_boot',
      name: 'Das blutende Gold',
      text: 'Als du den Nagel herausziehst, tropft keine Fäulnis aus der Wunde, sondern ein nach Pinien duftender Holzleim. Das Gold in deiner Tasche ist schwer und beruhigend – in dieser Welt nimmt man, was man kriegen kann. Plötzlich durchbricht ein rhythmisches, schabendes Geräusch die Stille. Jemand arbeitet ganz in der Nähe.',
      type: 'choice',
      choices: [
        {
          text: "Mit gezogener Waffe auf das Geräusch zustürmen.",
          effect: "none",
          nextEvent: "story_forest_07_end_greedy",
        },
        {
          text: "Geduckt und leise näher schleichen.",
          effect: "none",
          nextEvent: "story_forest_08_end_cautious",
        },
      ],
    },

    story_forest_05_tree: {
      id: 'story_forest_05_tree',
      name: 'Die absolute Symmetrie',
      text: 'Der Wald verändert sich. Die Rinde der Bäume hier wurde nicht einfach abgeschält, sie wurde so lange gehobelt, bis die Stämme perfekte, quadratische Säulen bildeten. Der Geruch von frischem Sägemehl und altem Blut ist hier so dicht, dass er fast auf der Zunge brennt. Ein monotones Klopfen hallt durch die quadratischen Baumreihen.',
      type: 'choice',
      choices: [
        {
          text: "Vorsichtig von Deckung zu Deckung huschen.",
          effect: "none",
          nextEvent: "story_forest_08_end_cautious",
        },
        {
          text: "Achtlos über die polierten Wurzeln stampfen.",
          effect: "none",
          nextEvent: "story_forest_09_end_vandal",
        },
      ],
    },

    story_forest_06_thief: {
      id: 'story_forest_06_thief',
      name: 'Der Lohn der Gier',
      text: 'In den Taschen des Toten findest du ein filigranes Maßband aus polierten Fingerknochen. Ein meisterhaftes, wenn auch makabres Werkzeug. Du steckst es ein. Doch als du weitergehst, spürst du eine subtile Veränderung in der Luft. Die Schatten scheinen sich exakt nach geometrischen Mustern auszurichten. Am Ende des Pfades siehst du den flackernden Schein einer Laterne.',
      type: 'choice',
      choices: [
        {
          text: "Lautlos näher treten, um das Maßband zu verbergen.",
          effect: "none",
          nextEvent: "story_forest_10_end_flawed",
        },
        {
          text: "Selbstsicher ins Licht treten.",
          effect: "none",
          nextEvent: "story_forest_09_end_vandal",
        },
      ],
    },

    story_forest_07_end_greedy: {
      id: 'story_forest_07_end_greedy',
      name: 'Das Ende: Der Gierige',
      text: 'Du stürmst auf eine perfekt kreisrunde Lichtung. In der Mitte steht eine pechschwarze Werkbank. Der Mann dahinter trägt eine pergamentene Maske. Er legt seinen Hobel beiseite und betrachtet dich mit klinischer Kälte. "Das Gewicht in eurer Tasche," flüstert er verächtlich, "es ruiniert eure gesamte Haltung. Eine solche Asymmetrie der Schultern... ich werde euch aufbrechen müssen, um das auszugleichen." Er greift nach seinem Maßhammer.',
      type: 'choice',
      choices: [
        {
          text: "Kampf beginnen",
          effect: "none",
          nextEvent: "combat_boss_revisionist",
        },
      ],
    },

    story_forest_08_end_cautious: {
      id: 'story_forest_08_end_cautious',
      name: 'Das Ende: Der Geduckte',
      text: 'Du schleichst auf eine perfekt kreisrunde Lichtung und hältst dich in den Schatten. Doch der Mann an der schwarzen Werkbank blickt sofort in deine Richtung, als hättest du das Raster seiner Welt gestört. Hinter seiner pergamentenen Maske entweicht ein enttäuschter Seufzer. "Warum krümmt ihr die Wirbelsäule so erbärmlich? Angst ist keine Entschuldigung für schlechte Proportionen. Kommt her. Ich werde euch begradigen." Er greift nach seinem Maßhammer.',
      type: 'choice',
      choices: [
        {
          text: "Kampf beginnen",
          effect: "none",
          nextEvent: "combat_boss_revisionist",
        },
      ],
    },

    story_forest_09_end_vandal: {
      id: 'story_forest_09_end_vandal',
      name: 'Das Ende: Der Respektlose',
      text: 'Du betrittst eine kreisrunde, makellos saubere Lichtung. Der Mann an der schwarzen Werkbank hält in seiner Arbeit inne. Er dreht den Kopf, und obwohl seine Maske keine Augen hat, spürst du seinen bohrenden Blick. "Ihr tretet auf mein poliertes Holz wie ein wildes Tier. Ihr tragt den Schmutz des Chaos an euren Sohlen." Er nimmt einen massiven Hammer von der Bank. "Eure Ignoranz ist ein Konstruktionsfehler. Ich werde ihn beheben."',
      type: 'choice',
      choices: [
        {
          text: "Kampf beginnen",
          effect: "none",
          nextEvent: "combat_boss_revisionist",
        },
      ],
    },

    story_forest_10_end_flawed: {
      id: 'story_forest_10_end_flawed',
      name: 'Das Ende: Der Fehlerhafte',
      text: 'Als du die perfekt kreisrunde Lichtung betrittst, riecht die Luft nach Blut und Pinien. Der Mann hinter der dunklen Werkbank dreht sich langsam zu dir um. Er lauscht. "Euer Herzschlag," flüstert er durch seine Maske, "er ist völlig aus dem Takt. Ein arrhythmischer Störfaktor in meiner Stille. Es widert mich an." Er hebt einen langen Sargnagel und einen schweren Hammer. "Lasst mich dieses störende Pochen für euch beenden."',
      type: 'choice',
      choices: [
        {
          text: "Kampf beginnen",
          effect: "none",
          nextEvent: "combat_boss_revisionist",
        },
      ],
    },

    //---------------------------------------------- Tests
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
