// src/engine/StateManager.js
import { Definitions } from '../data/definitions.js';
import { Storage } from './Storage.js'; // NEU: Import

const SAVE_KEY = 'rpg_savegame_v1';

class StateManager {
    constructor() {
        this.state = {
            player: {
                hp: 0,
                maxHp: 0,
                xp: 0,
                level: 1,
                stats: {},
                inventory: [],
                equipped: { weapon: null, armor: null }
            },
            currentEnemy: null,
        };
        this.listeners = [];
    }

    init() {
        console.log("StateManager: Lade Daten...");
        
        // 1. Versuche Spielstand zu laden
        const loadedState = Storage.load(SAVE_KEY);

        if (loadedState) {
            console.log("📂 Spielstand gefunden & geladen.");
            // Wir überschreiben den State mit dem geladenen
            this.state = loadedState;
            
            // Wichtig: UI über den geladenen Stand informieren
            // Wir machen das erst am Ende von init via notify()
        } else {
            console.log("✨ Kein Spielstand. Neues Spiel gestartet.");
            // 2. Fallback: Neue Werte setzen (Startzustand)
            this.state.player.maxHp = Definitions.player.baseHp;
            this.state.player.hp = Definitions.player.baseHp;
            this.state.player.stats = { ...Definitions.player.baseStats };
            
            // Start-Items
            this.addItem('rusty_sword');
            this.addItem('potion_small');
        }
        
        // UI initialisieren
        this.notify();
    }

    // --- NEU: Speichern & Reset ---
    saveGame() {
        Storage.save(SAVE_KEY, this.state);
        // Wir spammen kein UI-Log für jedes Autosave, nur Konsole optional
    }

    resetGame() {
        Storage.clear(SAVE_KEY);
        location.reload(); // Seite neu laden für sauberen Neustart
    }
    // ------------------------------

    setEnemy(enemy) {
        this.state.currentEnemy = enemy;
        this.notify();
        // Kampfzustand speichern wir meistens NICHT (oder doch? Für Roguelikes ja)
        // Hier: Wir speichern lieber nach dem Kampf.
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
            this.saveGame(); // Auto-Save beim Looten
        }
    }

    equipItem(itemId) {
        const item = this.state.player.inventory.find(i => i.id === itemId);
        if (item) {
            if (item.type === 'weapon') this.state.player.equipped.weapon = item;
            if (item.type === 'armor') this.state.player.equipped.armor = item;
            this.notify();
            this.saveGame(); // Auto-Save beim Ausrüsten
        }
    }

    modifyPlayerHp(amount) {
        this.state.player.hp += amount;
        if (this.state.player.hp > this.state.player.maxHp) this.state.player.hp = this.state.player.maxHp;
        if (this.state.player.hp < 0) this.state.player.hp = 0;
        this.notify();
        // HP Änderungen speichern wir vielleicht nicht JEDES mal (Performance), 
        // aber für dieses Projekt ist es okay.
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
        
        console.log(`🎉 LEVEL UP! Stufe ${this.state.player.level}`);
        
        // Kleiner Hack: Wir nutzen das window-Event für die Nachricht
        const event = new CustomEvent('combat-log', { 
            detail: { message: `LEVEL UP! Stufe ${this.state.player.level} erreicht!`, type: 'player' } 
        });
        window.dispatchEvent(event);

        this.notify();
        this.saveGame();
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(callback => callback({ ...this.state }));
    }

    getState() {
        return { ...this.state };
    }
}

export const stateManager = new StateManager();