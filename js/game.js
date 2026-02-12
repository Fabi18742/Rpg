// Game State & Logic

const Game = {
  // Referenzen zu zentralen Definitionen
  items: Definitions.items,
  weaponBases: Definitions.weaponBases,
  effects: Definitions.effects,
  abilities: Definitions.abilities,
  enemies: Definitions.enemies,
  bosses: Definitions.bosses,
  bossWorlds: Definitions.bossWorlds,
  crawlEvents: Definitions.crawlEvents,
  merchants: Definitions.merchants,

  state: {
    currentScreen: "hideout",
    player: {
      level: Definitions.player.level,
      hp: Definitions.player.hp,
      maxHp: Definitions.player.maxHp,
      gold: Definitions.player.gold,
      actionPoints: Definitions.player.actionPoints,
      maxActionPoints: Definitions.player.maxActionPoints,
      // RPG Stats aus Definitions
      stats: {
        strength: Definitions.player.stats.strength,
        defense: Definitions.player.stats.defense,
        glitzer: Definitions.player.stats.glitzer,
      },
      // Alle verfügbaren Waffen
      weapons: [],
      // Ausgerüstete Waffe (Array-Index oder null)
      equippedWeapon: null,
      // Alle verfügbaren Fähigkeiten (Array von Ability-IDs)
      abilities: [],
      // 4 ausgerüstete Fähigkeiten (Array-Indizes in abilities oder null)
      equippedAbilities: [0, null, null, null],
      inventory: [],
    },
    defeatedBosses: [],
    // Kampf-Zustand
    currentBattle: null,
    // Crawl-Zustand (Boss-Welt-Erkundung)
    currentCrawl: null,
  },

  // Initialisierung
  init() {
    console.log("Game wird initialisiert... 0.2.12");

    // Spielstand laden falls vorhanden
    const savedState = Storage.loadGameState();
    if (savedState) {
      this.state = savedState;
      console.log("Spielstand geladen");
    } else {
      console.log("Neues Spiel gestartet");
      // Start-Waffe aus Definitions hinzufügen
      const startWeaponBaseId = Definitions.player.startWeapon;
      if (startWeaponBaseId) {
        this.addWeapon({ baseId: startWeaponBaseId, effects: [] });
        // Automatisch ausrüsten
        this.equipWeapon(0);
      }

      // Start-Abilities aus Definitions hinzufügen
      const startAbilities = Definitions.player.startAbilities;
      if (startAbilities && startAbilities.length > 0) {
        startAbilities.forEach((abilityId) => {
          if (
            this.abilities[abilityId] &&
            !this.state.player.abilities.includes(abilityId)
          ) {
            this.state.player.abilities.push(abilityId);
            console.log(
              `Start-Ability hinzugefügt: ${this.abilities[abilityId].name}`,
            );
          }
        });
      }
    }

    // UI initialisieren
    UI.init();

    if (this.state.currentBattle) {
      console.log(
        "Aktiver Kampf beim Neuladen erkannt -> WIRD ALS TOD GEWERTET.",
      );

      // Aufräumen: Kampf und Crawl beenden
      this.state.currentBattle = null;
      this.state.currentCrawl = null; // Ein Tod beendet auch den aktuellen Run/Crawl

      const currentGlitzer = this.state.player.stats.glitzer;
      const glitzerLoss = Math.ceil(currentGlitzer / 5);

      if (glitzerLoss > 0) {
        this.state.player.stats.glitzer -= glitzerLoss;
        console.log(`Strafe: ${glitzerLoss} Glitzer durch Flucht verloren.`);
      }

      // Speichern und zum Hideout
      this.save();
      this.showScreen("hideout");

      // Optional: Alert oder Log für Spieler (kann entfernt werden)
      console.log(
        'Du bist durch das Neuladen im Kampf "gestorben" und im Hideout aufgewacht.',
      );
    }
    // 2. Priorität: Aktives Multiple-Choice Event (innerhalb eines Crawls)
    else if (this.state.currentEvent) {
      console.log("Laufendes Event wiederherstellen...");
      UI.showMultipleChoiceEvent();
    }
    // 3. Priorität: Laufender Crawl (Event-Auswahl)
    else if (this.state.currentCrawl) {
      console.log("Laufenden Crawl wiederherstellen...");
      UI.showCrawlEventSelection();
    }
    // 4. Priorität: Statische Screens (Shop, Boss-Auswahl, Hideout)
    else {
      switch (this.state.currentScreen) {
        case "shop":
          UI.showShop();
          break;
        case "boss":
          UI.showBossSelection();
          break;
        // Falls man in einem Untermenü war (z.B. Inventar),
        // ist es meist sicherer, zum Hideout zurückzukehren,
        // da diese oft als Overlays implementiert sind.
        default:
          this.showScreen("hideout");
      }
    }
  },

  // Screen wechseln
  showScreen(screenName) {
    this.state.currentScreen = screenName;
    console.log("Wechsel zu Screen:", screenName);

    switch (screenName) {
      case "hideout":
        UI.showHideout();
        break;
      case "shop":
        UI.showShop();
        break;
      case "boss":
        UI.showBossSelection();
        break;
      default:
        console.error("Unbekannter Screen:", screenName);
    }

    // Spielstand speichern
    this.save();
  },

  // Spielstand speichern
  save() {
    Storage.saveGameState(this.state);
  },

  // Waffeninstanz hinzufügen
  // weaponInstance = { baseId: 'sword', effects: ['testdamage'] }
  addWeapon(weaponInstance) {
    if (!weaponInstance.baseId) {
      console.error("Waffe muss baseId haben");
      return false;
    }

    const weaponBase = this.weaponBases[weaponInstance.baseId];
    if (!weaponBase) {
      console.error("Waffenbasis nicht gefunden:", weaponInstance.baseId);
      return false;
    }

    // Waffeninstanz mit baseId und effects Array
    const instance = {
      baseId: weaponInstance.baseId,
      effects: weaponInstance.effects || [],
    };

    this.state.player.weapons.push(instance);
    this.save();
    console.log(
      `[WAFFE] ${weaponBase.name} erhalten (${instance.effects.length} Effekte)`,
    );
    return true;
  },

  // Waffeninstanz zu vollständiger Waffe auflösen
  resolveWeapon(weaponInstance) {
    if (!weaponInstance) return null;

    const base = this.weaponBases[weaponInstance.baseId];
    if (!base) return null;

    // Glitzer-Wert berechnen (Basis * Multiplikatoren aller Effekte)
    let glitzerValue = base.baseGlitzerValue;
    weaponInstance.effects.forEach((effectId) => {
      const effect = this.effects[effectId];
      if (effect && effect.glitzerValueMultiplier) {
        glitzerValue = Math.floor(glitzerValue * effect.glitzerValueMultiplier);
      }
    });

    return {
      ...base,
      effects: weaponInstance.effects,
      glitzerValue: glitzerValue,
    };
  },

  // Effekte auf Schaden anwenden
  // Gibt { damage, logs } zurück
  applyEffects(baseDamage, effectIds, attacker, target, battle) {
    let damage = baseDamage;
    let logs = [];

    if (!effectIds || effectIds.length === 0) {
      return { damage, logs };
    }

    effectIds.forEach((effectId) => {
      const effect = this.effects[effectId];
      if (!effect) return;

      // Verschiedene Effekt-Typen
      switch (effect.type) {
        case "damage":
          damage += effect.value;
          logs.push(`+${effect.value} (${effect.name})`);
          break;
        case "poison":
          // Poison hat eine Chance, Stacks aufzutragen
          if (Math.random() < effect.applyChance) {
            this.applyPoisonEffect(target, effect);
            logs.push(`🧪 Gift aufgetragen!`);
          }
          break;
        // Weitere Effekt-Typen können hier hinzugefügt werden
        // case 'heal': ...
        // case 'defense': ...
      }
    });

    return { damage, logs };
  },

  // Gift-Effekt auftragen
  applyPoisonEffect(target, effect) {
    if (!target.statusEffects) {
      target.statusEffects = [];
    }

    // Prüfe ob bereits ein Gift-Effekt vorhanden ist
    let existingPoison = target.statusEffects.find(
      (se) => se.type === "poison",
    );

    if (existingPoison) {
      // Addiere neue Stacks
      existingPoison.stacks += effect.stacksToApply;
    } else {
      // Erstelle neuen Gift-Effekt
      target.statusEffects.push({
        type: "poison",
        stacks: effect.stacksToApply,
        baseDamage: effect.value,
        ignoreArmor: effect.ignoreArmor,
      });
    }
  },

  // Waffe ausrüsten - verwendet Array-Index
  equipWeapon(weaponIndex) {
    if (weaponIndex < 0 || weaponIndex >= this.state.player.weapons.length)
      return false;

    this.state.player.equippedWeapon = weaponIndex;
    this.save();
    return true;
  },

  // Waffe entfernen
  unequipWeapon() {
    this.state.player.equippedWeapon = null;
    this.save();
    return true;
  },

  // Ausgerüstete Waffe holen (aufgelöst)
  getEquippedWeapon() {
    const index = this.state.player.equippedWeapon;
    if (typeof index === "number") {
      const instance = this.state.player.weapons[index];
      return this.resolveWeapon(instance);
    }
    return null;
  },

  // Fähigkeit ausrüsten (slot 0-3) - verwendet Array-Index aus abilities
  equipAbility(abilityIndex, slot) {
    if (slot < 0 || slot > 3) return false;
    if (abilityIndex < 0 || abilityIndex >= this.state.player.abilities.length)
      return false;

    // Prüfe ob diese Fähigkeit bereits ausgewählt ist
    if (this.state.player.equippedAbilities.includes(abilityIndex)) {
      return false;
    }

    const abilityId = this.state.player.abilities[abilityIndex];
    const ability = this.abilities[abilityId];
    if (ability) {
      this.state.player.equippedAbilities[slot] = abilityIndex;
      this.save();
      return true;
    }
    return false;
  },

  // Fähigkeit aus Slot entfernen
  unequipAbility(slot) {
    if (slot >= 0 && slot <= 3) {
      this.state.player.equippedAbilities[slot] = null;
      this.save();
      return true;
    }
    return false;
  },

  // Ausgewählte Fähigkeiten für Kampf holen (aufgelöst)
  getEquippedAbilities() {
    return this.state.player.equippedAbilities
      .map((index) => {
        if (typeof index === "number") {
          const abilityId = this.state.player.abilities[index];
          return this.abilities[abilityId];
        }
        return null;
      })
      .filter((a) => a !== null);
  },

  // Kampf starten
  startBattle(boss) {
    // Alle Statuseffekte (wie Gift) beim Spieler zu Kampfbeginn entfernen
    this.state.player.statusEffects = [];

    this.state.currentBattle = {
      boss: JSON.parse(JSON.stringify(boss)), // Deep copy
      turn: "player",
      playerActionPoints: this.state.player.maxActionPoints,
      bossActionPoints: boss.actionPoints,
      blockBonus: 0, // Temporärer Block-Bonus für die nächste Runde
      log: [`Kampf gegen ${boss.name} beginnt!`],
    };
    this.save();
    UI.showBattleScreen();
  },

  // Spieler-Angriff
  // Spieler nutzt Fähigkeit
  playerAttack(abilityIndex) {
    if (!this.state.currentBattle || this.state.currentBattle.turn !== "player")
      return;

    // Hole Fähigkeit
    const abilityId = this.state.player.abilities[abilityIndex];
    const ability = this.abilities[abilityId];
    if (!ability) return;

    // Hole ausgerüstete Waffe
    const weaponIndex = this.state.player.equippedWeapon;
    if (weaponIndex === null || weaponIndex === undefined) return;

    const weaponInstance = this.state.player.weapons[weaponIndex];
    const weapon = this.resolveWeapon(weaponInstance);
    if (!weapon) return;

    const battle = this.state.currentBattle;

    // Bei Gegner-Kämpfen: Stelle sicher, dass battle.boss auf das ausgewählte Ziel zeigt
    const isEnemyBattle = battle.enemies && battle.enemies.length > 0;
    if (isEnemyBattle) {
      battle.boss = battle.enemies[battle.selectedTarget || 0];
    }

    // Prüfe ob genug Aktionspunkte vorhanden sind
    if (battle.playerActionPoints < ability.apCost) {
      console.log("Nicht genug Aktionspunkte!");
      return;
    }

    // Aktionspunkte abziehen
    battle.playerActionPoints -= ability.apCost;

    const boss = battle.boss;

    console.log("Boss HP vor Angriff:", boss.hp);

    // Mehrere Angriffe ausführen
    let totalDamage = 0;
    let attackLogs = [];

    for (let i = 0; i < ability.attacks; i++) {
      // Trefferchance prüfen
      const hitChance = ability.hitChance || 1.0;
      const hitRoll = Math.random();

      if (hitRoll > hitChance) {
        // Verfehlt! -> Mit CSS Klasse für Rot
        attackLogs.push(`<span class="log-miss">Verfehlt!</span>`);
        continue;
      }

      // Schaden berechnen: (Waffenschaden × Multiplikator) + Stats
      let baseDamage = weapon.damage * ability.damageMultiplier;

      // Damage-Teile für Log sammeln
      let damageLog = [`${Math.floor(baseDamage)} Basis`];

      // Effekte anwenden (vor Stats!)
      if (weapon.effects && weapon.effects.length > 0) {
        const effectResult = this.applyEffects(
          baseDamage,
          weapon.effects,
          this.state.player,
          boss,
          battle,
        );
        baseDamage = effectResult.damage;
        if (effectResult.logs.length > 0) {
          damageLog.push(...effectResult.logs);
        }
      }

      let damage = baseDamage;

      // Nur physische Fähigkeiten bekommen Strength-Bonus
      if (ability.damageType === "physical") {
        const playerStrength = this.state.player.stats.strength;
        if (playerStrength > 0) {
          damage += playerStrength;
          damageLog.push(`${playerStrength} Str`);
        }
      }

      // Verteidigung abziehen
      const bossDefense = boss.stats.defense;
      if (bossDefense > 0) {
        damage -= bossDefense;
        damageLog.push(`-${bossDefense} Vert.`);
      }

      if (damage < 0) damage = 0;
      damage = Math.floor(damage);
      totalDamage += damage;
      boss.hp -= damage;

      // Formatierung für einzelnen Treffer
      attackLogs.push(
        `<span class="log-damage-val">${damage}</span> <span class="log-details">(${damageLog.join(" + ")})</span>`,
      );
    }

    // === NEUES LOG FORMAT ===
    let logEntry = `<span class="log-source player">${ability.name}</span>`;

    if (ability.attacks > 1) {
      // Mehrfachangriff: Zeige Gesamtschaden und Liste
      logEntry += ` <span class="log-summary">(${totalDamage} Gesamt)</span>`;
      // Jeden Treffer in eine neue Zeile
      logEntry += attackLogs
        .map((log) => `<br><div class="log-hit-item">${log}</div>`)
        .join("");
    } else {
      // Einzelangriff
      logEntry += `: ${attackLogs[0]}`;
    }

    battle.log.push(logEntry);
    // ========================

    // Boss/Gegner besiegt?
    if (boss.hp <= 0) {
      boss.hp = 0;

      // Prüfe ob es ein Gegner-Kampf ist
      const isEnemyBattle = battle.enemies && battle.enemies.length > 0;

      if (isEnemyBattle) {
        // Gegner besiegt - markiere als besiegt
        boss.defeated = true;
        battle.log.push(
          `<strong style="color: #888;">✝ ${boss.name} wurde besiegt!</strong>`,
        );

        // Zähle lebende Gegner
        const aliveEnemies = battle.enemies.filter((e) => !e.defeated);

        // Prüfe ob noch lebende Gegner übrig sind
        if (aliveEnemies.length === 0) {
          // Alle Gegner besiegt
          battle.log.push("<strong>Alle Gegner wurden besiegt!</strong>");
          this.endBattle(true);
          return;
        } else {
          // Noch Gegner übrig
          battle.log.push(`Noch ${aliveEnemies.length} Gegner übrig!`);

          // Falls aktuelles Target besiegt wurde, wähle nächsten lebenden Gegner
          if (battle.enemies[battle.selectedTarget].defeated) {
            // Finde nächsten lebenden Gegner
            for (let i = 0; i < battle.enemies.length; i++) {
              if (!battle.enemies[i].defeated) {
                battle.selectedTarget = i;
                battle.boss = battle.enemies[i];
                break;
              }
            }
          }

          // Prüfe ob Spieler noch AP hat
          if (battle.playerActionPoints > 0) {
            // Spieler kann weiter angreifen
            this.save();
            UI.updateBattleScreen();
            return;
          } else {
            // Keine AP mehr, Gegner-Zug
            battle.turn = "enemy";
            this.save();
            UI.updateBattleScreen();
            setTimeout(() => this.enemyAttack(), 1500);
            return;
          }
        }
      } else {
        // Boss besiegt
        battle.log.push(`<strong>${boss.name} wurde besiegt!</strong>`);
        this.endBattle(true);
        return;
      }
    }

    // Prüfe ob Spieler noch Aktionspunkte hat
    if (battle.playerActionPoints > 0) {
      this.save();
      UI.updateBattleScreen();
    } else {
      battle.turn = "enemy";
      if (battle.enemies && battle.enemies.length > 0) {
        battle.enemiesAttackedThisRound = 0;
      }
      this.save();
      UI.updateBattleScreen();
      setTimeout(() => this.enemyAttack(), 1500);
    }
  },

  // Spieler blockt
  playerBlock() {
    if (!this.state.currentBattle || this.state.currentBattle.turn !== "player")
      return;

    const battle = this.state.currentBattle;

    // Prüfe ob genug Aktionspunkte vorhanden sind
    if (battle.playerActionPoints < 1) return;

    // Block-Wert berechnen: Nur AP-Bonus (Defense wird bereits normal vom Schaden abgezogen!)
    const availableAP = battle.playerActionPoints; // AP BEVOR wir abziehen
    const blockBonus = availableAP * 2; // Alle verfügbaren AP geben +2 Block pro AP

    battle.blockBonus = blockBonus;
    battle.log.push(`Block! (+${blockBonus} Verteidigung)`);

    // NACH der Berechnung: Alle AP verbrauchen (Zug ist beendet)
    battle.playerActionPoints = 0;
    battle.turn = "enemy";
    this.save();
    UI.updateBattleScreen();

    // Verzögerung für Gegner-Angriff
    setTimeout(() => this.enemyAttack(), 1500);
  },

  // Gegner-Angriff
  enemyAttack() {
    if (!this.state.currentBattle) return;

    const battle = this.state.currentBattle;

    // Turn-Prüfung: Nur angreifen wenn enemy dran ist
    if (battle.turn !== "enemy") {
      return;
    }

    // Bestimme ob es ein Gegner-Kampf oder Boss-Kampf ist
    const isEnemyBattle = battle.enemies && battle.enemies.length > 0;

    // Bei Gegner-Kämpfen: Stelle sicher dass currentEnemyIndex initialisiert ist
    if (
      isEnemyBattle &&
      (battle.currentEnemyIndex === undefined ||
        battle.currentEnemyIndex === null)
    ) {
      battle.currentEnemyIndex = 0;
    }

    // Bei Gegner-Kämpfen: Suche zirkulär nach lebendem Gegner
    if (isEnemyBattle) {
      if (battle.enemiesAttackedThisRound === undefined) {
        battle.enemiesAttackedThisRound = 0;
      }

      let attempts = 0;
      const totalEnemies = battle.enemies.length;

      // Zirkuläre Suche mit Wrap-Around
      while (attempts < totalEnemies) {
        if (battle.currentEnemyIndex >= totalEnemies) {
          battle.currentEnemyIndex = 0;
        }
        if (!battle.enemies[battle.currentEnemyIndex].defeated) {
          break; // Gefunden
        }
        battle.currentEnemyIndex++;
        attempts++;
      }

      if (attempts >= totalEnemies) {
        this.endBattle(true);
        return;
      }
      battle.boss = battle.enemies[battle.currentEnemyIndex];
    }

    // Boss/Gegner holen
    const boss = battle.boss;

    // Boss-Waffe auflösen
    const bossWeaponInstance = boss.weapon;
    const bossWeapon = this.resolveWeapon(bossWeaponInstance);
    const attackDamage = bossWeapon ? bossWeapon.damage : 0;
    const attackName = bossWeapon ? bossWeapon.name : "Angriff";

    // --- TEIL 1: GIFTSCHADEN DES GEGNERS ---
    if (boss.statusEffects && boss.statusEffects.length > 0) {
      const poisonEffect = boss.statusEffects.find(
        (se) => se.type === "poison",
      );
      if (poisonEffect && poisonEffect.stacks > 0) {
        const poisonDamage = poisonEffect.baseDamage + poisonEffect.stacks;
        boss.hp -= poisonDamage;
        if (boss.hp < 0) boss.hp = 0;

        battle.log.push(
          `<span style="color: #a855f7;">🧪 ${boss.name} erleidet ${poisonDamage} Gift-Schaden (${poisonEffect.stacks} Stacks)</span>`,
        );

        poisonEffect.stacks -= 1;
        if (poisonEffect.stacks <= 0) {
          const index = boss.statusEffects.indexOf(poisonEffect);
          boss.statusEffects.splice(index, 1);
        }

        this.save();
        UI.updateBattleScreen();

        if (boss.hp <= 0) {
          boss.defeated = true;
          battle.log.push(`${boss.name} wurde durch Gift besiegt!`);
          if (isEnemyBattle) {
            const allDefeated = battle.enemies.every((e) => e.defeated);
            if (allDefeated) {
              this.endBattle(true);
              return;
            }
            // Zum nächsten Gegner wechseln, da dieser hier gerade gestorben ist
            battle.currentEnemyIndex++;
            this.save();
            UI.updateBattleScreen();
            setTimeout(() => this.enemyAttack(), 1500);
            return;
          } else {
            this.endBattle(true);
            return;
          }
        }
      }
    }

    // --- TEIL 2: ANGRIFF AUF DEN SPIELER ---
    const bossBaseDamage = attackDamage;
    const bossStrength = boss.stats.strength;
    const playerDefense = this.state.player.stats.defense;
    const blockBonus = battle.blockBonus || 0;
    let damage = bossBaseDamage + bossStrength - playerDefense - blockBonus;

    let damageLog = [`${bossBaseDamage} Basis`];
    if (bossStrength > 0) damageLog.push(`${bossStrength} Str`);
    if (playerDefense > 0) damageLog.push(`-${playerDefense} Vert.`);
    if (blockBonus > 0) damageLog.push(`-${blockBonus} Block`);

    // Effekte anwenden
    if (bossWeapon && bossWeapon.effects && bossWeapon.effects.length > 0) {
      const effectResult = this.applyEffects(
        damage,
        bossWeapon.effects,
        boss,
        this.state.player,
        battle,
      );
      damage = effectResult.damage;
      damageLog.push(...effectResult.logs);
    }

    if (damage < 0) damage = 0;
    this.state.player.hp -= damage;
    if (this.state.player.hp < 0) this.state.player.hp = 0;

    battle.log.push(
      `<span class="log-source enemy">${boss.name}</span>: ${attackName} <br><div class="log-hit-item"><span class="log-damage-val" style="color: #ff6b6b;">-${damage} HP</span> <span class="log-details">(${damageLog.join(" + ")})</span></div>`,
    );

    if (battle.blockBonus > 0) {
      battle.blockBonus = 0;
    }

    if (this.state.player.hp <= 0) {
      battle.log.push(
        '<strong style="color: #ff4444;">Du wurdest besiegt!</strong>',
      );
      this.endBattle(false);
      return;
    }

    // --- TEIL 3: RUNDENLOGIK ---
    let playerTurnNext = false;

    if (isEnemyBattle) {
      battle.enemiesAttackedThisRound++;
      const livingEnemies = battle.enemies.filter((e) => !e.defeated).length;

      if (battle.enemiesAttackedThisRound >= livingEnemies) {
        playerTurnNext = true; // Runde vorbei
      } else {
        // Nächster Gegner im Timeout
        battle.currentEnemyIndex++;
        let attempts = 0;
        const totalEnemies = battle.enemies.length;
        let foundNext = false;

        while (attempts < totalEnemies) {
          if (battle.currentEnemyIndex >= totalEnemies)
            battle.currentEnemyIndex = 0;
          if (!battle.enemies[battle.currentEnemyIndex].defeated) {
            foundNext = true;
            break;
          }
          battle.currentEnemyIndex++;
          attempts++;
        }

        if (foundNext) {
          battle.boss = battle.enemies[battle.currentEnemyIndex];
          this.save();
          UI.updateBattleScreen();
          setTimeout(() => this.enemyAttack(), 1500);
          return;
        } else {
          playerTurnNext = true;
        }
      }
    } else {
      playerTurnNext = true; // Einzelboss immer Spieler-Zug danach
    }

    // --- TEIL 4: GIFTSCHADEN DES SPIELERS (BEVOR ER DRAN IST) ---
    if (playerTurnNext) {
      if (
        this.state.player.statusEffects &&
        this.state.player.statusEffects.length > 0
      ) {
        const playerPoison = this.state.player.statusEffects.find(
          (se) => se.type === "poison",
        );

        if (playerPoison && playerPoison.stacks > 0) {
          const pDamage = playerPoison.baseDamage + playerPoison.stacks;
          this.state.player.hp -= pDamage;
          if (this.state.player.hp < 0) this.state.player.hp = 0;

          battle.log.push(
            `<span style="color: #a855f7;">🧪 Du erleidest ${pDamage} Gift-Schaden (${playerPoison.stacks} Stacks)</span>`,
          );

          playerPoison.stacks--;
          if (playerPoison.stacks <= 0) {
            this.state.player.statusEffects =
              this.state.player.statusEffects.filter(
                (se) => se !== playerPoison,
              );
          }

          if (this.state.player.hp <= 0) {
            battle.log.push(
              '<strong style="color: #ff4444;">Du bist am Gift gestorben!</strong>',
            );
            this.endBattle(false);
            return;
          }
        }
      }

      // --- FINALE ÜBERGABE AN DEN SPIELER ---
      battle.turn = "player";
      if (isEnemyBattle) {
        battle.currentEnemyIndex = 0;
        battle.enemiesAttackedThisRound = 0;

        // Target Reset: Prüfen ob das alte Ziel noch lebt, sonst neues suchen
        if (
          !battle.enemies[battle.selectedTarget] ||
          battle.enemies[battle.selectedTarget].defeated
        ) {
          for (let i = 0; i < battle.enemies.length; i++) {
            if (!battle.enemies[i].defeated) {
              battle.selectedTarget = i;
              battle.boss = battle.enemies[i];
              break;
            }
          }
        } else {
          battle.boss = battle.enemies[battle.selectedTarget];
        }
      }

      battle.playerActionPoints = this.state.player.maxActionPoints;
      this.save();
      UI.updateBattleScreen();
    }
  },

  // Kampf beenden
  endBattle(victory) {
    const battle = this.state.currentBattle;
    const isEnemyBattle = battle && battle.enemies && battle.enemies.length > 0;
    const isBossBattle = !isEnemyBattle;

    let resultMessages = [];

    if (victory) {
      let enemiesToLoot = isEnemyBattle ? battle.enemies : [battle.boss];

      if (isBossBattle) {
        const bossId = battle.boss.id;
        if (!this.state.defeatedBosses.includes(bossId)) {
          this.state.defeatedBosses.push(bossId);
        }
      }

      enemiesToLoot.forEach((enemy) => {
        if (enemy.drops && enemy.drops.length > 0) {
          enemy.drops.forEach((drop) => {
            let dropId = typeof drop === "string" ? drop : drop.id;
            let dropType = typeof drop === "string" ? "item" : drop.type;

            if (dropId === "glitzer") {
              const amount =
                typeof drop === "object" && drop.amount ? drop.amount : 1;
              this.state.player.stats.glitzer += amount;
              resultMessages.push(
                `<span style="color: #fbbf24;">Erhalten: +${amount} Glitzer</span>`,
              );
              return;
            }

            if (dropType === "item") {
              const item = this.items[dropId];
              if (item) {
                this.addItemToInventory(item);
                resultMessages.push(
                  `Item: <strong style="color: var(--accent-color);">${item.name}</strong>`,
                );
              }
            } else if (dropType === "weapon") {
              const weaponBase = this.weaponBases[dropId];
              if (weaponBase) {
                this.state.player.weapons.push({ baseId: dropId, effects: [] });
                resultMessages.push(
                  `Waffe: <strong style="color: var(--accent-color);">${weaponBase.name}</strong>`,
                );
              }
            } else if (dropType === "ability") {
              const ability = this.abilities[dropId];
              if (ability) {
                if (!this.state.player.abilities.includes(dropId)) {
                  this.state.player.abilities.push(dropId);
                  resultMessages.push(
                    `Fähigkeit: <strong style="color: var(--accent-color);">${ability.name}</strong>`,
                  );
                } else {
                  this.state.player.stats.glitzer += 10;
                  resultMessages.push(
                    `<span style="color: #888;">(Fähigkeit bekannt: +10 Glitzer)</span>`,
                  );
                }
              }
            }
          });
        }
      });

      if (resultMessages.length > 0) {
        resultMessages.unshift("Du hast folgende Beute erhalten:");
      } else {
        resultMessages.push(
          `<span style="color: var(--placeholder-color);">Keine Beute gefunden.</span>`,
        );
      }
    } else {
      // --- LOGIK FÜR TOD / NIEDERLAGE ---
      const currentGlitzer = this.state.player.stats.glitzer;
      const glitzerLoss = Math.ceil(currentGlitzer / 5); // 20% Verlust

      resultMessages.push("Die Dunkelheit umfängt dich...");

      if (glitzerLoss > 0) {
        this.state.player.stats.glitzer -= glitzerLoss;
        resultMessages.push(
          `<span style="color: #ff4444; font-weight: bold; font-size: 1.1em;">Verlust: -${glitzerLoss} Glitzer</span>`,
        );
      } else {
        resultMessages.push(
          "Du hattest keinen Glitzer bei dir, den man dir rauben konnte.",
        );
      }

      // HP auf 0 für den visuellen Effekt im Kampf-Log
      this.state.player.hp = 0;
      battle.log.push("Du wurdest besiegt! Zurück ins Hideout...");
    }

    this.save();
    UI.updateBattleScreen(); // UI aktualisieren, um die 0 HP anzuzeigen

    setTimeout(() => {
      UI.removeBattleWindows();

      if (victory) {
        UI.showResultScreen("Kampf gewonnen!", resultMessages, () => {
          this.state.currentBattle = null;
          this.save();
          if (isBossBattle) {
            if (this.state.currentCrawl) this.state.currentCrawl = null;
            this.showScreen("hideout");
          } else {
            this.checkBossSpawn();
          }
        });
      } else {
        // --- TODESSCREEN ANZEIGEN ---
        this.state.player.hp = this.state.player.maxHp;
        this.state.currentBattle = null;
        if (this.state.currentCrawl) this.state.currentCrawl = null;
        this.save();

        UI.showDeathScreen(resultMessages, () => {
          this.showScreen("hideout");
        });
      }
    }, 1500);
  },

  // Item zum Inventar hinzufügen
  addItemToInventory(item) {
    const existingItem = this.state.player.inventory.find(
      (i) => i.id === item.id,
    );

    if (existingItem) {
      // Item existiert bereits, erhöhe Anzahl
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      // Neues Item hinzufügen
      this.state.player.inventory.push({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        quantity: 1,
      });
      console.log(`${item.name} zum Inventar hinzugefügt`);
    }

    this.save();
  },

  // Item aus Inventar entfernen
  removeItemFromInventory(itemId, quantity = 1) {
    console.log(
      "removeItemFromInventory aufgerufen:",
      itemId,
      "Anzahl:",
      quantity,
    );

    const itemIndex = this.state.player.inventory.findIndex(
      (i) => i.id === itemId,
    );

    if (itemIndex !== -1) {
      const item = this.state.player.inventory[itemIndex];
      item.quantity -= quantity;

      console.log(`${item.name} Anzahl reduziert auf ${item.quantity}`);

      // Wenn Anzahl 0 oder weniger, aus Inventar entfernen
      if (item.quantity <= 0) {
        this.state.player.inventory.splice(itemIndex, 1);
        console.log(`${item.name} aus Inventar entfernt`);
      }

      this.save();
      return true;
    }

    console.log("Item nicht im Inventar gefunden");
    return false;
  },

  // ===== SHOP-SYSTEM =====

  // Item kaufen
  buyItem(merchantId, offerIndex, quantity = 1) {
    const merchant = this.merchants[merchantId];
    if (!merchant || !merchant.offers[offerIndex]) return false;

    const offer = merchant.offers[offerIndex];
    const item = this.items[offer.itemId];
    const totalCost = offer.price * quantity;

    // Glitzer prüfen
    const glitzerCount = this.state.player.stats.glitzer;

    if (glitzerCount < totalCost) {
      console.log("Nicht genug Glitzer!");
      return false;
    }

    // Glitzer abziehen
    this.state.player.stats.glitzer -= totalCost;

    // Items hinzufügen
    for (let i = 0; i < quantity; i++) {
      this.addItemToInventory(item);
    }

    console.log(`${quantity}x ${item.name} für ${totalCost} Glitzer gekauft`);
    return true;
  },

  // Waffe verkaufen
  sellWeapon(weaponIndex) {
    if (weaponIndex < 0 || weaponIndex >= this.state.player.weapons.length) {
      console.log("Ungültiger Waffen-Index");
      return false;
    }

    const weaponInstance = this.state.player.weapons[weaponIndex];
    const weapon = this.resolveWeapon(weaponInstance);
    if (!weapon) {
      console.log("Waffe konnte nicht aufgelöst werden");
      return false;
    }

    const glitzerValue = weapon.glitzerValue || 0;

    // Prüfe ob Waffe ausgerüstet ist
    if (this.state.player.equippedWeapon === weaponIndex) {
      console.log("Waffe ist ausgerüstet und kann nicht verkauft werden!");
      return false;
    }

    // Waffe aus Array entfernen
    this.state.player.weapons.splice(weaponIndex, 1);

    // equippedWeapon Index anpassen (wenn größer als weaponIndex)
    if (
      typeof this.state.player.equippedWeapon === "number" &&
      this.state.player.equippedWeapon > weaponIndex
    ) {
      this.state.player.equippedWeapon -= 1;
    }

    // Glitzer hinzufügen
    if (glitzerValue > 0) {
      this.state.player.stats.glitzer += glitzerValue;
    }

    this.save();
    console.log(`${weapon.name} für ${glitzerValue} Glitzer verkauft`);
    return true;
  },

  // Item verkaufen
  sellItem(inventoryIndex, quantity = 1) {
    const item = this.state.player.inventory[inventoryIndex];
    if (!item) {
      console.log("Item nicht im Inventar gefunden");
      return false;
    }

    const itemDef = this.items[item.id];
    if (!itemDef) {
      console.log("Item-Definition nicht gefunden");
      return false;
    }

    const glitzerValue = itemDef.glitzerValue || 0;

    if (glitzerValue === 0) {
      console.log("Item kann nicht verkauft werden (kein Glitzer-Wert)");
      return false;
    }

    const availableQuantity = item.quantity || 1;
    if (quantity > availableQuantity) {
      console.log("Nicht genug Items zum Verkaufen");
      return false;
    }

    // Items entfernen
    this.removeItemFromInventory(item.id, quantity);

    // Glitzer hinzufügen
    const totalValue = glitzerValue * quantity;
    this.state.player.stats.glitzer += totalValue;

    this.save();
    console.log(
      `${quantity}x ${itemDef.name} für ${totalValue} Glitzer verkauft`,
    );
    return true;
  },

  // Item nutzen (z.B. Heiltrank)
  useItem(itemId) {
    const itemInInventory = this.state.player.inventory.find(
      (i) => i.id === itemId,
    );
    if (!itemInInventory) return false;

    const item = this.items[itemId];

    // Heiltrank
    if (item.type === "consumable" && item.healAmount) {
      const healAmount = item.healAmount;
      const oldHp = this.state.player.hp;
      this.state.player.hp = Math.min(
        this.state.player.maxHp,
        this.state.player.hp + healAmount,
      );
      const actualHeal = this.state.player.hp - oldHp;

      // Item aus Inventar entfernen
      this.removeItemFromInventory(itemId, 1);
      this.save();

      console.log(`${item.name} genutzt! +${actualHeal} HP`);
      return actualHeal;
    }

    if (item.type === "consumable" && item.maxHpIncrease) {
      this.state.player.maxHp += item.maxHpIncrease;
      this.state.player.hp += item.maxHpIncrease;

      this.removeItemFromInventory(itemId, 1);
      this.save();

      console.log(`${item.name} verbraucht! Max HP erhöht.`);
      if (document.getElementById("stats-panel-window")) {
        // Trick: Stats-Fenster kurz schließen und öffnen zum Aktualisieren
        UI.toggleStatsPanel();
        UI.toggleStatsPanel();
      } else if (this.state.currentBattle) {
        // Falls man es im Kampf nutzt
        UI.updateBattleScreen();
      }
      return true;
    }

    return false;
  },

  // Prüfen ob Welt freigeschaltet ist
  isWorldUnlocked(worldId) {
    const world = this.bossWorlds[worldId];
    if (!world) return false;

    // Wenn kein requiredBoss definiert ist, ist die Welt immer offen (Welt 1)
    if (!world.requiredBoss) return true;

    // Prüfen ob der benötigte Boss in der Besiegt-Liste ist
    return this.state.defeatedBosses.includes(world.requiredBoss);
  },

  // ===== CRAWL-SYSTEM (Boss-Welt-Erkundung) =====

  // Boss-Welt-Crawl starten
  startCrawl(bossWorldId) {
    if (!this.isWorldUnlocked(bossWorldId)) {
      console.log("Diese Welt ist noch gesperrt!");
      return;
    }

    const bossWorld = this.bossWorlds[bossWorldId];

    const boss = this.bosses[bossWorld.boss];
    if (!boss) {
      console.error("Boss nicht gefunden:", bossWorld.boss);
      return;
    }

    // Crawl-Zustand initialisieren
    this.state.currentCrawl = {
      bossWorldId: bossWorldId,
      bossId: bossWorld.boss,
      security: 100, // Startet bei 100% Sicherheit
      chaosLevel: 0, // Startet bei 0 Chaos
      availableEvents: [], // Wird gleich gefüllt
      eventHistory: [],
    };

    // Events generieren (nachdem currentCrawl existiert)
    this.state.currentCrawl.availableEvents = this.generateRandomEvents();

    this.save();
    UI.showCrawlEventSelection();
  },

  // 3 zufällige Events generieren
  generateRandomEvents() {
    const crawl = this.state.currentCrawl;
    if (!crawl) return [];

    const bossWorld = this.bossWorlds[crawl.bossWorldId];
    let eventsToChooseFrom = [];

    // NEUE LOGIK:
    // Fall A: allowedEvents ist definiert -> Wir nutzen diese Liste als Basis (ermöglicht Gewichtung!)
    if (bossWorld.allowedEvents && bossWorld.allowedEvents.length > 0) {
      bossWorld.allowedEvents.forEach((eventId) => {
        const event = this.crawlEvents[eventId];

        // Existiert das Event überhaupt?
        if (!event) {
          console.warn(
            `[EVENT] ID '${eventId}' in allowedEvents nicht gefunden!`,
          );
          return;
        }

        // Chaos-Checks prüfen
        if (event.minChaos > crawl.chaosLevel) return;
        if (
          event.maxChaos !== null &&
          event.maxChaos !== undefined &&
          crawl.chaosLevel > event.maxChaos
        )
          return;

        // Wenn alles passt: Ab in den Topf!
        // (Wenn die ID 3x in allowedEvents steht, landet das Event hier auch 3x drin)
        eventsToChooseFrom.push(event);
      });
    }
    // Fall B: allowedEvents ist null -> Wir nehmen ALLE definierten Events (Fallback)
    else {
      const allEvents = Object.values(this.crawlEvents);
      eventsToChooseFrom = allEvents.filter((event) => {
        if (event.minChaos > crawl.chaosLevel) return false;
        if (
          event.maxChaos !== null &&
          event.maxChaos !== undefined &&
          crawl.chaosLevel > event.maxChaos
        )
          return false;
        return true;
      });
    }

    // Falls keine Events vorhanden sind
    if (eventsToChooseFrom.length === 0) {
      console.error(
        "[EVENT] Keine passenden Events gefunden! Prüfe allowedEvents oder minChaos/maxChaos",
      );
      return [];
    }

    // Mischen und 3 auswählen
    const shuffled = [...eventsToChooseFrom].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);
    return selected;
  },

  // Event-Auswahl anzeigen (Debug-Version)
  showEventSelection() {
    if (!this.state.currentCrawl) return;
  },

  // Event auswählen
  selectEvent(eventIndex) {
    if (!this.state.currentCrawl) return;

    const crawl = this.state.currentCrawl;
    const event = crawl.availableEvents[eventIndex];

    if (!event) return;

    // Je nach Event-Typ unterschiedlich behandeln
    if (event.type === "combat") {
      // Kampf-Event: Direkt zum Kampf
      this.startCombatEvent(event);
    } else if (event.type === "multipleChoice") {
      // Multiple Choice: UI anzeigen
      this.state.currentEvent = event;
      this.save();
      UI.showMultipleChoiceEvent();
    }
  },

  // Kampf-Event starten
  startCombatEvent(event) {
    // Sicherheit und Chaos verarbeiten
    this.processEventEffects(event);

    // Gegner-Instanzen erstellen
    const enemies = event.enemies
      .map((enemyId) => {
        const enemyDef = this.enemies[enemyId];
        if (!enemyDef) {
          console.error("Gegner nicht gefunden:", enemyId);
          return null;
        }

        // Kopie des Gegners erstellen
        return JSON.parse(JSON.stringify(enemyDef));
      })
      .filter((e) => e !== null);

    if (enemies.length === 0) {
      console.error("Keine gültigen Gegner für Combat Event");
      return;
    }

    // Kampf starten (ähnlich wie Boss-Kampf, aber mit Gegner-Liste)
    this.startEnemyBattle(enemies);
  },

  // Gegner-Kampf starten (mit mehreren Gegnern)
  startEnemyBattle(enemies) {
    // Alle Statuseffekte (wie Gift) beim Spieler zu Kampfbeginn entfernen
    this.state.player.statusEffects = [];

    // Initialisiere statusEffects für alle Gegner
    enemies.forEach((enemy) => {
      if (!enemy.statusEffects) {
        enemy.statusEffects = [];
      }
    });

    this.state.currentBattle = {
      enemies: enemies, // Array von Gegnern
      currentEnemyIndex: 0, // Aktueller Gegner im Array (für Gegner-Angriffe)
      selectedTarget: 0, // Ausgewähltes Ziel für Spieler-Angriffe
      boss: enemies[0], // Aktueller Gegner (für Kompatibilität mit Battle UI)
      turn: "player",
      playerActionPoints: this.state.player.maxActionPoints,
      bossActionPoints: 0, // Gegner haben keine AP (greifen immer an)
      blockBonus: 0,
      log: [`Kampf gegen ${enemies.length} Gegner beginnt!`],
    };
    this.save();
    UI.showBattleScreen();
  },

  // Gegner-Ziel auswählen (nur bei Gegner-Kämpfen)
  selectEnemyTarget(enemyIndex) {
    const battle = this.state.currentBattle;
    if (!battle || !battle.enemies) return;

    if (enemyIndex >= 0 && enemyIndex < battle.enemies.length) {
      const enemy = battle.enemies[enemyIndex];
      // Nur lebende Gegner können ausgewählt werden
      if (!enemy.defeated) {
        battle.selectedTarget = enemyIndex;
        battle.boss = enemy; // Update boss reference
        this.save();
      }
    }
  },

  // Multiple Choice Antwort wählen
  selectChoice(choiceIndex) {
    const event = this.state.currentEvent;
    if (!event || !event.choices) return;

    const choice = event.choices[choiceIndex];
    if (!choice) return;

    let resultMessages = [];
    let isReturningToHideout = false;

    // Effekte der Antwort verarbeiten
    if (choice.effects) {
      choice.effects.forEach((effect) => {
        const msg = this.applyChoiceEffect(effect);
        if (msg) resultMessages.push(msg);

        if (effect.type === "returnToHideout") {
          isReturningToHideout = true;
        }
      });
    }

    // Falls das Event "returnToHideout" beinhaltet, brechen wir hier ab
    // und gehen nach dem Klick auf "Weiter" direkt ins Hideout
    if (isReturningToHideout) {
      this.state.currentCrawl = null;
      this.state.currentEvent = null;
      this.save();

      UI.showResultScreen(event.name, resultMessages, () => {
        this.showScreen("hideout");
      });
      return;
    }

    // Event-Basiseffekte verarbeiten (Sicherheit sinkt, Chaos steigt im Hintergrund immer um +1)
    this.processEventEffects(event);

    // Basis-Infos für den Screen anhängen (Wir zeigen nur noch die Sicherheit, das Standard-Chaos lassen wir weg)
    resultMessages.push(
      `<span style="color: #fca5a5;">Sicherheit: -${event.securityDecrease}%</span>`,
    );

    // Falls die Auswahl keine besonderen Effekte (wie Items oder zusätzliches Chaos) hatte,
    // steht jetzt nur noch die Sicherheit im Array (Länge = 1)
    if (resultMessages.length === 1) {
      resultMessages.unshift(
        "Du entscheidest dich, deinen Weg fortzusetzen...",
      );
    }

    const eventName = event.name;

    // Event beenden
    this.state.currentEvent = null;
    this.save();

    // Zeige den Resultscreen und prüfe danach den Boss-Spawn (wenn man "Weiter" klickt)
    UI.showResultScreen(eventName, resultMessages, () => {
      if (this.state.currentCrawl) {
        this.checkBossSpawn();
      } else {
        this.showScreen("hideout");
      }
    });
  },

  // Wahl-Effekt anwenden und formatierte Nachricht für Resultscreen zurückgeben
  applyChoiceEffect(effect) {
    let message = "";
    switch (effect.type) {
      case "addItem":
        // 1. Sonderregel für Glitzer: Unabhängig davon, ob es als normales Item definiert ist!
        if (effect.itemId === "glitzer") {
          this.state.player.stats.glitzer += effect.amount || 1;
          message = `<span style="color: #fbbf24;">Erhalten: +${effect.amount || 1} Glitzer</span>`;
        }
        // 2. Normale Items
        else {
          const itemDef = this.items[effect.itemId];
          if (itemDef) {
            for (let i = 0; i < (effect.amount || 1); i++) {
              this.addItemToInventory(itemDef);
            }
            message = `Erhalten: <strong style="color: var(--accent-color);">${effect.amount || 1}x ${itemDef.name}</strong>`;
          } else {
            console.warn("Item nicht gefunden:", effect.itemId);
          }
        }
        break;
      case "addChaos":
        const crawl = this.state.currentCrawl;
        if (crawl) {
          crawl.chaosLevel += effect.amount || 1;
          message = `<span style="color: #a855f7;">Zusätzliches Chaos: +${effect.amount || 1}</span>`;
        }
        break;
      case "addGold":
        this.state.player.gold += effect.amount || 0;
        message = `<span style="color: #fbbf24;">Gold: +${effect.amount || 0}</span>`;
        break;
      case "addHp":
        this.state.player.hp = Math.min(
          this.state.player.maxHp,
          this.state.player.hp + (effect.amount || 0),
        );
        message = `<span style="color: #22c55e;">HP: +${effect.amount || 0}</span>`;
        break;
      case "removeHp":
        this.state.player.hp = Math.max(
          0,
          this.state.player.hp - (effect.amount || 0),
        );
        message = `<span style="color: #e74c3c;">Du verlierst ${effect.amount || 0} HP!</span>`;
        break;
      case "returnToHideout":
        message = "Du verlässt den Dungeon sicher und kehrst zurück.";
        break;
      default:
        console.warn("Unbekannter Effekt-Typ:", effect.type);
    }
    return message;
  },

  // Event-Basiseffekte verarbeiten (Sicherheit, Chaos)
  processEventEffects(event) {
    const crawl = this.state.currentCrawl;
    if (!crawl) return;

    // Sicherheit verringern
    crawl.security = Math.max(0, crawl.security - event.securityDecrease);

    // Chaoslevel erhöhen
    crawl.chaosLevel += 1;

    // Event zur Historie hinzufügen
    crawl.eventHistory.push({
      event: event.name,
      securityAfter: crawl.security,
      chaosLevelAfter: crawl.chaosLevel,
    });

    this.save();
  },

  // Prüfen ob Boss erscheint
  checkBossSpawn() {
    const crawl = this.state.currentCrawl;

    // Sicherheit: Prüfen ob crawl existiert
    if (!crawl) {
      console.error("checkBossSpawn aufgerufen, aber currentCrawl ist null");
      return;
    }

    // Spawn-Wahrscheinlichkeit berechnen (basierend auf fehlender Sicherheit)
    const spawnChance = 100 - crawl.security; // 0% Sicherheit = 100% Spawn-Chance
    const roll = Math.random() * 100;

    console.log("Sicherheit:", crawl.security + "%");

    if (roll < spawnChance) {
      // Boss erscheint!
      this.spawnBoss();
    } else {
      // Boss erscheint nicht, nächste Event-Runde
      // Neue Events generieren
      crawl.availableEvents = this.generateRandomEvents();
      this.save();

      setTimeout(() => {
        // Prüfen ob Crawl noch aktiv ist
        if (this.state.currentCrawl) {
          this.showEventSelection();
          UI.showCrawlEventSelection();
        }
      }, 500);
    }
  },

  // Boss spawnen und Kampf starten
  spawnBoss() {
    const crawl = this.state.currentCrawl;
    const boss = this.bosses[crawl.bossId];

    // Crawl beenden und Kampf starten
    this.state.currentCrawl = null;
    this.save();

    this.startBattle(boss);
  },

  // ===== RITUAL-SYSTEM =====

  // Ritual durchführen
  performRitual() {
    const ritual = this.state.currentRitual;
    if (!ritual || ritual.selectedItems.length !== 6) {
      console.log("Ritual benötigt exakt 6 Items");
      return false;
    }

    // Items aus Inventar entfernen
    const itemDetails = ritual.selectedItems.map((itemId) => {
      const itemDef = this.items[itemId];
      this.removeItemFromInventory(itemId, 1);
      return itemDef;
    });

    // 1. Power-Score berechnen
    const powerScore = itemDetails.reduce((sum, item) => sum + item.value, 0);
    console.log(`[RITUAL] Power-Score: ${powerScore}`);

    // 2. Modifier-Wahrscheinlichkeit berechnen
    const modifierCounts = {};
    itemDetails.forEach((item) => {
      const type = item.modifierType;
      modifierCounts[type] = (modifierCounts[type] || 0) + 1;
    });

    console.log("[RITUAL] Modifier-Counts:", modifierCounts);

    // 3. Waffen-Pool erstellen: Alle Waffen im Bereich powerScore ±5
    const minValue = powerScore - 5;
    const maxValue = powerScore + 5;

    let weaponPool = Object.values(this.weaponBases).filter((weapon) => {
      if (!weapon.ritualValue) return false;
      return weapon.ritualValue >= minValue && weapon.ritualValue <= maxValue;
    });

    console.log(
      `[RITUAL] Waffen-Pool (${minValue}-${maxValue}): ${weaponPool.length} Waffen`,
    );

    // Fallback: Wenn keine Waffe im ±5 Bereich, nimm die nächstgelegene
    if (weaponPool.length === 0) {
      console.log(
        "[RITUAL] Kein Waffenpool im ±5 Bereich, suche nächstgelegene Waffe",
      );

      const allWeapons = Object.values(this.weaponBases).filter(
        (weapon) => weapon.ritualValue,
      );

      if (allWeapons.length === 0) {
        console.log("[RITUAL] Keine Waffen mit ritualValue gefunden");
        return false;
      }

      // Sortiere nach Distanz zum powerScore
      allWeapons.sort((a, b) => {
        const distA = Math.abs(a.ritualValue - powerScore);
        const distB = Math.abs(b.ritualValue - powerScore);
        return distA - distB;
      });

      // Nimm die nächstgelegene
      weaponPool = [allWeapons[0]];
      console.log(
        `[RITUAL] Nächstgelegene Waffe: ${weaponPool[0].name} (ritualValue: ${weaponPool[0].ritualValue}, Distanz: ${Math.abs(weaponPool[0].ritualValue - powerScore)})`,
      );
    }

    // Zufällig eine Waffe aus dem Pool wählen
    const randomIndex = Math.floor(Math.random() * weaponPool.length);
    const selectedWeapon = weaponPool[randomIndex];

    console.log(
      `[RITUAL] Gewählte Waffe: ${selectedWeapon.name} (ritualValue: ${selectedWeapon.ritualValue})`,
    );

    // 5. Effekt würfeln basierend auf Modifier-Wahrscheinlichkeit
    // Gewichtete Zufallsauswahl - maximal EIN Effekt
    let selectedEffect = null;

    // Erstelle gewichteten Pool (ALLE Items, auch 'none')
    const weightedPool = [];
    for (const [modifierType, count] of Object.entries(modifierCounts)) {
      // Jedes Item = ein Eintrag im Pool (auch 'none')
      for (let i = 0; i < count; i++) {
        weightedPool.push(modifierType);
      }

      const percentage = ((count / 6) * 100).toFixed(1);
      console.log(
        `[RITUAL] ${modifierType}: ${count}/6 = ${percentage}% Chance`,
      );
    }

    console.log(`[RITUAL] Pool-Größe: ${weightedPool.length} Items`);

    // Zufällig einen Modifier aus Pool wählen
    if (weightedPool.length > 0) {
      const randomEffectIndex = Math.floor(Math.random() * weightedPool.length);
      const chosenModifier = weightedPool[randomEffectIndex];

      console.log(`[RITUAL] Gezogen: ${chosenModifier}`);

      // None = kein Effekt
      if (chosenModifier === "none") {
        console.log(`[RITUAL] 'none' gezogen - kein Effekt`);
      } else {
        // Prüfe ob der Effekt existiert
        if (this.effects[chosenModifier]) {
          selectedEffect = chosenModifier;
          console.log(`[RITUAL] ✓ Effekt ${chosenModifier} angewendet`);
        } else {
          console.log(`[RITUAL] ✗ Effekt ${chosenModifier} nicht gefunden`);
        }
      }
    } else {
      console.log(`[RITUAL] Leerer Pool - kein Effekt`);
    }

    // 6. Waffe hinzufügen
    const weaponInstance = {
      baseId: selectedWeapon.id,
      effects: selectedEffect ? [selectedEffect] : [],
    };

    this.addWeapon(weaponInstance);

    // 7. Ritual abschließen
    this.state.currentRitual = null;
    this.save();

    const effectCount = selectedEffect ? 1 : 0;
    console.log(
      `[RITUAL] Ritual abgeschlossen! Waffe: ${selectedWeapon.name}, Effekte: ${effectCount} (${selectedEffect || "keiner"})`,
    );

    // === Result Screen vorbereiten und aufrufen ===
    const messages = [
      `Du hast erfolgreich eine neue Waffe erschaffen:`,
      `<strong style="color: var(--accent-color); font-size: 1.3em;">${selectedWeapon.name}</strong>`,
    ];

    if (selectedEffect) {
      const effectDef = this.effects[selectedEffect];
      messages.push(
        `<br>Mit dem Zusatzeffekt: <span style="color: #e74c3c;">${effectDef.name}</span>`,
      );
    } else {
      messages.push(
        `<br><span style="color: var(--placeholder-color);">Keine Zusatzeffekte aufgetreten.</span>`,
      );
    }

    // Zeige den Result-Screen. Wenn man "Weiter" klickt, geht's ins Hideout.
    UI.showResultScreen("Ritual erfolgreich!", messages, () => {
      this.showScreen("hideout");
    });

    return true;
  },
};

// Game beim Laden der Seite starten
window.addEventListener("DOMContentLoaded", () => {
  Game.init();
});
