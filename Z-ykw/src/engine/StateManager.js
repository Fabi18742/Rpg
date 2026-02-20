// src/engine/StateManager.js
import { Definitions } from "../data/definitions.js";
import { Storage } from "./Storage.js";
import { RitualEngine } from "./RitualEngine.js";

const SAVE_KEY = "rpg_savegame_v1";

class StateManager {
  constructor() {
    this.state = {
      location: "hideout",
      activeResult: null,
      player: {
        hp: 0,
        maxHp: 0,
        currentAp: 0,
        maxAp: 0,
        xp: 0,
        level: 1,
        gold: 0,
        stats: {},
        inventory: [],
        weapons: [],
        equipped: { weapon: null, armor: null },
        skills: ["normal_attack", "heavy_strike", "quick_heal"],
        defeatedBosses: [],
      },
      combat: {
        active: false,
        enemies: [],
        targetIndex: 0,
        log: [],
      },
      crawl: {
        active: false,
        worldId: null,
        security: 0,
        chaos: 0,
        choices: null,
        activeEvent: null,
      },
      ritual: {
        selectedItems: [],
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
        log: [],
      };
      this.state.currentEnemy = null;
      this.state.crawl.active = false;
      this.state.crawl.choices = null;
      if (!this.state.ritual) {
        this.state.ritual = { selectedItems: [] };
      }
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
      if (!this.state.player.unlockedSkills) {
        this.state.player.unlockedSkills = [
          "normal_attack",
          "heavy_strike",
          "quick_heal",
        ];
      }
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

  setResult(title, messages, context) {
    this.state.activeResult = { title, messages, context };
    this.notify();
  }

  clearResult() {
    const context = this.state.activeResult?.context;
    this.state.activeResult = null;
    this.notify();
    return context;
  }

  addDefeatedBoss(bossId) {
    if (!this.state.player.defeatedBosses)
      this.state.player.defeatedBosses = []; // Fallback für alte Saves

    if (!this.state.player.defeatedBosses.includes(bossId)) {
      this.state.player.defeatedBosses.push(bossId);
      this.saveGame();
      this.notify();
    }
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

startCombat(enemyIds, isBoss = false, onWinEvent = null) {
    this.state.combat.active = true;
    this.state.combat.isBoss = isBoss;
    this.state.combat.onWinEvent = onWinEvent;
    this.state.combat.enemies = enemyIds.map((def) => ({
      ...def,
      maxHp: def.hp,
    }));
    this.state.combat.targetIndex = 0;
    this.notify();
  }

  endCombat() {
    this.state.combat.active = false;
    this.state.combat.isBoss = false;
    this.state.combat.enemies = [];
    this.state.combat.targetIndex = 0;
    this.state.currentEnemy = null;
    this.notify();
  }

  setTarget(index) {
    if (index >= 0 && index < this.state.combat.enemies.length) {
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
    const nextAlive = enemies.findIndex((e) => e.hp > 0);
    if (nextAlive !== -1) {
      this.state.combat.targetIndex = nextAlive;
    }
  }

addItem(itemId, amount = 1) {
    if (
      this.state.location === "dungeon" &&
      this.state.crawl &&
      this.state.crawl.active &&
      this.state.crawl.lootTrack
    ) {
      const existingTracker = this.state.crawl.lootTrack.items.find(
        (i) => i.id === itemId,
      );
      if (existingTracker) existingTracker.amount += amount;
      else
        this.state.crawl.lootTrack.items.push({ id: itemId, amount: amount });
    }

    const itemDef = Definitions.items[itemId] || Definitions.weapons[itemId];
    if (itemDef) {
      // --- NEU: Prüfen, ob es Ausrüstung ist ---
      const isWeapon = itemDef.type === "weapon" || itemDef.damage !== undefined;
      const isArmor = itemDef.type === "armor" || itemDef.defense !== undefined;

      if (isWeapon) {
        // Waffen kommen direkt ins Waffen-Array und bekommen eine einzigartige ID (kein Stacking!)
        if (!this.state.player.weapons) this.state.player.weapons = [];
        for (let i = 0; i < amount; i++) {
          this.state.player.weapons.push({ 
              ...itemDef,
              id: `${itemId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              baseId: itemId,
              quantity: 1 
          });
        }
      } else if (isArmor) {
        // Rüstungen kommen ins Inventar, bekommen aber ebenfalls eine einzigartige ID
        for (let i = 0; i < amount; i++) {
          this.state.player.inventory.push({ 
              ...itemDef, 
              id: `${itemId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              baseId: itemId,
              quantity: 1 
          });
        }
      } else {
        // Normale Items (Tränke, Materialien) stacken wie gewohnt
        const existingItem = this.state.player.inventory.find(
          (i) => i.id === itemId,
        );
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + amount;
        } else {
          this.state.player.inventory.push({ ...itemDef, quantity: amount });
        }
      }
      this.notify();
      this.saveGame();
    }
  }

  removeItem(itemId, amount = 1) {
    const inventory = this.state.player.inventory;
    const itemIndex = inventory.findIndex((i) => i.id === itemId);

    if (itemIndex !== -1) {
      const item = inventory[itemIndex];

      // Prüfen, ob wir mehr als die geforderte Menge haben
      if (item.quantity && item.quantity > amount) {
        item.quantity -= amount;
      } else {
        // Falls nicht, Item komplett aus Array löschen
        inventory.splice(itemIndex, 1);
      }

      this.notify();
      this.saveGame();
      return true;
    }
    return false;
  }

  equipItem(itemId) {
    let item = this.state.player.inventory.find((i) => i.id === itemId);
    if (!item) {
      item = this.state.player.weapons.find((w) => w.id === itemId);
    }

    if (item) {
      if (item.type === "weapon" || item.damage !== undefined)
        this.state.player.equipped.weapon = item;
      if (item.type === "armor" || item.defense !== undefined)
        this.state.player.equipped.armor = item;
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

  modifyGold(amount) {
    if (
      amount > 0 &&
      this.state.location === "dungeon" &&
      this.state.crawl &&
      this.state.crawl.active &&
      this.state.crawl.lootTrack
    ) {
      this.state.crawl.lootTrack.gold += amount;
    }

    if (this.state.player.gold === undefined) this.state.player.gold = 0;
    this.state.player.gold += amount;
    if (this.state.player.gold < 0) this.state.player.gold = 0;
    this.notify();
    this.saveGame();
  }

  addXp(amount) {
    if (
      this.state.location === "dungeon" &&
      this.state.crawl &&
      this.state.crawl.active &&
      this.state.crawl.lootTrack
    ) {
      this.state.crawl.lootTrack.xp += amount;
    }

    this.state.player.xp += amount;

    // NEU: While-Schleife (falls man SEHR viel XP bekommt und gleich 2 Level aufsteigt)
    while (this.state.player.xp >= this.state.player.level * 100) {
      const nextLevelXp = this.state.player.level * 100;
      this.state.player.xp -= nextLevelXp; // XP-Überhang behalten!
      this.levelUp();
    }

    this.notify();
    this.saveGame();
  }

  levelUp() {
    this.state.player.level++;

    // NEU: Token geben statt automatisch Stats zu verteilen
    if (this.state.player.tokens === undefined) this.state.player.tokens = 0;
    this.state.player.tokens++;

    // Bonus: Vollheilung bei Level Up
    this.state.player.hp = this.state.player.maxHp;

    const event = new CustomEvent("combat-log", {
      detail: {
        message: `LEVEL UP! Stufe ${this.state.player.level} erreicht! (+1 Token)`,
        type: "player",
      },
    });
    window.dispatchEvent(event);
  }

  investToken(stat) {
    if (!this.state.player.tokens || this.state.player.tokens <= 0)
      return false;

    if (stat === "strength") this.state.player.stats.strength += 1;
    if (stat === "defense") this.state.player.stats.defense += 1;
    if (stat === 'critChance') {
        if (this.state.player.stats.critChance === undefined) {
            this.state.player.stats.critChance = 5; // Standardwert laut definitions.js
        }
        this.state.player.stats.critChance += 1;
    }
    if (stat === "maxHp") {
      this.state.player.maxHp += 10;
      this.state.player.hp += 10; // direkt mitheilen
    }

    this.state.player.tokens--;
    this.notify();
    this.saveGame();
    return true;
  }

  equipWeapon(weaponId) {
    let weapon = this.state.player.weapons.find((w) => w.id === weaponId);
    if (!weapon) {
      weapon = this.state.player.inventory.find((w) => w.id === weaponId);
    }

    if (weapon) {
      this.state.player.equipped.weapon = weapon;
      this.notify();
      this.saveGame();
      return true;
    }
    return false;
  }

  unequipWeapon() {
    this.state.player.equipped.weapon = null;
    this.notify();
    this.saveGame();
    return true;
  }

  equipSkill(slotIndex, skillId) {
    // 1. Sicherstellen, dass das Array 4 Slots hat
    while (this.state.player.skills.length < 4) {
      this.state.player.skills.push(null);
    }

    // 2. Keine Duplikate: Ist die Fähigkeit schon in einem anderen Slot? Dann dort löschen!
    const existingIndex = this.state.player.skills.indexOf(skillId);
    if (existingIndex !== -1 && existingIndex !== slotIndex) {
      this.state.player.skills[existingIndex] = null;
    }

    // 3. Fähigkeit in den gewünschten Slot packen
    this.state.player.skills[slotIndex] = skillId;
    this.saveGame();
    this.notify();
  }

  unequipSkill(slotIndex) {
    if (this.state.player.skills.length > slotIndex) {
      this.state.player.skills[slotIndex] = null;
      this.saveGame();
      this.notify();
    }
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
      activeEvent: null,
      lootTrack: { xp: 0, gold: 0, items: [] },
      eventPool: [...world.events],
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

  addEventToPool(eventId) {
    if (!this.state.crawl.active) return;
    if (!this.state.crawl.eventPool.includes(eventId)) {
        this.state.crawl.eventPool.push(eventId);
    }
  }

  removeEventFromPool(eventId) {
    if (!this.state.crawl.active) return;
    this.state.crawl.eventPool = this.state.crawl.eventPool.filter(id => id !== eventId);
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

  addItemToRitual(itemId) {
    if (this.state.ritual.selectedItems.length >= 6) return false;

    const inventory = this.state.player.inventory;
    const itemIndex = inventory.findIndex((i) => i.id === itemId);

    if (itemIndex === -1) return false;

    const item = inventory[itemIndex];

    // Nur 1 abziehen statt das ganze Item zu löschen
    if (item.quantity && item.quantity > 1) {
      item.quantity -= 1;
    } else {
      inventory.splice(itemIndex, 1);
    }

    // Eine saubere Kopie (ohne Quantity) in den Kreis legen
    const ritualItem = { ...item };
    delete ritualItem.quantity;
    this.state.ritual.selectedItems.push(ritualItem);

    this.notify();
    return true;
  }

  removeItemFromRitual(index) {
    const item = this.state.ritual.selectedItems.splice(index, 1)[0];
    if (item) {
      // Nutzt unsere schlaue addItem-Funktion, damit es sich wieder sauber stapelt!
      this.addItem(item.id, 1);
    }
  }

  setActiveEvent(eventDef) {
    if (!this.state.crawl.active) return;
    this.state.crawl.activeEvent = eventDef;
    this.notify();
  }

  clearActiveEvent() {
    if (!this.state.crawl.active) return;
    this.state.crawl.activeEvent = null;
    this.notify();
  }

  performRitual() {
    if (this.state.ritual.selectedItems.length !== 6) return null;

    const result = RitualEngine.calculateResult(
      this.state.ritual.selectedItems,
    );

    if (result) {
      this.state.ritual.selectedItems = [];

      // ÄNDERUNG: In die Waffen-Liste pushen!
      // Wir stellen sicher, dass das Array existiert (für alte Savegames)
      if (!this.state.player.weapons) this.state.player.weapons = [];

      this.state.player.weapons.push(result);

      this.notify();
      this.saveGame();
      return result;
    }
    return null;
  }

  clearRitual() {
    // Solange noch Items im Ritual-Kreis liegen
    while (this.state.ritual.selectedItems.length > 0) {
      const item = this.state.ritual.selectedItems.pop();
      if (item && item.id) {
        // Legt das Item sauber mit unserer neuen Stapel-Logik zurück
        this.addItem(item.id, 1);
      }
    }
    this.saveGame();
    this.notify();
  }
}

export const stateManager = new StateManager();
