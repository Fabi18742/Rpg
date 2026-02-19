// src/engine/CrawlEngine.js
import { stateManager } from "./StateManager.js";
import { ActionEngine } from "./ActionEngine.js";
import { Definitions } from "../data/definitions.js";

export class CrawlEngine {
  static startExploration(worldId) {
    stateManager.startCrawl(worldId);
    this.generateOptions(); // Sofort Optionen generieren
  }

  // Zieht 3 zufällige Events und zeigt sie an
  static generateOptions() {
    const state = stateManager.getState();
    if (!state.crawl.active) return;

    if (state.crawl.security <= 0) {
      const worldDef = Definitions.worlds[state.crawl.worldId];
      const bossId = worldDef.bossId;

      ActionEngine.log(
        `Die Sicherheit ist auf 0 gefallen... ${Definitions.enemies[bossId].name} erscheint!`,
        "enemy",
      );

      ActionEngine.startCombat([bossId], true);
      return;
    }

    const world = Definitions.worlds[state.crawl.worldId];
    const pool = world.events;

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, 3);

    const choices = selectedIds.map((id) => Definitions.events[id]);

    stateManager.setCrawlChoices(choices);
  }

  // Wird vom UI aufgerufen, wenn der Spieler eine Karte klickt
  static selectOption(index) {
    const state = stateManager.getState();
    const choices = state.crawl.choices;

    if (!choices || !choices[index]) return;

    const eventDef = choices[index];

    // 1. Auswahl löschen (UI cleanen)
    stateManager.clearCrawlChoices();

    // 2. Kosten abziehen & Chaos erhöhen
    stateManager.updateCrawlStats(-(eventDef.securityCost || 0), 1);

    // 3. Event ausführen
    this.handleEvent(eventDef);
  }

  static handleEvent(eventDef) {
    if (eventDef.type === "combat") {
      ActionEngine.log(eventDef.text, "neutral");

      let enemyList = [];

      if (eventDef.enemies) {
        enemyList = eventDef.enemies;
      } else if (eventDef.enemyId) {
        enemyList = [eventDef.enemyId];
      }

      ActionEngine.startCombat(enemyList);
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

    if (choice.effect === "none") {
      messages.push("Du setzt deinen Weg fort, ohne dass etwas passiert.");
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
      }
    }

    stateManager.setResult(event.name, messages, "crawl_event");
  }
}
