import { ConfirmUI } from "./ui/ConfirmUI.js";
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
import { ResultUI } from "./ui/ResultUI.js";

console.log("RPG Engine v2.0.1 starting...");

// --- GLOBAL API ---
window.gameAPI = {
  useItem: (itemId) => {
    ActionEngine.useItem(itemId);
  },

  startAdventure: () => {
    window.gameAPI.switchHideoutScreen("world_selection");
  },

  startWorldCrawl: (worldId) => {
    stateManager.enterDungeon();
    CrawlEngine.startExploration(worldId);
  },

  selectWorld: (worldId) => {
    window.hideoutInstance.selectedWorldId = worldId;
    window.gameAPI.switchHideoutScreen("world_confirm");
  },

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
      const win = document.getElementById("inventory-window");
      const isVisible = win.style.display !== "none";
      localStorage.setItem("pref_inventory_visible", isVisible);
    }
  },

  toggleStats: () => {
    if (window.statsWindow) {
      window.statsWindow.toggle();
      const win = document.getElementById("stats-window");
      const isVisible = win.style.display !== "none";
      localStorage.setItem("pref_stats_visible", isVisible);
    }
  },

  openAbilitySelection: (slotIndex) => {
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

  selectChoice: (index) => {
    CrawlEngine.resolveChoice(index);
  },

  investToken: (stat) => {
    stateManager.investToken(stat);
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
      let effectText = `<span style="color: #888; font-size: 0.9em; font-style: italic;">Kein besonderer Zusatzeffekt</span>`;

      if (result.effects && result.effects.length > 0) {
        const effectId = result.effects[0];
        const effectDef = Definitions.effects[effectId];

        if (effectDef) {
          effectText = `<span style="color: #ff9a8a; font-size: 1em;">Effekt: <strong>${effectDef.name}</strong></span>`;
        }
      }

      const messages = [
        `Waffe erschaffen: <strong style="color: var(--accent-color); font-size: 1.2em;">${result.name}</strong>`,
        effectText,
      ];

      stateManager.setResult("Ritual Vollendet!", messages, "ritual");
    } else {
      ActionEngine.log("Das Ritual benötigt genau 6 Zutaten.", "neutral");
    }
  },

  clearRitual: () => {
    stateManager.clearRitual();
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

  closeResult: () => {
    const context = stateManager.clearResult();

    if (context === "story_exit") {
      stateManager.endCrawl();
      stateManager.returnToHideout();
      window.gameAPI.switchHideoutScreen("main");
    } else if (context === "combat_win") {
      stateManager.endCombat();
      CrawlEngine.generateOptions();
    } else if (context === "combat_loss") {
      stateManager.state.player.hp = stateManager.state.player.maxHp;
      stateManager.endCombat();
      stateManager.endCrawl();
      stateManager.returnToHideout();
      window.gameAPI.switchHideoutScreen("main");
    } else if (context === "boss_win") {
      stateManager.endCombat();
      stateManager.endCrawl();
      stateManager.returnToHideout();
      window.gameAPI.switchHideoutScreen("main");
    } else if (context === "ritual") {
      window.gameAPI.switchHideoutScreen("ritual");
    } else if (context === "crawl_event") {
      CrawlEngine.generateOptions();
    }
  },

  selectShopItem: (side, index) => {
    window.hideoutInstance.shopSelection = { side, index, qty: 1 };
    stateManager.notify();
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
    // 1. Merke dir den aktuell ausgewählten Index
    const currentShopIndex = window.hideoutInstance.shopSelection.index;

    // 2. Item abziehen
    if (type === "inventory") {
      const item = stateManager.state.player.inventory[originalIndex];
      if (item && item.quantity > qty) {
        item.quantity -= qty;
      } else {
        stateManager.state.player.inventory.splice(originalIndex, 1);
      }
    } else if (type === "weapon") {
      stateManager.state.player.weapons.splice(originalIndex, 1);
    }

    stateManager.modifyGold(totalPrice);

    // 3. NEU: Wir beenden den Verkauf, behalten aber den Index bei!
    window.hideoutInstance.shopSelection = {
      side: "sell",
      index: currentShopIndex, // Bleibt genau da, wo er war
      qty: 1, // Stückzahl für das nächste Item wieder auf 1 resetten
    };

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
      window.hideoutInstance.shopSelection.qty = 1;
      window.gameAPI.switchHideoutScreen("shop");
    }
  },

useCombatItem: (event, itemId, itemName) => {
    if (event.shiftKey) {
      ActionEngine.useItem(itemId);
    } else {
      // API ändert nur den State! Die UI macht den Rest.
      stateManager.requestConfirm("use_item", { id: itemId, name: itemName });
    }
  },

  resolveConfirm: (accepted) => {
    const req = stateManager.getState().confirm;
    // Wenn "Nutzen" geklickt wurde, führen wir die Aktion aus
    if (req && req.type === "use_item" && accepted) {
      ActionEngine.useItem(req.data.id);
    }
    // Danach so oder so das Fenster über den State schließen
    stateManager.clearConfirm();
  },

  cheatXp: (amount) => {
    stateManager.addXp(amount);
    console.log(`${amount} XP herbeigezaubert!`);
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
  new ResultUI();
  new ConfirmUI();

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
    entry.innerHTML = e.detail.message;
    logContainer.appendChild(entry);
    logContainer.scrollTop = logContainer.scrollHeight;
  }
});
