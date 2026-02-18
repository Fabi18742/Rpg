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
        currentAp: 0,
        maxAp: 0,
        xp: 0,
        level: 1,
        stats: {},
        inventory: [],
        equipped: { weapon: null, armor: null },
        skills: ["normal_attack", "heavy_strike", "quick_heal"],
      },
      combat: {
        active: false,
        enemies: [],
        targetIndex: 0,
        log: []
      },
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
      this.state.combat = {
            active: false,
            enemies: [],
            targetIndex: 0,
            log: []
        };
      this.state.currentEnemy = null;
      this.state.crawl.active = false;
      this.state.crawl.choices = null;
    } else {
      console.log("✨ Kein Spielstand. Neues Spiel gestartet.");
      this.state.player.maxHp = Definitions.player.baseHp;
      this.state.player.hp = Definitions.player.baseHp;
      this.state.player.stats = { ...Definitions.player.baseStats };

      this.addItem("rusty_sword");
      this.addItem("potion_small");

      this.state.location = "hideout";
      this.state.player.maxAp = Definitions.player.baseActionPoints;
      this.state.player.currentAp = Definitions.player.baseActionPoints;
    }

    if (!this.state.player.maxAp) {
      this.state.player.maxAp = Definitions.player.baseActionPoints;
      this.state.player.currentAp = Definitions.player.baseActionPoints;
    }

    this.notify();
  }

  modifyPlayerAp(amount) {
    this.state.player.currentAp += amount;

    // Nicht über Max AP gehen
    if (this.state.player.currentAp > this.state.player.maxAp) {
      this.state.player.currentAp = this.state.player.maxAp;
    }
    // Nicht unter 0 gehen
    if (this.state.player.currentAp < 0) {
      this.state.player.currentAp = 0;
    }

    this.notify();
  }

  resetPlayerAp() {
    this.state.player.currentAp = this.state.player.maxAp;
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

startCombat(enemyIds) {
      this.state.combat.active = true;
      this.state.combat.enemies = enemyIds.map(def => ({...def, maxHp: def.hp})); // Kopien erstellen
      this.state.combat.targetIndex = 0; // Standard: Ersten Gegner fokussieren
      this.notify();
  }
  endCombat() {
      this.state.combat.active = false;
      this.state.combat.enemies = [];
      this.state.combat.targetIndex = 0;
      this.state.currentEnemy = null; // Zur Sicherheit, falls alte UI darauf zugreift
      this.notify();
  }

  setTarget(index) {
      if (index >= 0 && index < this.state.combat.enemies.length) {
          // Nur lebende Ziele anvisieren? Das checken wir in der UI/Engine
          this.state.combat.targetIndex = index;
          this.notify();
      }
  }

  modifyEnemyHp(index, amount) {
      const enemy = this.state.combat.enemies[index];
      if (!enemy) return;

      enemy.hp += amount;
      if (enemy.hp < 0) enemy.hp = 0;
      
      if (enemy.hp === 0 && index === this.state.combat.targetIndex) {
          this.autoTargetNextLiving();
      }

      this.notify();
  }

  autoTargetNextLiving() {
      const enemies = this.state.combat.enemies;
      // Suche ersten Gegner mit HP > 0
      const nextAlive = enemies.findIndex(e => e.hp > 0);
      if (nextAlive !== -1) {
          this.state.combat.targetIndex = nextAlive;
      }
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
