// src/engine/StateManager.js
import { Definitions } from "../data/definitions.js";
import { Storage } from "./Storage.js";

const SAVE_KEY = "rpg_savegame_v1";

class StateManager {
  constructor() {
    this.state = {
      location: "hideout",
      player: {
        hp: 0,
        maxHp: 0,
        xp: 0,
        level: 1,
        stats: {},
        inventory: [],
        equipped: { weapon: null, armor: null },
        skills: ["normal_attack", "heavy_strike", "quick_heal"],
      },
      currentEnemy: null,
      crawl: {
        active: false,
        worldId: null,
        security: 0,
        chaos: 0,
        choices: null,
      },
    };
    this.listeners = [];
  }

  init() {
    console.log("StateManager: Lade Daten...");
    const loadedState = Storage.load(SAVE_KEY);

    if (loadedState) {
      console.log("📂 Spielstand gefunden & geladen.");
      this.state = loadedState;
      this.state.location = "hideout";
      this.state.currentEnemy = null;
      this.state.crawl.active = false;
    } else {
      console.log("✨ Kein Spielstand. Neues Spiel gestartet.");
      this.state.player.maxHp = Definitions.player.baseHp;
      this.state.player.hp = Definitions.player.baseHp;
      this.state.player.stats = { ...Definitions.player.baseStats };

      // Start-Items nur beim allerersten Start
      this.addItem("rusty_sword");
      this.addItem("potion_small");

      this.state.location = "hideout";
    }

    this.notify();
  }

  enterDungeon() {
    this.state.location = "dungeon";
    this.notify();
  }

  returnToHideout() {
    this.state.location = "hideout";
    this.state.currentEnemy = null;
    this.state.crawl.active = false;
    this.state.crawl.choices = null;

    // Im Hideout heilen? Optional.
    // this.state.player.hp = this.state.player.maxHp;

    this.notify();
    this.saveGame();
  }

  // --- Persistence ---
  saveGame() {
    Storage.save(SAVE_KEY, this.state);
  }

  resetGame() {
    Storage.clear(SAVE_KEY);
    location.reload();
  }
  // -------------------

  setEnemy(enemy) {
    this.state.currentEnemy = enemy;
    this.notify();
  }

  modifyEnemyHp(amount) {
    if (!this.state.currentEnemy) return;
    this.state.currentEnemy.hp += amount;
    if (this.state.currentEnemy.hp < 0) this.state.currentEnemy.hp = 0;
    this.notify();
  }

  addItem(itemId) {
    const itemDef = Definitions.items[itemId];
    if (itemDef) {
      this.state.player.inventory.push({ ...itemDef });
      this.notify();
      this.saveGame();
    }
  }

  removeItem(itemId) {
    const inventory = this.state.player.inventory;
    const itemIndex = inventory.findIndex((i) => i.id === itemId);

    if (itemIndex !== -1) {
      inventory.splice(itemIndex, 1); // Item löschen
      this.notify();
      this.saveGame();
      return true;
    }
    console.warn(`StateManager: Item ${itemId} nicht im Inventar gefunden!`);
    return false;
  }

  equipItem(itemId) {
    const item = this.state.player.inventory.find((i) => i.id === itemId);
    if (item) {
      if (item.type === "weapon") this.state.player.equipped.weapon = item;
      if (item.type === "armor") this.state.player.equipped.armor = item;
      this.notify();
      this.saveGame();
    }
  }

  unequipItem(slotType) {
    if (slotType === "weapon") this.state.player.equipped.weapon = null;
    if (slotType === "armor") this.state.player.equipped.armor = null;
    this.notify();
    this.saveGame();
  }

  modifyPlayerHp(amount) {
    this.state.player.hp += amount;
    // Begrenzung (Cap) auf MaxHP
    if (this.state.player.hp > this.state.player.maxHp) {
      this.state.player.hp = this.state.player.maxHp;
    }
    if (this.state.player.hp < 0) this.state.player.hp = 0;
    this.notify();
    this.saveGame();
  }

  addXp(amount) {
    this.state.player.xp += amount;
    const nextLevelXp = this.state.player.level * 100;
    if (this.state.player.xp >= nextLevelXp) {
      this.levelUp();
    } else {
      this.notify();
      this.saveGame();
    }
  }

  levelUp() {
    this.state.player.level++;
    this.state.player.xp = 0;
    this.state.player.maxHp += 10;
    this.state.player.hp = this.state.player.maxHp;
    this.state.player.stats.strength += 1;

    const event = new CustomEvent("combat-log", {
      detail: {
        message: `LEVEL UP! Stufe ${this.state.player.level} erreicht!`,
        type: "player",
      },
    });
    window.dispatchEvent(event);

    this.notify();
    this.saveGame();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach((callback) => callback({ ...this.state }));
  }

  getState() {
    return { ...this.state };
  }

  startCrawl(worldId) {
    const world = Definitions.worlds[worldId];
    if (!world) return;

    this.state.crawl = {
      active: true,
      worldId: worldId,
      security: world.baseSecurity,
      chaos: 0,
      choices: null,
    };
    this.notify();
  }

  setCrawlChoices(choices) {
    if (!this.state.crawl.active) return;
    this.state.crawl.choices = choices;
    this.notify();
  }

  clearCrawlChoices() {
    if (!this.state.crawl.active) return;
    this.state.crawl.choices = null;
    this.notify();
  }

  updateCrawlStats(securityChange, chaosChange) {
    if (!this.state.crawl.active) return;

    this.state.crawl.security = Math.max(
      0,
      this.state.crawl.security + securityChange,
    );
    this.state.crawl.chaos += chaosChange;
    this.notify();
  }

  endCrawl() {
    this.state.crawl.active = false;
    this.notify();
  }
}

export const stateManager = new StateManager();
