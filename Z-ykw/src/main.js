// src/main.js
import { stateManager } from "./engine/StateManager.js";
import { ActionEngine } from "./engine/ActionEngine.js";
import { CrawlEngine } from "./engine/CrawlEngine.js";
import { HUD } from "./ui/HUD.js";
import { BattleUI } from "./ui/BattleUI.js";
import { CrawlUI } from "./ui/CrawlUI.js";
import { HideoutUI } from "./ui/HideoutUI.js";
import { InventoryUI } from "./ui/InventoryUI.js";
import { StatsUI } from "./ui/StatsUI.js";
import { windowManager } from "./ui/WindowManager.js";
import { Definitions } from "./data/definitions.js";

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

  openAbilitySelection: (slotIndex) => {
    // Merkt sich temporär, auf welchen Slot wir geklickt haben
    window.currentSkillSlot = slotIndex;
    window.gameAPI.switchHideoutScreen("ability_selection");
  },

  equipSkill: (skillId) => {
    stateManager.equipSkill(window.currentSkillSlot, skillId);
    window.gameAPI.switchHideoutScreen("equipment");
  },

  unequipSkill: (slotIndex) => {
    stateManager.unequipSkill(slotIndex);
    window.gameAPI.switchHideoutScreen("equipment");
  },

  addToRitual: (itemId) => {
    const success = stateManager.addItemToRitual(itemId);
    if (!success) {
      console.log("Kann nicht hinzufügen (Voll oder nicht gefunden)");
    }
  },

  removeFromRitual: (index) => {
    stateManager.removeItemFromRitual(index);
  },

  doRitual: () => {
    const result = stateManager.performRitual();
    if (result) {
      // Erfolg!
      ActionEngine.log(
        `RITUAL VOLLENDET: ${result.name} geschmiedet!`,
        "player",
      );

      window.gameAPI.switchHideoutScreen("equipment");
    } else {
      ActionEngine.log("Das Ritual benötigt genau 6 Zutaten.", "neutral");
    }
  },

  equipWeapon: (weaponId) => {
    stateManager.equipWeapon(weaponId);
    // Nach dem Ausrüsten direkt zurück zur Übersicht springen:
    window.gameAPI.switchHideoutScreen("equipment");
  },

  unequipWeapon: () => {
    stateManager.unequipWeapon();
    window.gameAPI.switchHideoutScreen("equipment");
  },

  addItem: (itemId) => {
    stateManager.addItem(itemId);
  },

  reset: () => {
    if (confirm("Spielstand wirklich löschen?")) stateManager.resetGame();
  },

  selectShopItem: (side, index) => {
    // Speichert im UI-Modul, was gerade angeklickt ist
    window.hideoutInstance.shopSelection = { side, index, qty: 1 };
    stateManager.notify(); // UI neu zeichnen
  },

  changeShopQty: (baseDelta, event) => {
    let multiplier = 1;

    if (event) {
      if (event.ctrlKey) multiplier = 10;
      else if (event.shiftKey) multiplier = 5;
    }

    window.hideoutInstance.shopSelection.qty += baseDelta * multiplier;
    stateManager.notify();
  },

  sellItem: (type, originalIndex, totalPrice, qty) => {
    if (type === "inventory") {
      const item = stateManager.state.player.inventory[originalIndex];
      // KORREKTUR: Abziehen, wenn wir MEHR haben, als wir gerade verkaufen wollen
      if (item && item.quantity > qty) {
        item.quantity -= qty;
      } else {
        stateManager.state.player.inventory.splice(originalIndex, 1);
        // Zurücksetzen der Auswahl, damit das nächste Item angewählt wird
        window.hideoutInstance.shopSelection = {
          side: "sell",
          index: 0,
          qty: 1,
        };
      }
    } else if (type === "weapon") {
      stateManager.state.player.weapons.splice(originalIndex, 1);
      window.hideoutInstance.shopSelection = { side: "sell", index: 0, qty: 1 };
    }

    stateManager.modifyGold(totalPrice);
    window.gameAPI.switchHideoutScreen("shop");
  },

  buyItem: (itemId, totalPrice, type, qty) => {
    if (stateManager.state.player.gold >= totalPrice) {
      stateManager.modifyGold(-totalPrice);

      if (type === "weapon") {
        const weaponDef = Definitions.weapons[itemId];
        for (let i = 0; i < qty; i++) {
          stateManager.state.player.weapons.push({
            ...weaponDef,
            id: `${itemId}_${Date.now()}_${i}`,
          });
        }
        stateManager.saveGame();
        stateManager.notify();
      } else {
        for (let i = 0; i < qty; i++) {
          stateManager.addItem(itemId);
        }
      }

      ActionEngine.log(
        `Gekauft: ${qty}x ${Definitions.items[itemId]?.name || Definitions.weapons[itemId]?.name}`,
        "neutral",
      );
      window.hideoutInstance.shopSelection.qty = 1; // Menge zurücksetzen
      window.gameAPI.switchHideoutScreen("shop");
    }
  },
  cheatGold: (amount) => {
    stateManager.modifyGold(amount);
    console.log(`${amount} Gold herbeigezaubert!`);
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
