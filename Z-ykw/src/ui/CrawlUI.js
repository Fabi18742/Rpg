import { stateManager } from '../engine/StateManager.js';

export class CrawlUI {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        this.sceneContent = document.getElementById('scene-content'); 
        this.wasRenderingEvent = false;
        
        // --- NEU: Schalter für das Crawl-Inventar ---
        this.showingInventory = false; 
        
        window.gameAPI._internalSelectOption = (index) => {
            import('../engine/CrawlEngine.js').then(module => {
                module.CrawlEngine.selectOption(index);
            });
        };

        // --- NEU: API-Befehle für das Vollbild-Inventar ---
        window.gameAPI.showCrawlInventory = () => {
            this.showingInventory = true;
            this.render(stateManager.getState());
        };

        window.gameAPI.hideCrawlInventory = () => {
            this.showingInventory = false;
            this.render(stateManager.getState());
        };

        stateManager.subscribe((state) => {
            this.render(state);
        });
    }

    render(state) {
        if (!this.container) return;

        // Wenn wir nicht im Dungeon sind, alles unsichtbar machen
        if (state.location !== "dungeon") {
            this.showingInventory = false; // Sicherstellen, dass es beim nächsten Mal zu ist
            this.container.style.display = 'none';
            if (this.sceneContent && this.wasRenderingEvent) {
                this.sceneContent.innerHTML = '';
                this.wasRenderingEvent = false;
            }
            return;
        }

        // --- NEU: GIBT ES DAS VOLLBILD-INVENTAR? ---
        if (this.showingInventory) {
            this.renderInventoryScreen(state);
            return;
        }

        // 1. GIBT ES EIN AKTIVES TEXT-EVENT? -> Dann zeige die Geschichte!
        if (state.crawl.activeEvent) {
            this.renderEventScreen(state.crawl.activeEvent);
            return;
        }

        // Clean-Up für vorherige Events
        if (this.sceneContent && this.wasRenderingEvent) {
            this.sceneContent.innerHTML = '';
            this.wasRenderingEvent = false;
        }

        // 2. NORMALER CRAWL (Karten ziehen)
        if (state.crawl.active && !state.combat.active && state.crawl.choices) {
            
            if (this.sceneContent) {
                this.sceneContent.innerHTML = this.buildChoicesHTML(state.crawl.choices);
            }

            // --- ÄNDERUNG: Ruft nun showCrawlInventory() anstatt toggleInventory() auf ---
            this.container.innerHTML = `
                <div class="button-grid single-button" style="display: flex; justify-content: center; width: 100%;">
                    <button class="game-button" onclick="window.gameAPI.showCrawlInventory()">Inventar öffnen</button>
                </div>
            `;
            this.container.style.display = 'block';
        } else {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
        }
    }

    // --- NEU: Rendert das Vollbild-Inventar (Identisch zum Hideout) ---
    renderInventoryScreen(state) {
        this.container.style.display = 'block';
        this.wasRenderingEvent = true; // Markieren, damit die Bildfläche nach dem Schließen aufgeräumt wird

        const p = state.player;
        const allLoot = [...(p.inventory || []), ...(p.weapons || [])];

        const itemsHTML = allLoot.length > 0 ? allLoot.map((item) => {
            const isEquipped = p.equipped.weapon?.id === item.id || p.equipped.armor?.id === item.id;
            const accentColor = isEquipped ? "var(--accent-color)" : "#fff";
            let typeDisplay = item.damage ? "WAFFE" : (item.type ? item.type.toUpperCase() : "ITEM");

            return `
            <div class="static-inv-item" style="background: rgba(0,0,0,0.5); border: 1px solid #444; border-left: 4px solid ${isEquipped ? "var(--accent-color)" : "#444"}; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display:flex; flex-direction:column; gap: 5px;">
                    <span style="font-weight:bold; font-size: 18px; color:${accentColor}">${item.name}${item.quantity > 1 ? ` <span style="color: #fbbf24; font-size: 14px;">x${item.quantity}</span>` : ""}</span>
                    <span style="font-size:12px; color:#888">${typeDisplay}</span>
                </div>
                <button class="game-button" onclick="window.gameAPI.useItem('${item.id}')" style="min-height: 40px; padding: 5px 20px; font-size: 14px; width: auto;">
                    ${isEquipped ? "Ablegen" : (item.damage ? "Ausrüsten" : "Nutzen")}
                </button>
            </div>`;
        }).join("") : "<p style='text-align:center; color:#888; font-size: 18px; grid-column: span 2; margin-top: 40px;'>Dein Inventar ist leer.</p>";

        // Szene oben überschreiben
        if (this.sceneContent) {
            this.sceneContent.innerHTML = `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; padding-top: 50px;">
                <h2 style="color: var(--accent-color); margin-bottom: 30px; margin-top: 0;">Inventar</h2>
                <div class="static-inventory-grid" style="width: 100%; max-width: 1000px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; overflow-y: auto; padding-right: 15px; margin-bottom: 20px;">
                    ${itemsHTML}
                </div>
            </div>`;
        }

        // Action-Area unten (Zurück-Button)
        this.container.innerHTML = `
            <div class="button-grid single-button" style="display: flex; justify-content: center; width: 100%;">
                <button class="game-button" onclick="window.gameAPI.hideCrawlInventory()">Zurück</button>
            </div>
        `;
    }

    renderEventScreen(event) {
        this.container.style.display = 'block';
        this.wasRenderingEvent = true;

        if (this.sceneContent) {
            this.sceneContent.innerHTML = `
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div style="background: rgba(0,0,0,0.5); border: 2px solid var(--accent-color); padding: 40px; max-width: 800px; width: 90%; text-align: center; box-shadow: 0 0 30px rgba(0,0,0,0.8);">
                        <h2 style="color: var(--accent-color); font-size: 32px; margin-top: 0; margin-bottom: 20px;">${event.name}</h2>
                        <p style="color: #e0e0e0; font-size: 20px; line-height: 1.6;">${event.text}</p>
                    </div>
                </div>
            `;
        }

        const buttonsHTML = event.choices.map((choice, index) => `
            <button class="game-button" style="min-height: 70px; font-size: 18px;" onclick="window.gameAPI.selectChoice(${index})">
                ${choice.text}
            </button>
        `).join('');

        this.container.innerHTML = `
            <div class="button-grid" style="display: flex; flex-direction: column; align-items: center; gap: 15px; max-width: 600px; margin: 0 auto;">
                ${buttonsHTML}
            </div>
        `;
    }

    buildChoicesHTML(choices) {
        return `
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <h2 style="color: var(--accent-color); margin-bottom: 40px; font-size: 32px; text-transform: uppercase; letter-spacing: 2px;">Wähle deinen Weg</h2>
                <div style="display: flex; gap: 30px; justify-content: center; width: 100%; max-width: 900px;">
                    ${choices.map((event, index) => `
                        <div onclick="window.gameAPI._internalSelectOption(${index})" 
                             style="background: rgba(0,0,0,0.7); border: 2px solid #444; padding: 30px 20px; width: 250px; cursor: pointer; text-align: center; transition: all 0.2s; display: flex; flex-direction: column; justify-content: space-between; min-height: 250px;"
                             onmouseover="this.style.background='rgba(40,40,40,0.9)'; this.style.borderColor='var(--accent-color)'" 
                             onmouseout="this.style.background='rgba(0,0,0,0.7)'; this.style.borderColor='#444'">
                            <div>
                                <div style="color: var(--accent-color); font-weight: bold; font-size: 18px; margin-bottom: 15px;">${event.name || "Ereignis"}</div>
                                <div style="color: #aaa; font-size: 14px; line-height: 1.5;">${event.text.substring(0, 80)}...</div>
                            </div>
                            <div style="font-size: 12px; color: #ff6b6b; border-top: 1px solid #333; padding-top: 15px; margin-top: 15px; font-weight: bold;">
                                Verlust: -${event.securityCost || 0}% Sicherheit
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}