// src/main.js
import { stateManager } from "./engine/StateManager.js";
import { ActionEngine } from "./engine/ActionEngine.js"; // WICHTIG: Die Logik importieren
import { HUD } from "./ui/HUD.js";
import { InventoryUI } from "./ui/InventoryUI.js";
import { BattleUI } from "./ui/BattleUI.js";
import { windowManager } from "./ui/WindowManager.js";

console.log("RPG Engine v2.0 starting...");

// --- GLOBAL API (Die Fernbedienung für die HTML Buttons) ---
window.gameAPI = {
  // Inventar: Item nutzen
  useItem: (itemId) => {
    console.log(`Versuche Item zu nutzen: ${itemId}`);
    stateManager.equipItem(itemId);
  },
  // Inventar: Fenster auf/zu
  toggleInventory: () => {
    if (window.inventoryInstance) window.inventoryInstance.toggle();
  },

  // --- KAMPF BEFEHLE (Diese fehlten!) ---

  // Klick auf "Gegner suchen"
  searchEnemy: () => {
    console.log("🔍 Button geklickt: Suche Gegner...");
    ActionEngine.startCombat("goblin");
  },

  // Klick auf "Angriff"
  attack: () => {
    ActionEngine.playerAttack();
  },
  reset: () => {
    if (confirm("Spielstand wirklich löschen?")) {
      stateManager.resetGame();
    }
  },
};

// UI Button für Inventar (unten rechts)
const menubar = document.createElement("div");
menubar.className = "menubar";
menubar.innerHTML = `
    <button onclick="window.gameAPI.toggleInventory()" style="padding: 10px; background: #333; color: white; border: 1px solid #666; cursor: pointer;">
        Inventar
    </button>
`;
document.body.appendChild(menubar);

// --- LOGGING HELPER ---
function logToScreen(message, type = "neutral") {
  const logContainer = document.getElementById("combat-log");
  if (logContainer) {
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.innerText = message;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

// --- INIT ---
try {
  // 1. Module initialisieren
  stateManager.init();
  const hud = new HUD("ui-hud");
  hud.init();

  const invUI = new InventoryUI();
  window.inventoryInstance = invUI; // Global speichern für den Toggle

  // Battle UI malt nur die Buttons, die Logik liegt jetzt oben in window.gameAPI
  const battleUI = new BattleUI("controls");

  // Fenstermanager für das Log
  const logWindow = document.getElementById("log-window");
  if (logWindow) windowManager.addWindow(logWindow, "log-window");

  logToScreen("Bereit. Klicke auf 'Gegner suchen'!", "neutral");
} catch (err) {
  console.error("FEHLER BEIM START:", err);
}

// Event Listener für Logs aus der ActionEngine
window.addEventListener("combat-log", (e) => {
  logToScreen(e.detail.message, e.detail.type);
});
