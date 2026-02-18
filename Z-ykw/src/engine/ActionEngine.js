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

  static startCombat(enemyId) {
    const enemyDef = Definitions.enemies[enemyId];
    if (!enemyDef) return;

    const enemy = { ...enemyDef, maxHp: enemyDef.hp };
    stateManager.resetPlayerAp();
    stateManager.setEnemy(enemy);
    this.log(`Ein wildes ${enemy.name} taucht auf!`, "neutral");
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
    if (!state.currentEnemy) return;

    this.executeAttack("enemy", "player");

    if (stateManager.getState().player.hp <= 0) {
      this.log("Du wurdest besiegt...", "enemy");
      stateManager.setEnemy(null);
    } else {
      stateManager.resetPlayerAp();
      this.log("Du bist am Zug.", "neutral");
    }
  }

  static executeAttack(source, target, skill = null) {
    const state = stateManager.getState();
    let attacker, defender, attackerName;

    // Skill-Genauigkeit prüfen (Hit Chance)
    const accuracy = skill ? skill.accuracy || 1 : 1; // Standard 100%

    if (source === "player") {
      attacker = state.player;
      defender = state.currentEnemy;
      attackerName = "Du";
    } else {
      attacker = state.currentEnemy;
      defender = state.player;
      attackerName = state.currentEnemy.name;
    }

    // 1. Trefferchance prüfen
    if (Math.random() > accuracy) {
      this.log(
        `${attackerName} verfehl${source === "player" ? "st" : "t"} das Ziel!`,
        "neutral",
      );
      if (source === "player") this.checkTurnEnd();
      return;
    }

    // 2. Schaden berechnen (via StatCalculator Pipeline)
    const attackResult = StatCalculator.calculateAttack(attacker, skill);

    // 3. Verteidigung berechnen
    const defenseResult = StatCalculator.calculateDefense(
      defender,
      attackResult.damage,
    );

    const finalDamage = defenseResult.damage;

    // 4. Logging & State Update
    let logMsg = "";

    // Crit Nachricht
    if (attackResult.isCrit) {
      logMsg += " (KRITISCH!)";
    }

    const verb = source === "player" ? "triffst" : "trifft";
    const actionText = skill
      ? skill.text
      : source === "player"
        ? "greifst an"
        : "greift an";

    // Beispiel Log: "Du (Wuchtschlag) triffst für 15 Schaden! (KRITISCH!)"
    const type = source === "player" ? "player" : "enemy";
    this.log(
      `${attackerName} ${source === "player" ? "" : "(" + actionText + ")"} ${verb} für ${finalDamage} Schaden${logMsg}!`,
      type,
    );

    // HP abziehen
    if (target === "player") {
      stateManager.modifyPlayerHp(-finalDamage);
    } else {
      stateManager.modifyEnemyHp(-finalDamage);
    }

    // 5. Runden-Ende Check (nur für Spieler)
    if (source === "player") {
      if (stateManager.getState().currentEnemy.hp <= 0) {
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
    const enemy = stateManager.getState().currentEnemy;
    this.log(`${enemy.name} besiegt!`, "player");

    if (enemy.xp) {
      stateManager.addXp(enemy.xp);
      this.log(`+${enemy.xp} Erfahrung erhalten.`, "neutral");
    }

    if (enemy.lootTable) {
      enemy.lootTable.forEach((loot) => {
        if (Math.random() < loot.chance) {
          stateManager.addItem(loot.itemId);
          const itemName = Definitions.items[loot.itemId].name;
          this.log(`Beute: ${itemName}`, "neutral");
        }
      });
    }

    stateManager.setEnemy(null);
  }

  static log(message, type = "neutral") {
    const event = new CustomEvent("combat-log", { detail: { message, type } });
    window.dispatchEvent(event);
  }
}
