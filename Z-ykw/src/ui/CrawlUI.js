// src/ui/CrawlUI.js
import { stateManager } from '../engine/StateManager.js';

export class CrawlUI {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        
        // API für HTML-Clicks registrieren
        window.gameAPI.selectCrawlOption = (index) => {
            // Import dynamisch um Zirkelbezug zu vermeiden, oder global über main
            // Wir nutzen hier den Weg über main.js, den wir gleich einrichten
            window.gameAPI._internalSelectOption(index);
        };

        stateManager.subscribe((state) => {
            this.render(state);
        });
    }

    render(state) {
        if (!this.container) return;

        // Nur anzeigen, wenn wir im Crawl sind UND keine Gegner da sind
        // UND wir Optionen haben
        if (state.crawl.active && !state.currentEnemy && state.crawl.choices) {
            this.container.innerHTML = this.buildChoicesHTML(state.crawl.choices);
            this.container.style.display = 'block';
        } else {
            // Sonst verstecken (damit BattleUI Platz hat)
            this.container.innerHTML = '';
            this.container.style.display = 'none';
        }
    }

    buildChoicesHTML(choices) {
        return `
            <div class="crawl-selection-container">
                <h3 style="color:#aaa; text-align:center; margin-bottom:10px;">Wähle deinen Weg</h3>
                <div class="crawl-cards">
                    ${choices.map((event, index) => `
                        <div class="crawl-card" onclick="window.gameAPI.selectCrawlOption(${index})">
                            <div class="card-title">${event.name || "Ereignis"}</div>
                            <div class="card-text">${event.text.substring(0, 50)}...</div>
                            <div class="card-cost">Verlust: <span style="color:#ff6b6b">-${event.securityCost || 0}% Sicherheit</span></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}