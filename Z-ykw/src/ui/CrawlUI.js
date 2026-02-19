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

        if (state.location !== "dungeon") {
            this.container.style.display = 'none';
            if (this.sceneContent && this.wasRenderingEvent) {
                this.sceneContent.innerHTML = '';
                this.wasRenderingEvent = false;
            }
            return;
        }

        if (state.crawl.activeEvent) {
            this.renderEventScreen(state.crawl.activeEvent);
            return;
        }

        if (this.sceneContent && this.wasRenderingEvent) {
            this.sceneContent.innerHTML = '';
            this.wasRenderingEvent = false;
        }

        if (state.crawl.active && !state.combat.active && state.crawl.choices) {
            
            if (this.sceneContent) {
                this.sceneContent.innerHTML = this.buildChoicesHTML(state.crawl.choices);
            }

            this.container.innerHTML = `
                <div class="button-grid single-button" style="display: flex; justify-content: center; width: 100%;">
                    <button class="game-button" onclick="window.gameAPI.toggleInventory()">Inventar öffnen</button>
                </div>
            `;
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