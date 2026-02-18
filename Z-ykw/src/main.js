// src/main.js
import { stateManager } from "./engine/StateManager.js";
import { ActionEngine } from "./engine/ActionEngine.js";
import { CrawlEngine } from "./engine/CrawlEngine.js";
import { HUD } from "./ui/HUD.js";
import { BattleUI } from "./ui/BattleUI.js";
import { CrawlUI } from "./ui/CrawlUI.js";
import { HideoutUI } from "./ui/HideoutUI.js";
import { InventoryUI } from "./ui/InventoryUI.js"; // Für das draggable Inventar im Kampf
import { StatsUI } from "./ui/StatsUI.js"; // Für die draggable Stats im Kampf
import { windowManager } from "./ui/WindowManager.js";

console.log("RPG Engine v2.0 starting...");

// --- GLOBAL API ---
window.gameAPI = {
  // Allgemein
  useItem: (itemId) => {
    ActionEngine.useItem(itemId);
  },

  // --- HIDEOUT BEFEHLE ---
  // Die Navigation (switchHideoutScreen) wird jetzt direkt in HideoutUI.js registriert.

  startAdventure: () => {
    console.log("🌲 Aufbrechen in den Wald...");
    stateManager.enterDungeon();
    CrawlEngine.startExploration("forest");
  },

  // --- CRAWL / KAMPF BEFEHLE ---
  _internalSelectOption: (index) => {
    CrawlEngine.selectOption(index);
  },

  searchEnemy: () => {
    CrawlEngine.generateOptions();
  },

  useSkill: (skillId) => {
    ActionEngine.useSkill(skillId);
  },

  setTarget: (index) => {
    stateManager.setTarget(index);
  },

  toggleInventory: () => {
    if (window.inventoryWindow) {
      window.inventoryWindow.toggle();
      // Speichere den neuen Zustand
      const win = document.getElementById("inventory-window");
      const isVisible = win.style.display !== "none";
      localStorage.setItem("pref_inventory_visible", isVisible);
    }
  },
  toggleStats: () => {
    if (window.statsWindow) {
      window.statsWindow.toggle();
      // Speichere den neuen Zustand
      const win = document.getElementById("stats-window");
      const isVisible = win.style.display !== "none";
      localStorage.setItem("pref_stats_visible", isVisible);
    }
  },

  reset: () => {
    if (confirm("Spielstand wirklich löschen?")) stateManager.resetGame();
  },
};

// --- INIT ---
try {
  stateManager.init();

  // 1. Permanentes HUD initialisieren
  const hud = new HUD("ui-hud");
  hud.init();

  // 2. Statische Haupt-Ebenen in der Action-Area vorbereiten
  const controlsArea = document.getElementById("controls");
  controlsArea.innerHTML = "";

  const hideoutDiv = document.createElement("div");
  hideoutDiv.id = "ui-hideout";
  controlsArea.appendChild(hideoutDiv);

  const battleDiv = document.createElement("div");
  battleDiv.id = "ui-battle";
  controlsArea.appendChild(battleDiv);

  const crawlDiv = document.createElement("div");
  crawlDiv.id = "ui-crawl";
  controlsArea.appendChild(crawlDiv);

  // 3. UI-Instanzen für statische Screens erstellen
  window.hideoutInstance = new HideoutUI("ui-hideout");
  new BattleUI("ui-battle");
  new CrawlUI("ui-crawl");

  // 4. Floating Windows für den Kampf erstellen (starten versteckt)
  // Diese sind getrennt von den festen Hideout-Screens!
  window.inventoryWindow = new InventoryUI();
  window.statsWindow = new StatsUI();

  // 5. Log-Fenster beim WindowManager registrieren
  const logWindow = document.getElementById("log-window");
  if (logWindow) windowManager.addWindow(logWindow, "log-window");
} catch (err) {
  console.error("FEHLER BEIM START:", err);
}

// Globaler Event-Listener für das Kampfprotokoll
window.addEventListener("combat-log", (e) => {
  const logContainer = document.getElementById("combat-log");
  if (logContainer) {
    const entry = document.createElement("div");
    entry.className = `log-entry ${e.detail.type}`;
    entry.innerText = e.detail.message;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }
});
