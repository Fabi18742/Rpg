// src/engine/CrawlEngine.js
import { stateManager } from "./StateManager.js";
import { ActionEngine } from "./ActionEngine.js";
import { Definitions } from "../data/definitions.js";

export class CrawlEngine {
  static startExploration(worldId) {
    stateManager.startCrawl(worldId);
    this.generateOptions();
  }

  static generateOptions() {
    const state = stateManager.getState();
    if (!state.crawl.active) return;

    const worldDef = Definitions.worlds[state.crawl.worldId];

    // --- 1. SICHERHEITS-CHECK (Garantiert bei exakt 0) ---
    if (state.crawl.security <= 0) {
      if (worldDef.type !== "story") {
        const bossId = worldDef.bossId;
        ActionEngine.log(
          `Die Sicherheit ist auf 0 gefallen... ${Definitions.enemies[bossId].name} erscheint!`,
          "enemy",
        );
        ActionEngine.startCombat([bossId], true);
      } else {
        ActionEngine.log(
          "Die Sicherheit ist auf 0 gefallen... Du musstest fliehen!",
          "enemy",
        );
        CrawlEngine.processDungeonFail(state);
      }
      return;
    }

    // --- 2. ALTERNIERENDE GEFAHRENZONEN (Safe -> Gefahr -> Safe) ---
    if (worldDef.type !== "story") {
      const maxSec = worldDef.baseSecurity;
      const curSec = state.crawl.security;

      const secPercent = (curSec / maxSec) * 100;
      let spawnChance = 0;

      // Dein alternierendes System mit exponentiellen Gefahrenzonen
      if (secPercent <= 10) {
        spawnChance = 0.75; // 10% - 1%: Letzte Gefahrenzone (75%)
      } else if (secPercent <= 20) {
        spawnChance = 0.0; // 20% - 11%: SAFE ZONE
      } else if (secPercent <= 30) {
        spawnChance = 0.4; // 30% - 21%: Gefahrenzone (40%)
      } else if (secPercent <= 40) {
        spawnChance = 0.0; // 40% - 31%: SAFE ZONE
      } else if (secPercent <= 50) {
        spawnChance = 0.2; // 50% - 41%: Gefahrenzone (20%)
      } else if (secPercent <= 60) {
        spawnChance = 0.0; // 60% - 51%: SAFE ZONE
      } else if (secPercent <= 70) {
        spawnChance = 0.08; // 70% - 61%: Gefahrenzone (8%)
      } else if (secPercent <= 80) {
        spawnChance = 0.0; // 80% - 71%: SAFE ZONE
      } else if (secPercent <= 90) {
        spawnChance = 0.02; // 90% - 81%: Erste Gefahrenzone (2%)
      } else {
        spawnChance = 0.0; // 100% - 91%: SAFE ZONE
      }

      // Zufalls-Check gegen die berechnete Chance
      if (spawnChance > 0 && Math.random() < spawnChance) {
        const bossId = worldDef.bossId;
        ActionEngine.log(
          `Du warst zu laut... ${Definitions.enemies[bossId].name} hat dich aufgespürt!`,
          "enemy",
        );
        ActionEngine.startCombat([bossId], true);
        return;
      }
    }

    // --- 3. CHAOS-FILTER ---
    const currentChaos = state.crawl.chaos || 0;

    const validPoolIds = state.crawl.eventPool.filter((eventId) => {
      const eventDef = Definitions.events[eventId];
      if (!eventDef) return false;

      const min = eventDef.minChaos || 0;
      const max =
        eventDef.maxChaos !== undefined ? eventDef.maxChaos : Infinity;

      return currentChaos >= min && currentChaos <= max;
    });

    // --- 4. KARTEN ZIEHEN ---
    const shuffled = [...validPoolIds].sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, 3);
    const choices = selectedIds.map((id) => Definitions.events[id]);

    stateManager.setCrawlChoices(choices);
  }

  static processDungeonFail(state) {
    // Sicherstellen, dass das Auslesen nicht abstürzt, falls das Array mal leer ist
    const loot = state.crawl.lootTrack || { xp: 0, gold: 0, items: [] };

    const exitMessages = [
      `<div style="font-size: 1.1em; margin-bottom: 20px; color: #ff6b6b;">Es wurde zu gefährlich! Du musstest dich zurückziehen.</div>`,
      `<div style="border-top: 1px solid #444; margin-bottom: 10px;"></div>`,
    ];

    if (loot.xp > 0) {
      exitMessages.push(
        `<span style="color: #a855f7;">Erfahrung: +${loot.xp} XP</span>`,
      );
    }
    if (loot.gold > 0) {
      exitMessages.push(
        `<span style="color: #fbbf24;">Gold: +${loot.gold} G</span>`,
      );
    }

    if (loot.items && loot.items.length > 0) {
      loot.items.forEach((i) => {
        const def = Definitions.items[i.id] || Definitions.weapons[i.id];
        exitMessages.push(
          `<span style="color: #fff;">${i.amount}x ${def ? def.name : i.id}</span>`,
        );
      });
    }

    // Löst garantiert den Result-Screen aus
    stateManager.setResult("RÜCKZUG", exitMessages, "story_exit");
  }

  static selectOption(index) {
    const state = stateManager.getState();
    const choices = state.crawl.choices;

    if (!choices || !choices[index]) return;

    const eventDef = choices[index];
    stateManager.clearCrawlChoices();

    stateManager.updateCrawlStats(-(eventDef.securityCost || 0), 1);

    this.handleEvent(eventDef);
  }

  static handleEvent(eventDef) {
    let isStoryChoice = false;
    if (eventDef.type === "choice" && eventDef.choices) {
      isStoryChoice = eventDef.choices.some(
        (c) => c.nextEvent || c.effect === "exit",
      );
    }

    const isStoryCombat = eventDef.type === "combat" && eventDef.onWinEvent;

    if (isStoryChoice || isStoryCombat) {
      stateManager.removeEventFromPool(eventDef.id);
    }

    if (eventDef.type === "combat") {
      ActionEngine.log(eventDef.text, "neutral");
      let enemyList =
        eventDef.enemies || (eventDef.enemyId ? [eventDef.enemyId] : []);

      ActionEngine.startCombat(enemyList, false, eventDef.onWinEvent);
    } else if (eventDef.type === "choice") {
      ActionEngine.log(`Event: ${eventDef.name}`, "neutral");
      stateManager.setActiveEvent(eventDef);
    }
  }

  static resolveChoice(choiceIndex) {
    const state = stateManager.getState();
    const event = state.crawl.activeEvent;
    if (!event || !event.choices || !event.choices[choiceIndex]) return;

    const choice = event.choices[choiceIndex];
    const messages = [];

    stateManager.clearActiveEvent();

    // EXIT LOGIK
    if (choice.effect === "exit") {
      this.processDungeonExit(state);
      return;
    }

    if (choice.nextEvent) {
      stateManager.addEventToPool(choice.nextEvent);
    }

    if (choice.effect === "none") {
      messages.push("Du setzt deinen Weg fort.");
    } else {
      const parts = choice.effect.split("_");
      const effectType = parts[0];
      const amount = parseInt(parts[1]) || 0;

      if (effectType === "heal") {
        stateManager.modifyPlayerHp(amount);
        messages.push(
          `<span style="color: #22c55e; font-weight: bold;">+${amount} HP geheilt</span>`,
        );
      } else if (effectType === "damage") {
        stateManager.modifyPlayerHp(-amount);
        messages.push(
          `<span style="color: #ff6b6b; font-weight: bold;">-${amount} HP verloren</span>`,
        );
      } else if (effectType === "loot") {
        const itemId = choice.effect.replace("loot_", "");
        stateManager.addItem(itemId);
        const itemDef =
          Definitions.items[itemId] || Definitions.weapons[itemId];
        const itemName = itemDef ? itemDef.name : itemId;

        messages.push(
          `<span style="color: #fbbf24;">Item gefunden: <strong>${itemName}</strong></span>`,
        );
      }
    }

    stateManager.setResult(event.name, messages, "crawl_event");
  }

  static processDungeonExit(state) {
    const loot = state.crawl.lootTrack;
    const exitMessages = [
      `<div style="font-size: 1.1em; margin-bottom: 20px;">Du hast den Dungeon verlassen und deine Beute gesichert!</div>`,
      `<div style="border-top: 1px solid #444; margin-bottom: 10px;"></div>`,
    ];

    if (loot.xp > 0)
      exitMessages.push(
        `<span style="color: #a855f7;">Erfahrung: +${loot.xp} XP</span>`,
      );
    if (loot.gold > 0)
      exitMessages.push(
        `<span style="color: #fbbf24;">Gold: +${loot.gold} G</span>`,
      );
    loot.items.forEach((i) => {
      const def = Definitions.items[i.id] || Definitions.weapons[i.id];
      exitMessages.push(
        `<span style="color: #fff;">${i.amount}x ${def ? def.name : i.id}</span>`,
      );
    });

    stateManager.setResult("ENTKOMMEN", exitMessages, "story_exit");
  }

  static processDungeonFail(state) {
    const loot = state.crawl.lootTrack;
    const exitMessages = [
      `<div style="font-size: 1.1em; margin-bottom: 20px; color: #ff6b6b;">Es wurde zu gefährlich! Du musstest dich zurückziehen.</div>`,
      `<div style="border-top: 1px solid #444; margin-bottom: 10px;"></div>`,
    ];

    if (loot.xp > 0)
      exitMessages.push(
        `<span style="color: #a855f7;">Erfahrung: +${loot.xp} XP</span>`,
      );
    if (loot.gold > 0)
      exitMessages.push(
        `<span style="color: #fbbf24;">Gold: +${loot.gold} G</span>`,
      );

    loot.items.forEach((i) => {
      const def = Definitions.items[i.id] || Definitions.weapons[i.id];
      exitMessages.push(
        `<span style="color: #fff;">${i.amount}x ${def ? def.name : i.id}</span>`,
      );
    });

    stateManager.setResult("RÜCKZUG", exitMessages, "story_exit");
  }
}
