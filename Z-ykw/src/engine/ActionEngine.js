// src/engine/ActionEngine.js
import { StatCalculator } from "./StatCalculator.js";
import { stateManager } from "./StateManager.js";
import { Definitions } from "../data/definitions.js";

export class ActionEngine {
  // --- ITEM INTERAKTION ---

  static useItem(itemId) {
    const itemDef = Definitions.items[itemId];
    if (!itemDef) {
      console.error("Item Definition nicht gefunden:", itemId);
      return;
    }

    if (itemDef.type === "consumable") {
      this.consumeItem(itemDef);
    } else if (itemDef.type === "weapon" || itemDef.type === "armor") {
      this.toggleEquipItem(itemDef);
    } else {
      this.log(`Du betrachtest ${itemDef.name}.`, "neutral");
    }
  }

  static consumeItem(itemDef) {
    if (itemDef.effect === "heal") {
      const player = stateManager.getState().player;
      const healAmount = itemDef.value || 0;

      // Prüfung: Ist Heilung nötig?
      if (player.hp >= player.maxHp) {
        this.log("Deine Gesundheit ist bereits voll.", "neutral");
        return; // Item wird NICHT verbraucht
      }

      // Versuche Item zu entfernen
      if (stateManager.removeItem(itemDef.id)) {
        stateManager.modifyPlayerHp(healAmount);
        this.log(`${itemDef.name} getrunken: +${healAmount} HP.`, "player");
      } else {
        this.log("Fehler: Item konnte nicht verbraucht werden.", "neutral");
      }
    }
  }

  // NEU: Toggle Logik (Anziehen / Ausziehen)
  static toggleEquipItem(itemDef) {
    const player = stateManager.getState().player;
    const currentEquip =
      itemDef.type === "weapon"
        ? player.equipped.weapon
        : player.equipped.armor;

    // Ist genau dieses Item schon ausgerüstet?
    if (currentEquip && currentEquip.id === itemDef.id) {
      // Ja -> Ablegen
      stateManager.unequipItem(itemDef.type);
      this.log(`${itemDef.name} abgelegt.`, "neutral");
    } else {
      // Nein -> Anziehen
      stateManager.equipItem(itemDef.id);
      this.log(`${itemDef.name} ausgerüstet.`, "neutral");
    }
  }

  // --- KAMPF LOGIK ---

  static startCombat(enemyIds) {
    const enemies = enemyIds
      .map((id) => Definitions.enemies[id])
      .filter((e) => e);

    if (enemies.length === 0) return;

    stateManager.resetPlayerAp();
    stateManager.startCombat(enemies);

    const names = enemies.map((e) => e.name).join(" & ");
    this.log(`Kampf gestartet gegen: ${names}!`, "neutral");
  }

  static useSkill(skillId) {
    const state = stateManager.getState();
    if (!state.currentEnemy) return;

    const skill = Definitions.abilities[skillId];
    if (!skill) return;

    const currentAp = state.player.currentAp;
    const cost = skill.apCost || 0;

    if (currentAp < cost) {
      this.log(`Nicht genug Ausdauer! (Benötigt: ${cost} AP)`, "neutral");
      return; // Abbruch, Aktion wird nicht ausgeführt
    }

    stateManager.modifyPlayerAp(-cost);

    if (skill.type === "attack") {
      this.executeAttack("player", "enemy", skill);
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
        let incomingDamageTotal = 0;

        this.log("--- Gegner Zug ---", 'neutral');

        // JEDER lebende Gegner greift an
        enemies.forEach((enemy, index) => {
            if (enemy.hp > 0) {
                // Wir übergeben den Index, damit executeAttack weiß, wer angreift
                this.executeAttack('enemy', index);
            }
        });

        // Player Death Check
        if (stateManager.getState().player.hp <= 0) {
            this.log("Du wurdest besiegt...", 'enemy');
            stateManager.saveGame(); // Oder Reset Logik
            // stateManager.setCombatActive(false);
        } else {
            stateManager.resetPlayerAp();
            this.log("Du bist am Zug.", 'neutral');
        }
    }

  static executeAttack(source, sourceIndex = null, skill = null) {
    const state = stateManager.getState();
    let attacker, defender, attackerName;

    // Skill-Genauigkeit prüfen (Hit Chance)
    const accuracy = skill ? skill.accuracy || 1 : 1;

    // --- 1. ZIEL UND ANGREIFER ERMITTELN ---
    if (source === "player") {
      attacker = state.player;

      // ZIEL: Der aktuell anvisierte Gegner aus dem Combat-State
      const targetIdx = state.combat.targetIndex;
      defender = state.combat.enemies[targetIdx];
      attackerName = "Du";

      // Sicherheitscheck: Existiert das Ziel und lebt es?
      if (!defender || defender.hp <= 0) {
        this.log("Dieses Ziel ist bereits besiegt!", "neutral");
        return; // Abbruch
      }
    } else {
      // ZIEL: Gegner greift Spieler an
      // Wir holen den spezifischen Gegner aus dem Array anhand des sourceIndex
      attacker = state.combat.enemies[sourceIndex];
      defender = state.player;
      attackerName = attacker.name;
    }

    // --- 2. TREFFERCHANCE ---
    if (Math.random() > accuracy) {
      this.log(
        `${attackerName} verfehl${source === "player" ? "st" : "t"} das Ziel!`,
        "neutral",
      );
      // Bei Fehlschlag prüfen wir trotzdem, ob der Zug vorbei ist
      if (source === "player") this.checkTurnEnd();
      return;
    }

    // --- 3. SCHADEN BERECHNEN (Pipeline) ---
    const attackResult = StatCalculator.calculateAttack(attacker, skill);

    // --- 4. VERTEIDIGUNG BERECHNEN ---
    const defenseResult = StatCalculator.calculateDefense(
      defender,
      attackResult.damage,
    );
    const finalDamage = defenseResult.damage;

    // --- 5. LOGGING ---
    let logMsg = attackResult.isCrit ? " (KRITISCH!)" : "";
    const verb = source === "player" ? "triffst" : "trifft";

    // Name des Skills oder Standard-Text
    const actionText = skill
      ? skill.text
      : source === "player"
        ? "greifst an"
        : "greift an";
    // Wenn Spieler angreift, zeigen wir auch WEN er trifft
    const targetName = source === "player" ? defender.name : "";

    const type = source === "player" ? "player" : "enemy";
    this.log(
      `${attackerName} ${source === "player" ? "" : "(" + actionText + ")"} ${verb} ${targetName} für ${finalDamage} Schaden${logMsg}!`,
      type,
    );

    // --- 6. HP ABZIEHEN ---
    if (source === "player") {
      // WICHTIG: Dem spezifischen Gegner im Array Schaden zufügen
      stateManager.modifyEnemyHp(state.combat.targetIndex, -finalDamage);
    } else {
      stateManager.modifyPlayerHp(-finalDamage);
    }

    // --- 7. RUNDEN-ENDE & SIEG-CHECK (Nur nach Spieler-Aktion) ---
    if (source === "player") {
      // Prüfen: Sind ALLE Gegner im Array tot?
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

static winCombat() {
        const state = stateManager.getState();
        const enemies = state.combat.enemies;

        this.log("Alle Gegner besiegt!", "player");

        // 1. XP berechnen (Summe aller Gegner)
        let totalXp = 0;
        enemies.forEach(enemy => {
            totalXp += (enemy.xp || 0);
        });

        if (totalXp > 0) {
            stateManager.addXp(totalXp);
            this.log(`+${totalXp} Erfahrung erhalten.`, "neutral");
        }

        // 2. Loot für JEDEN Gegner berechnen
        enemies.forEach(enemy => {
            if (enemy.lootTable) {
                enemy.lootTable.forEach((loot) => {
                    if (Math.random() < loot.chance) {
                        stateManager.addItem(loot.itemId);
                        
                        // Name auflösen für schöneres Log
                        const itemDef = Definitions.items[loot.itemId];
                        const itemName = itemDef ? itemDef.name : loot.itemId;
                        
                        this.log(`Beute: ${itemName}`, "neutral");
                    }
                });
            }
        });

        stateManager.endCombat(); 
    }

  static log(message, type = "neutral") {
    const event = new CustomEvent("combat-log", { detail: { message, type } });
    window.dispatchEvent(event);
  }
}
