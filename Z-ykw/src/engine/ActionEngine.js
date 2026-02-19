// src/engine/ActionEngine.js
import { StatCalculator } from "./StatCalculator.js";
import { stateManager } from "./StateManager.js";
import { Definitions } from "../data/definitions.js";

export class ActionEngine {
  // --- ITEM INTERAKTION ---

  static useItem(itemId) {
    const state = stateManager.getState();

    // 1. Suche im Inventar (Tränke/Mats)
    let item = state.player.inventory.find((i) => i.id === itemId);
    let isWeapon = false;

    // 2. Wenn nicht gefunden, suche in den Waffen
    if (!item) {
      item = state.player.weapons.find((w) => w.id === itemId);
      isWeapon = true;
    }

    // 3. Fallback für Basis-Items (falls noch nicht gecraftet/gefunden)
    if (!item) {
      item = Definitions.items[itemId] || Definitions.weapons[itemId];
      // Check ob es laut Definition eine Waffe ist
      if (
        item &&
        (item.ritualValue !== undefined || Definitions.weapons[itemId])
      ) {
        isWeapon = true;
      }
    }

    if (!item) {
      console.error("Item nicht gefunden:", itemId);
      return;
    }

    if (isWeapon) {
      this.toggleEquipWeapon(item);
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
      // FIX: Übergabe von null als sourceIndex, da der Spieler angreift
      // Signatur ist: executeAttack(source, sourceIndex, skill)
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
    this.log("--- Gegner Zug ---", 'neutral');

    // 1. Gegner Aktionen & Status Effekte
    enemies.forEach((enemy, index) => {
        if (enemy.hp > 0) {
            // DoT auf Gegner anwenden
            const diedFromDot = this.processTurnEffects(enemy, false);
            
            if (diedFromDot) {
                this.log(`${enemy.name} ist an seinen Wunden erlegen!`, "player");
                stateManager.notify(); 
            } else {
                // Nur angreifen, wenn er nicht durch Gift gestorben ist
                this.executeAttack('enemy', index);
            }
        }
    });

    // 2. Prüfen ob Spieler durch die Angriffe gestorben ist
    if (stateManager.getState().player.hp <= 0) {
        this.log("Du wurdest besiegt...", 'enemy');
        stateManager.saveGame(); 
        return; 
    }

    // 3. Status Effekte auf dem Spieler (Start seines Zuges)
    const playerDied = this.processTurnEffects(stateManager.getState().player, true);
    if (playerDied) {
        this.log("Du bist an deinen Wunden erlegen...", 'enemy');
        stateManager.saveGame();
        return; 
    }

    // 4. Spieler ist wieder dran (falls noch Gegner leben)
    const allDead = state.combat.enemies.every(e => e.hp <= 0);
    if (allDead) {
        this.winCombat();
    } else {
        stateManager.resetPlayerAp();
        this.log("Du bist am Zug.", 'neutral');
    }
  }

static executeAttack(source, sourceIndex = null, skill = null) {
    const state = stateManager.getState();
    let attacker, defender, attackerName;

    const accuracy = skill ? skill.accuracy || 1 : 1;

    // Zielermittlung...
    if (source === "player") {
      attacker = state.player;
      const targetIdx = state.combat.targetIndex;
      defender = state.combat.enemies[targetIdx];
      attackerName = "Du";
      if (!defender || defender.hp <= 0) {
        this.log("Dieses Ziel ist bereits besiegt!", "neutral");
        return; 
      }
    } else {
      attacker = state.combat.enemies[sourceIndex];
      defender = state.player;
      attackerName = attacker.name;
    }

    if (Math.random() > accuracy) {
      this.log(`${attackerName} verfehl${source === "player" ? "st" : "t"} das Ziel!`, "neutral");
      if (source === "player") this.checkTurnEnd();
      return;
    }

    // Schaden berechnen
    const attackResult = StatCalculator.calculateAttack(attacker, skill);
    const defenseResult = StatCalculator.calculateDefense(defender, attackResult.damage);
    const finalDamage = defenseResult.damage;

    // Logging
    let logMsg = attackResult.isCrit ? " (KRITISCH!)" : "";
    const verb = source === "player" ? "triffst" : "trifft";
    const actionText = skill ? skill.text : source === "player" ? "greifst an" : "greift an";
    const targetName = source === "player" ? defender.name : "";
    const type = source === "player" ? "player" : "enemy";
    
    this.log(`${attackerName} ${source === "player" ? "" : "(" + actionText + ")"} ${verb} ${targetName} für ${finalDamage} Schaden${logMsg}!`, type);

    // HP Abziehen
    if (source === "player") {
      stateManager.modifyEnemyHp(state.combat.targetIndex, -finalDamage);
    } else {
      stateManager.modifyPlayerHp(-finalDamage);
    }

    // --- NEU: AKTIVE EFFEKTE (On Hit) ANWENDEN ---
    // Passiert nur, wenn man auch Schaden gemacht hat (> 0)
    if (attackResult.activeEffects && attackResult.activeEffects.length > 0 && finalDamage > 0) {
        this.processActiveEffects(attackResult.activeEffects, attacker, defender, finalDamage, source === "player");
    }

    // Runden-Ende & Sieg-Check
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

  // --- NEUE EFFEKT SYSTEM HOOKS ---

  static processActiveEffects(effectIds, attacker, defender, damageDealt, isPlayerSource) {
      effectIds.forEach(effectId => {
          const effectDef = Definitions.effects[effectId];
          if (!effectDef) return;

          // Ist es ein Treffer-Effekt?
          if (effectDef.type === "on_hit") {
              
              // Fall 1: Gegner Status verpassen (z.B. Gift)
              if (effectDef.trigger === "apply_status") {
                  this.applyStatusEffect(defender, effectDef);
              } 
              
              // Fall 2: Sich selbst heilen (z.B. Vampirismus)
              else if (effectDef.trigger === "heal_attacker") {
                  const heal = Math.floor(damageDealt * effectDef.value);
                  if (heal > 0) {
                      if (isPlayerSource) {
                          stateManager.modifyPlayerHp(heal);
                          this.log(`Du heilst dich um ${heal} HP durch ${effectDef.name}!`, "player");
                      } else {
                          attacker.hp += heal;
                          this.log(`${attacker.name} heilt sich um ${heal} HP durch ${effectDef.name}.`, "enemy");
                          stateManager.notify();
                      }
                  }
              }
          }
      });
  }

  static applyStatusEffect(target, effectDef) {
      if (!target.statusEffects) target.statusEffects = [];

      const existing = target.statusEffects.find(e => e.id === effectDef.statusId);
      const name = target.name || "Du";

      if (existing) {
          // Dauer auffrischen
          existing.duration = Math.max(existing.duration, effectDef.duration);
          this.log(`${name}: ${effectDef.name} wurde verlängert!`, "neutral");
      } else {
          // Neuen Status anlegen
          target.statusEffects.push({
              id: effectDef.statusId,
              name: effectDef.name,
              value: effectDef.value,
              duration: effectDef.duration,
              type: effectDef.statusType // z.B. "dot"
          });
          this.log(`${name} leidet nun unter ${effectDef.name}!`, "neutral");
      }
      stateManager.notify();
  }

  // Wird aufgerufen um DoT Schaden (Gift, Brennen) abzuwickeln
  static processTurnEffects(entity, isPlayer) {
      if (!entity.statusEffects || entity.statusEffects.length === 0) return false;
      
      let died = false;

      // Rückwärts loopen, damit wir sicher löschen können
      for (let i = entity.statusEffects.length - 1; i >= 0; i--) {
          const effect = entity.statusEffects[i];

          // Damage over Time
          if (effect.type === "dot") {
              if (isPlayer) {
                  stateManager.modifyPlayerHp(-effect.value);
              } else {
                  entity.hp -= effect.value;
              }
              const name = isPlayer ? "Du erleidest" : `${entity.name} erleidet`;
              this.log(`${name} ${effect.value} Schaden durch ${effect.name}.`, "neutral");
          }

          // Dauer abziehen
          effect.duration--;
          if (effect.duration <= 0) {
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

    this.log("Alle Gegner besiegt!", "player");

    // 1. XP berechnen (Summe aller Gegner)
    let totalXp = 0;
    enemies.forEach((enemy) => {
      totalXp += enemy.xp || 0;
    });

    if (totalXp > 0) {
      stateManager.addXp(totalXp);
      this.log(`+${totalXp} Erfahrung erhalten.`, "neutral");
    }

    // 2. Loot für JEDEN Gegner berechnen
    enemies.forEach((enemy) => {
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
