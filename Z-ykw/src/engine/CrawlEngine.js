// src/engine/CrawlEngine.js
import { stateManager } from './StateManager.js';
import { ActionEngine } from './ActionEngine.js';
import { Definitions } from '../data/definitions.js';

export class CrawlEngine {

    static startExploration(worldId) {
        stateManager.startCrawl(worldId);
        this.generateOptions(); // Sofort Optionen generieren
    }

    // Zieht 3 zufällige Events und zeigt sie an
    static generateOptions() {
        const state = stateManager.getState();
        if (!state.crawl.active) return;

        const world = Definitions.worlds[state.crawl.worldId];
        const pool = world.events; // Array von IDs ["combat_goblin", ...]

        // 3 Zufällige ziehen (ohne Duplikate wenn möglich)
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const selectedIds = shuffled.slice(0, 3);

        // Events auflösen (IDs -> Objekte)
        const choices = selectedIds.map(id => Definitions.events[id]);

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
        if (eventDef.type === 'combat') {
            ActionEngine.log(eventDef.text, 'neutral');
            
            // FIX: Wir prüfen, ob es eine einzelne ID oder eine Liste ist
            // und übergeben IMMER ein Array an die ActionEngine.
            let enemyList = [];
            
            if (eventDef.enemies) {
                // Es ist schon eine Liste (neues System)
                enemyList = eventDef.enemies;
            } else if (eventDef.enemyId) {
                // Es ist eine einzelne ID (altes System) -> In Array packen
                enemyList = [eventDef.enemyId];
            }
            
            ActionEngine.startCombat(enemyList);
        } 
        else if (eventDef.type === 'choice') {
            // Einfacher Text-Event (später mehr)
            ActionEngine.log(`Event: ${eventDef.name}`, 'neutral');
            ActionEngine.log(eventDef.text, 'neutral');
            
            // Auto-Resolve für Testzwecke (später Auswahl UI)
            if (eventDef.choices && eventDef.choices[0].effect === 'heal_10') {
                stateManager.modifyPlayerHp(10);
                ActionEngine.log("Du ruhst dich aus (+10 HP).", 'player');
            }

            setTimeout(() => this.generateOptions(), 2000);
        }
    }
}