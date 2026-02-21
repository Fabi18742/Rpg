// src/engine/ActionEngine.js
import { StatCalculator } from "./StatCalculator.js";
import { stateManager } from "./StateManager.js";
import { Definitions } from "../data/definitions.js";

export class ActionEngine {
  // --- ITEM INTERAKTION ---

  static useItem(itemId) {
    const state = stateManager.getState();

    // 1. Suche in beiden Listen, egal wo das Item liegt
    let item = state.player.inventory.find((i) => i.id === itemId);
    if (!item) {
      item = state.player.weapons.find((w) => w.id === itemId);
    }

    // Fallback für Basis-Items
    if (!item) {
      item = Definitions.items[itemId] || Definitions.weapons[itemId];
    }

    if (!item) {
      console.error("Item nicht gefunden:", itemId);
      return;
    }

    // 2. Wir erkennen den Typ an den Eigenschaften, NICHT am Array!
    const isWeapon = item.type === "weapon" || item.damage !== undefined;
    const isArmor = item.type === "armor" || item.defense !== undefined;

    // 3. Entsprechende Aktion auslösen
    if (isWeapon) {
      this.toggleEquipWeapon(item);
    } else if (isArmor) {
      this.toggleEquipItem(item);
    } else if (item.type === "consumable") {
      this.consumeItem(item);
    } else {
      this.log(`Du betrachtest ${item.name}.`, "neutral");
    }
  }
  static consumeItem(itemDef) {
    if (itemDef.effect === "heal") {
      const player = stateManager.getState().player;
      const healAmount = itemDef.value || 0;

      if (player.hp >= player.maxHp) {
        this.log("Deine Gesundheit ist bereits voll.", "neutral");
        return; // Item wird NICHT verbraucht
      }

      if (stateManager.removeItem(itemDef.id)) {
        stateManager.modifyPlayerHp(healAmount);
        this.log(`${itemDef.name} getrunken: +${healAmount} HP.`, "player");
      }
    }
  }

  static toggleEquipWeapon(weapon) {
    const player = stateManager.getState().player;
    const current = player.equipped.weapon;

    // Ist diese Waffe gerade ausgerüstet? (ID Vergleich)
    if (current && current.id === weapon.id) {
      stateManager.unequipWeapon();
      this.log(`${weapon.name} weggesteckt.`, "neutral");
    } else {
      stateManager.equipWeapon(weapon.id);
      this.log(`${weapon.name} gezogen!`, "player");
    }
  }

  static toggleEquipItem(itemDef) {
    const player = stateManager.getState().player;
    const isWeapon = itemDef.type === "weapon" || itemDef.damage !== undefined;
    const currentEquip = isWeapon
      ? player.equipped.weapon
      : player.equipped.armor;

    // Ist genau dieses Item schon ausgerüstet?
    if (currentEquip && currentEquip.id === itemDef.id) {
      // Ja -> Ablegen
      stateManager.unequipItem(isWeapon ? "weapon" : "armor");
      this.log(`${itemDef.name} abgelegt.`, "neutral");
    } else {
      // Nein -> Anziehen
      stateManager.equipItem(itemDef.id);
      this.log(`${itemDef.name} ausgerüstet.`, "neutral");
    }
  }

  // --- KAMPF LOGIK ---

  static startCombat(enemyIds, isBoss = false, onWinEvent = null) {
    const enemies = enemyIds
      .map((id) => Definitions.enemies[id])
      .filter((e) => e);

    if (enemies.length === 0) return;

    stateManager.resetPlayerAp();

    stateManager.startCombat(enemies, isBoss, onWinEvent);

    const names = enemies.map((e) => e.name).join(" & ");
    this.log(`Kampf gestartet gegen: ${names}!`, "neutral");
  }

  static useSkill(skillId) {
    const state = stateManager.getState();

    if (!state.combat || !state.combat.active) return;

    const skill = Definitions.abilities[skillId];
    if (!skill) return;

    const currentAp = state.player.currentAp;
    const cost = skill.apCost || 0;

    if (currentAp < cost) {
      this.log(`Nicht genug Ausdauer! (Benötigt: ${cost} AP)`, "neutral");
      return;
    }

    stateManager.modifyPlayerAp(-cost);

    if (skill.type === "attack") {
      this.executeAttack("player", null, skill);
    } else if (skill.type === "heal") {
      stateManager.modifyPlayerHp(skill.value);
      this.log(
        `Du nutzt ${skill.name} und heilst ${skill.value} HP.`,
        "player",
      );
      this.checkTurnEnd();
    }
  }

  static enemyTurn() {
    const state = stateManager.getState();
    if (!state.combat.active) return;

    const enemies = state.combat.enemies;
    this.log("--- Gegner Zug ---", "neutral");

    // 1. Gegner Aktionen & Status Effekte (als klassischer Loop, um abbrechen zu können)
    for (let index = 0; index < enemies.length; index++) {
      const enemy = enemies[index];
      if (enemy.hp > 0) {
        // DoT auf Gegner anwenden
        const diedFromDot = this.processTurnEffects(enemy, false);

        if (diedFromDot) {
          this.log(`${enemy.name} ist an seinen Wunden erlegen!`, "player");
          stateManager.notify();
        } else {
          // Nur angreifen, wenn er nicht durch Gift gestorben ist
          this.executeAttack("enemy", index);

          // SOFORTIGER TODES-CHECK: Falls der Spieler durch diesen Hit stirbt, stoppe die weiteren Gegner!
          if (stateManager.getState().player.hp <= 0) {
            break;
          }
        }
      }
    }

    // 2. Prüfen ob Spieler durch die Angriffe gestorben ist
    if (stateManager.getState().player.hp <= 0) {
      this.loseCombat();
      return;
    }

    // 3. Status Effekte auf dem Spieler (Gift am Start seines Zuges)
    const playerDied = this.processTurnEffects(
      stateManager.getState().player,
      true,
    );
    if (playerDied) {
      this.loseCombat();
      return;
    }

    // 4. Spieler ist wieder dran (falls noch Gegner leben)
    const allDead = state.combat.enemies.every((e) => e.hp <= 0);
    if (allDead) {
      this.winCombat();
    } else {
      stateManager.resetPlayerAp();
      this.log("Du bist am Zug.", "neutral");
    }
  }

  // NEU: Handhabt den Tod des Spielers
  static loseCombat() {
    this.log("Du wurdest besiegt...", "enemy");
    const messages = ["Die Dunkelheit umfängt dich..."];
    stateManager.setResult("DU BIST GESTORBEN", messages, "combat_loss");
  }

  static executeAttack(source, sourceIndex = null, skill = null) {
    const state = stateManager.getState();
    let attacker, attackerName;
    let defenders = []; // Neu: Liste aller Ziele für diesen Angriff

    const accuracy = skill ? skill.accuracy || 1 : 1;

    // --- 1. ZIELE ERMITTELN ---
    if (source === "player") {
      attacker = state.player;
      attackerName = "Du";

      if (skill && skill.isAoE) {
        // FLÄCHENANGRIFF: Füge alle lebenden Gegner zur Zielliste hinzu
        state.combat.enemies.forEach((enemy, idx) => {
          if (enemy.hp > 0) defenders.push({ def: enemy, idx: idx });
        });

        if (defenders.length === 0) {
          this.log("Keine Ziele vorhanden!", "neutral");
          return;
        }
      } else {
        // EINZELANGRIFF
        const targetIdx = state.combat.targetIndex;
        const enemy = state.combat.enemies[targetIdx];
        if (!enemy || enemy.hp <= 0) {
          this.log("Dieses Ziel ist bereits besiegt!", "neutral");
          return;
        }
        defenders.push({ def: enemy, idx: targetIdx });
      }
    } else {
      // GEGNER GREIFT AN
      attacker = state.combat.enemies[sourceIndex];
      defenders.push({ def: state.player, idx: null });
      attackerName = attacker.name;
    }

    // --- 2. FÜR JEDES ZIEL DEN ANGRIFF AUSFÜHREN ---
    defenders.forEach((targetObj) => {
      const defender = targetObj.def;
      const targetIdx = targetObj.idx;

      const targetName = source === "player" ? defender.name : "";
      const actionText = skill
        ? skill.text
        : source === "player"
          ? "greifst an"
          : "greift an";

      // Ausweich-Check pro Ziel
      if (Math.random() > accuracy) {
        this.log(
          `${attackerName} verfehl${source === "player" ? "st" : "t"} ${targetName || "das Ziel"}!`,
          "neutral",
        );
        return; // Geht zum nächsten Ziel über (continue)
      }

      // Schaden berechnen
      const attackResult = StatCalculator.calculateAttack(attacker, skill);
      const defenseResult = StatCalculator.calculateDefense(
        defender,
        attackResult.damage,
        attackResult.damageType,
      );
      const finalDamage = defenseResult.damage;

      // Log-Nachricht bauen
      let logMsg = attackResult.isCrit
        ? " <span style='color: #f87171; font-weight: bold;'>(KRITISCH!)</span>"
        : "";

      if (defenseResult.effectiveness === "super") {
        logMsg +=
          " <span style='color: #22c55e; font-weight: bold; text-shadow: 0 0 5px #052e16;'>[SEHR EFFEKTIV]</span>";
      } else if (defenseResult.effectiveness === "resist") {
        logMsg +=
          " <span style='color: #fb923c; font-weight: bold; text-shadow: 0 0 5px #431407;'>[WIDERSTANDEN]</span>";
      }

      const verb = source === "player" ? "triffst" : "trifft";
      const type = source === "player" ? "player" : "enemy";

      this.log(
        `${attackerName} ${source === "player" ? "" : "(" + actionText + ")"} ${verb} ${targetName} für ${finalDamage} Schaden${logMsg}!`,
        type,
      );

      // HP abziehen
      if (source === "player") {
        stateManager.modifyEnemyHp(targetIdx, -finalDamage);
      } else {
        stateManager.modifyPlayerHp(-finalDamage);
      }

      // Effekte (z.B. Lifesteal, Gift) verarbeiten
      if (
        attackResult.activeEffects &&
        attackResult.activeEffects.length > 0 &&
        finalDamage > 0
      ) {
        this.processActiveEffects(
          attackResult.activeEffects,
          attacker,
          defender,
          finalDamage,
          source === "player",
        );
      }
    });

    // --- 3. RUNDEN-ENDE & SIEG-CHECK ---
    // (Wichtig: Das darf nur EINMAL am Ende der Attacke passieren, nicht in der Schleife!)
    if (source === "player") {
      const allDead = state.combat.enemies.every((e) => e.hp <= 0);
      if (allDead) {
        this.winCombat();
      } else {
        this.checkTurnEnd();
      }
    }
  }

  static checkTurnEnd() {
    const state = stateManager.getState();
    if (state.player.currentAp <= 0) {
      setTimeout(() => this.enemyTurn(), 800);
    }
  }

  static processActiveEffects(
    effectIds,
    attacker,
    defender,
    damageDealt,
    isPlayerSource,
  ) {
    effectIds.forEach((effectId) => {
      const effectDef = Definitions.effects[effectId];
      if (!effectDef) return;

      // Ist es ein Treffer-Effekt?
      if (effectDef.type === "on_hit") {
        if (effectDef.trigger === "apply_status") {
          const chance =
            effectDef.applyChance !== undefined ? effectDef.applyChance : 1.0;

          if (Math.random() <= chance) {
            this.applyStatusEffect(defender, effectDef);
          }
        }

        // Fall 2: Sich selbst heilen (z.B. Vampirismus)
        else if (effectDef.trigger === "heal_attacker") {
          const heal = Math.floor(damageDealt * effectDef.value);
          if (heal > 0) {
            if (isPlayerSource) {
              stateManager.modifyPlayerHp(heal);
              this.log(
                `Du heilst dich um ${heal} HP durch ${effectDef.name}!`,
                "player",
              );
            } else {
              attacker.hp += heal;
              this.log(
                `${attacker.name} heilt sich um ${heal} HP durch ${effectDef.name}.`,
                "enemy",
              );
              stateManager.notify();
            }
          }
        }
      }
    });
  }

  static applyStatusEffect(target, effectDef) {
    if (!target.statusEffects) target.statusEffects = [];

    const existing = target.statusEffects.find(
      (e) => e.id === effectDef.statusId,
    );
    const name = target.name || "Du";

    if (existing) {
      // --- STACK-LOGIK: Stacks addieren statt Dauer verlängern ---
      existing.stacks += effectDef.stacksToApply || 1;
      this.log(
        `🧪 ${name}: ${effectDef.name} stapelt sich auf ${existing.stacks}!`,
        "neutral",
      );
    } else {
      target.statusEffects.push({
        id: effectDef.statusId,
        name: effectDef.name,
        baseDamage: effectDef.baseDamage || 0,
        stacks: effectDef.stacksToApply || 1, // Nutzt Stacks
        type: effectDef.statusType,
      });
      this.log(
        `🧪 ${name} leidet nun unter ${effectDef.name} (${effectDef.stacksToApply} Stacks)!`,
        "neutral",
      );
    }
    stateManager.notify();
  }

  static processTurnEffects(entity, isPlayer) {
    if (!entity.statusEffects || entity.statusEffects.length === 0)
      return false;

    let died = false;

    // Rückwärts loopen, damit wir sicher löschen können
    for (let i = entity.statusEffects.length - 1; i >= 0; i--) {
      const effect = entity.statusEffects[i];

      if (effect.type === "dot") {
        // --- SCHADENS-LOGIK: Basis + Stacks ---
        const dmg = effect.baseDamage + effect.stacks;

        if (isPlayer) {
          stateManager.modifyPlayerHp(-dmg);
        } else {
          entity.hp -= dmg;
        }
        const name = isPlayer ? "Du erleidest" : `${entity.name} erleidet`;
        this.log(`🧪 ${name} ${dmg} Schaden durch ${effect.name}.`, "neutral");
      }

      // --- ABKLING-LOGIK: 1 Stack pro Runde abziehen ---
      effect.stacks--;
      if (effect.stacks <= 0) {
        const name = isPlayer ? "Dir" : entity.name;
        this.log(`${effect.name} auf ${name} ist abgeklungen.`, "neutral");
        entity.statusEffects.splice(i, 1);
      }

      if (entity.hp <= 0) died = true;
    }

    if (!isPlayer) stateManager.notify();
    return died;
  }

  static winCombat() {
    const state = stateManager.getState();
    const enemies = state.combat.enemies;
    const messages = [];

    let totalXp = 0;
    let totalGold = 0;

    //Ein Sammelbecken für alle Item-Drops in diesem Kampf
    const gatheredLoot = new Map();

    enemies.forEach((enemy) => {
      totalXp += enemy.xp || 0;
      totalGold += enemy.gold || 5;

      if (enemy.lootTable) {
        enemy.lootTable.forEach((loot) => {
          if (Math.random() < loot.chance) {
            stateManager.addItem(loot.itemId);

            const currentAmount = gatheredLoot.get(loot.itemId) || 0;
            gatheredLoot.set(loot.itemId, currentAmount + 1);
          }
        });
      }
    });

    // 1. XP Nachricht
    if (totalXp > 0) {
      stateManager.addXp(totalXp);
      messages.push(
        `<span style="color: #a855f7; font-weight: bold;">+${totalXp} Erfahrung</span>`,
      );
    }

    // 2. Gold Nachricht
    if (totalGold > 0) {
      stateManager.modifyGold(totalGold);
      messages.push(
        `<span style="color: #fbbf24; font-weight: bold;">+${totalGold} Gold</span>`,
      );
    }

    if (gatheredLoot.size > 0) {
      gatheredLoot.forEach((amount, itemId) => {
        const itemDef =
          Definitions.items[itemId] || Definitions.weapons[itemId];
        const itemName = itemDef ? itemDef.name : itemId;
        messages.push(
          `<span style="color: #fff;">${amount}x ${itemName}</span>`,
        );
      });
    }

    if (messages.length === 0)
      messages.push("Die Monster hatten nichts von Wert bei sich.");

    if (state.combat.onWinEvent) {
      stateManager.addEventToPool(state.combat.onWinEvent);
      messages.push(
        `<span style="color: #fbbf24; font-weight:bold; margin-top:10px; display:block;">Die Geschichte geht weiter...</span>`,
      );
    }

    // BOSS-CHECK & DUNGEON-ENDE
    if (state.crawl && state.crawl.active && state.combat.isBoss) {
      const worldDef = Definitions.worlds[state.crawl.worldId];
      const loot = state.crawl.lootTrack; // Loot direkt hier oben holen

      // 1. ZUERST die Nachrichten-Liste erstellen!
      const bossMessages = [
        `<div style="font-size: 1.1em; margin-bottom: 20px;">Du hast den Level-Boss besiegt und entkommst mit deiner Beute!</div>`,
        `<div style="border-top: 1px solid #444; margin-bottom: 10px;"></div>`,
        `<div style="color: #aaa; font-size: 0.9em; text-transform: uppercase; margin-bottom: 10px;">Gesamte Ausbeute dieses Dungeons:</div>`,
      ];

      // 2. DANN Boss speichern und Achievements checken
      if (worldDef && worldDef.bossId) {
        stateManager.addDefeatedBoss(worldDef.bossId);

        Object.values(Definitions.achievements).forEach((ach) => {
          if (
            ach.triggerType === "boss_kill" &&
            ach.targetId === worldDef.bossId
          ) {
            if (stateManager.unlockAchievement(ach.id)) {
              // Jetzt existiert bossMessages und wir können fehlerfrei pushen!
              bossMessages.push(
                `<span style="color: var(--accent-color); font-weight: bold; margin-top: 10px; display: block;">🏆 Errungenschaft: ${ach.name} freigeschaltet!</span>`,
              );
            }
          }
        });
      }

      // 3. Loot an die Nachrichten anhängen
      if (loot.xp > 0)
        bossMessages.push(
          `<span style="color: #a855f7; font-weight: bold;">Erfahrung: +${loot.xp} XP</span>`,
        );
      if (loot.gold > 0)
        bossMessages.push(
          `<span style="color: #fbbf24; font-weight: bold;">Gold: +${loot.gold} G</span>`,
        );

      if (loot.items.length > 0) {
        loot.items.forEach((i) => {
          const def = Definitions.items[i.id] || Definitions.weapons[i.id];
          bossMessages.push(
            `<span style="color: #fff;">${i.amount}x ${def ? def.name : i.id}</span>`,
          );
        });
      } else {
        bossMessages.push(
          `<span style="color: #888; font-style: italic;">Keine Items gefunden...</span>`,
        );
      }

      stateManager.setResult(
        "DUNGEON ABGESCHLOSSEN!",
        bossMessages,
        "boss_win",
      );
    } else {
      stateManager.setResult("KAMPF GEWONNEN!", messages, "combat_win");
    }
  }

  static log(message, type = "neutral") {
    const event = new CustomEvent("combat-log", { detail: { message, type } });
    window.dispatchEvent(event);
  }
}
