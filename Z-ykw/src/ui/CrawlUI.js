import { stateManager } from '../engine/StateManager.js';

export class CrawlUI {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        this.sceneContent = document.getElementById('scene-content'); // Greift auf die obere Bildhälfte zu
        this.wasRenderingEvent = false;
        
        window.gameAPI._internalSelectOption = (index) => {
            import('../engine/CrawlEngine.js').then(module => {
                module.CrawlEngine.selectOption(index);
            });
        };

        stateManager.subscribe((state) => {
            this.render(state);
        });
    }

    render(state) {
        if (!this.container) return;

        // Wenn wir nicht im Dungeon sind, alles unsichtbar machen
        if (state.location !== "dungeon") {
            this.container.style.display = 'none';
            if (this.sceneContent && this.wasRenderingEvent) {
                this.sceneContent.innerHTML = '';
                this.wasRenderingEvent = false;
            }
            return;
        }

        // 1. GIBT ES EIN AKTIVES TEXT-EVENT? -> Dann zeige die Geschichte!
        if (state.crawl.activeEvent) {
            this.renderEventScreen(state.crawl.activeEvent);
            return;
        }

        // Clean-Up: Wenn das Event vorbei ist, leere die Bildfläche
        if (this.sceneContent && this.wasRenderingEvent) {
            this.sceneContent.innerHTML = '';
            this.wasRenderingEvent = false;
        }

        // 2. NORMALER CRAWL (Karten ziehen)
        if (state.crawl.active && !state.combat.active && state.crawl.choices) {
            this.container.innerHTML = this.buildChoicesHTML(state.crawl.choices);
            this.container.style.display = 'block';
        } else {
            this.container.innerHTML = '';
            this.container.style.display = 'none';
        }
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
            <div class="crawl-selection-container">
                <h3 style="color:#aaa; text-align:center; margin-bottom:10px;">Wähle deinen Weg</h3>
                <div class="crawl-cards" style="display: flex; gap: 15px; justify-content: center;">
                    ${choices.map((event, index) => `
                        <div class="crawl-card" onclick="window.gameAPI._internalSelectOption(${index})" style="background: #111; border: 2px solid #444; padding: 20px; width: 200px; cursor: pointer; text-align: center; transition: all 0.2s;">
                            <div class="card-title" style="color: var(--accent-color); font-weight: bold; font-size: 16px; margin-bottom: 10px;">${event.name || "Ereignis"}</div>
                            <div class="card-text" style="color: #888; font-size: 12px; margin-bottom: 15px;">${event.text.substring(0, 60)}...</div>
                            <div class="card-cost" style="font-size: 11px; color: #ff6b6b; border-top: 1px solid #333; padding-top: 8px;">Verlust: -${event.securityCost || 0}% Sicherheit</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}