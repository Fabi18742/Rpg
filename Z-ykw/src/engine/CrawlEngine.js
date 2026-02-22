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

    // --- 1. SICHERHEITS-CHECK (Gilt nur für normale Dungeons!) ---
    if (worldDef.type !== "story" && state.crawl.security <= 0) {
      const bossId = worldDef.bossId;
      ActionEngine.log(
        `Die Sicherheit ist auf 0 gefallen... ${Definitions.enemies[bossId].name} erscheint!`,
        "enemy",
      );
      ActionEngine.startCombat([bossId], true);
      return;
    }

    // --- NEU: STORY-WELTEN ÜBERSPRINGEN DEN KARTEN-SCREEN ---
    if (worldDef.type === "story") {
      if (state.crawl.eventPool.length > 0) {
        // Nimm immer das nächste geplante Event aus dem Pool
        const nextEventId = state.crawl.eventPool[0];
        const eventDef = Definitions.events[nextEventId];
        if (eventDef) {
          this.handleEvent(eventDef);
          return; // WICHTIG: Hier abbrechen, keine Karten generieren!
        }
      }

      // Wenn der Pool leer ist (die Story ist zu Ende), verlässt der Spieler den Dungeon automatisch
      this.processDungeonExit(state);
      return;
    }

    // --- 2. ALTERNIERENDE GEFAHRENZONEN (Für normale Dungeons) ---
    const maxSec = worldDef.baseSecurity;
    const curSec = state.crawl.security;

    const secPercent = (curSec / maxSec) * 100;
    let spawnChance = 0;

    if (secPercent <= 10) {
      spawnChance = 0.75;
    } else if (secPercent <= 20) {
      spawnChance = 0.0;
    } else if (secPercent <= 30) {
      spawnChance = 0.4;
    } else if (secPercent <= 40) {
      spawnChance = 0.0;
    } else if (secPercent <= 50) {
      spawnChance = 0.2;
    } else if (secPercent <= 60) {
      spawnChance = 0.0;
    } else if (secPercent <= 70) {
      spawnChance = 0.08;
    } else if (secPercent <= 80) {
      spawnChance = 0.0;
    } else if (secPercent <= 90) {
      spawnChance = 0.02;
    } else {
      spawnChance = 0.0;
    }

    if (spawnChance > 0 && Math.random() < spawnChance) {
      const bossId = worldDef.bossId;
      ActionEngine.log(
        `Du warst zu laut... ${Definitions.enemies[bossId].name} hat dich aufgespürt!`,
        "enemy",
      );
      ActionEngine.startCombat([bossId], true);
      return;
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

    if (choice.effect === "exit") {
      this.processDungeonExit(state);
      return;
    }

    const worldDef = Definitions.worlds[state.crawl.worldId];
    const isStory = worldDef && worldDef.type === "story";

    // Das nächste Event vorbereiten
    if (choice.nextEvent) {
      if (isStory) {
        // In der Story überschreibt die Wahl den Pool (es gibt ja nur diesen einen Weg)
        state.crawl.eventPool = [choice.nextEvent];
      } else {
        stateManager.addEventToPool(choice.nextEvent);
      }
    } else if (isStory) {
      // Wenn in einer Story kein nächstes Event definiert ist, leeren wir den Pool (Story Ende)
      state.crawl.eventPool = [];
    }

    // Effekte verarbeiten (Heilung, Schaden, Loot)
    if (choice.effect && choice.effect !== "none") {
      const parts = choice.effect.split("_");
      const effectType = parts[0];
      const amount = parseInt(parts[1]) || 0;

      if (effectType === "death") {
        stateManager.modifyPlayerHp(-state.player.maxHp); 
        
        const deathMessages = [
          `<span style="color: #ff4444; font-weight: bold; font-size: 1.2em;">Du bist in eine tödliche Falle getappt!</span>`,
          `Dein Abenteuer endet hier...`
        ];
        
        stateManager.setResult("DU BIST GESTORBEN", deathMessages, "combat_loss");
        return;
      } 
      else if (effectType === "heal") {
        stateManager.modifyPlayerHp(amount);
        messages.push(`<span style="color: #22c55e; font-weight: bold;">+${amount} HP geheilt</span>`);
      } else if (effectType === "damage") {
        stateManager.modifyPlayerHp(-amount);
        messages.push(`<span style="color: #ff6b6b; font-weight: bold;">-${amount} HP verloren</span>`);
      } else if (effectType === "loot") {
        const itemId = choice.effect.replace("loot_", "");
        stateManager.addItem(itemId);
        const itemDef = Definitions.items[itemId] || Definitions.weapons[itemId];
        const itemName = itemDef ? itemDef.name : itemId;
        messages.push(`<span style="color: #fbbf24;">Item gefunden: <strong>${itemName}</strong></span>`);
      }
    }

    if (isStory) {
      if (messages.length > 0) {
        stateManager.setResult(event.name, messages, "crawl_event");
      } else {
        this.generateOptions();
      }
    } else {
      if (messages.length === 0) {
        messages.push("Du setzt deinen Weg fort.");
      }
      stateManager.setResult(event.name, messages, "crawl_event");
    }
  }

  static processDungeonExit(state) {
    const worldDef = Definitions.worlds[state.crawl.worldId];
    const isStory = worldDef && worldDef.type === "story";

    if (isStory) {
      const exitMessages = [
        `<div style="font-size: 1.2em; margin-bottom: 20px; color: var(--accent-color); font-style: italic;">Du hast dieses Kapitel deiner Reise abgeschlossen.</div>`,
      ];
      stateManager.setResult("GESCHICHTE BEENDET", exitMessages, "story_exit");
      return;
    }

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
