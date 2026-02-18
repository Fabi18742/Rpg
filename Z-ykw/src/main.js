// src/main.js
import { stateManager } from './engine/StateManager.js';
import { ActionEngine } from './engine/ActionEngine.js';
import { CrawlEngine } from './engine/CrawlEngine.js';
import { HUD } from './ui/HUD.js';
import { BattleUI } from './ui/BattleUI.js';
import { CrawlUI } from './ui/CrawlUI.js';
import { HideoutUI } from './ui/HideoutUI.js'; // NEU
import { windowManager } from './ui/WindowManager.js';

console.log("RPG Engine v2.0 starting...");

// --- GLOBAL API ---
window.gameAPI = {
    // Allgemein
    useItem: (itemId) => {
        ActionEngine.useItem(itemId); 
    },

    // --- HIDEOUT BEFEHLE ---
    switchHideoutTab: (tabName) => {
        if(window.hideoutInstance) window.hideoutInstance.setTab(tabName);
    },

    startAdventure: () => {
        // Vom Hideout in den Dungeon wechseln
        console.log("🌲 Aufbrechen in den Wald...");
        stateManager.enterDungeon(); // State ändern
        CrawlEngine.startExploration('forest'); // Engine starten
    },

    // --- CRAWL / KAMPF BEFEHLE ---
    _internalSelectOption: (index) => {
        CrawlEngine.selectOption(index);
    },

    // Wenn man im Crawl ist ("Weiter" klicken)
    searchEnemy: () => {
        // Falls wir fertig sind -> Zurück ins Hideout
        // (Das bauen wir später ein, erstmal weiter erkunden)
        CrawlEngine.generateOptions();
    },
    
    useSkill: (skillId) => {
        ActionEngine.useSkill(skillId);
    },

    reset: () => {
        if(confirm("Spielstand wirklich löschen?")) stateManager.resetGame();
    }
};

// --- INIT ---
try {
    stateManager.init();
    
    // HUD (Bleibt immer sichtbar oben)
    const hud = new HUD('ui-hud');
    hud.init();

    // CONTAINER SETUP
    const controlsArea = document.getElementById('controls');
    controlsArea.innerHTML = ''; 

    // Wir brauchen 3 Haupt-Ebenen, die sich abwechseln
    
    // 1. Hideout (Menü)
    const hideoutDiv = document.createElement('div');
    hideoutDiv.id = 'ui-hideout';
    controlsArea.appendChild(hideoutDiv);

    // 2. Battle (Kampf)
    const battleDiv = document.createElement('div');
    battleDiv.id = 'ui-battle';
    controlsArea.appendChild(battleDiv);
    
    // 3. Crawl (Kartenwahl)
    const crawlDiv = document.createElement('div');
    crawlDiv.id = 'ui-crawl';
    controlsArea.appendChild(crawlDiv);

    // Initialisieren
    window.hideoutInstance = new HideoutUI('ui-hideout');
    new BattleUI('ui-battle');
    new CrawlUI('ui-crawl');

    // Log Fenster (immer da)
    const logWindow = document.getElementById('log-window');
    if(logWindow) windowManager.addWindow(logWindow, 'log-window');

} catch (err) {
    console.error("FEHLER BEIM START:", err);
}

window.addEventListener('combat-log', (e) => {
    const logContainer = document.getElementById('combat-log');
    if (logContainer) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${e.detail.type}`;
        entry.innerText = e.detail.message;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
});