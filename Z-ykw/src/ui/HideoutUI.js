// src/ui/HideoutUI.js
import { stateManager } from '../engine/StateManager.js';
import { Definitions } from '../data/definitions.js';
import { CrawlEngine } from '../engine/CrawlEngine.js';

export class HideoutUI {
    constructor(elementId) {
        this.container = document.getElementById(elementId);
        this.currentTab = 'overview'; // Standard-Tab

        stateManager.subscribe((state) => {
            this.render(state);
        });
    }

    render(state) {
        if (!this.container) return;

        // ZEIGE DICH NUR WENN IM HIDEOUT
        if (state.location !== 'hideout') {
            this.container.style.display = 'none';
            return;
        }

        this.container.style.display = 'block';
        const p = state.player;

        // --- TAB HEADER ---
        let html = `
            <div class="hideout-tabs">
                <button class="tab-btn ${this.currentTab === 'overview' ? 'active' : ''}" onclick="window.gameAPI.switchHideoutTab('overview')">Übersicht</button>
                <button class="tab-btn ${this.currentTab === 'inventory' ? 'active' : ''}" onclick="window.gameAPI.switchHideoutTab('inventory')">Inventar</button>
                <button class="tab-btn adventure-btn" onclick="window.gameAPI.startAdventure()">🌲 Aufbrechen</button>
            </div>
            <div class="hideout-content">
        `;

        // --- TAB CONTENT ---
        
        if (this.currentTab === 'overview') {
            // Charakter Stats Ansicht
            const weaponName = p.equipped.weapon ? p.equipped.weapon.name : "Fäuste";
            const armorName = p.equipped.armor ? p.equipped.armor.name : "Lumpen";
            
            // Stats berechnen (könnte man auslagern)
            const totalStr = p.stats.strength + (p.equipped.weapon?.damage || 0);
            const totalDef = p.stats.defense + (p.equipped.armor?.defense || 0);

            html += `
                <div class="stats-panel-static">
                    <h3>Charakterbogen</h3>
                    <div class="stat-grid">
                        <div class="stat-box"><div>Stufe</div><div class="val">${p.level}</div></div>
                        <div class="stat-box"><div>Leben</div><div class="val">${p.hp} / ${p.maxHp}</div></div>
                        <div class="stat-box"><div>Stärke</div><div class="val text-red">${totalStr}</div></div>
                        <div class="stat-box"><div>Abwehr</div><div class="val text-green">${totalDef}</div></div>
                        <div class="stat-box"><div>Tempo</div><div class="val">${p.stats.speed}</div></div>
                        <div class="stat-box"><div>Crit</div><div class="val text-gold">${(p.stats.critChance || 5)}%</div></div>
                    </div>
                    <div class="equipment-display">
                        <div class="equip-slot">⚔️ Waffe: <span class="item-name">${weaponName}</span></div>
                        <div class="equip-slot">🛡️ Rüstung: <span class="item-name">${armorName}</span></div>
                    </div>
                </div>
            `;
        } 
        else if (this.currentTab === 'inventory') {
            // Inventar Liste (fest, nicht draggable)
            if (p.inventory.length === 0) {
                html += `<div style="padding:20px; color:#666;">Leer</div>`;
            } else {
                html += `<div class="inventory-list-static">`;
                p.inventory.forEach(item => {
                    const isEquipped = (p.equipped.weapon?.id === item.id) || (p.equipped.armor?.id === item.id);
                    const btnLabel = isEquipped ? "Ablegen" : (item.type === 'consumable' ? "Nutzen" : "Ausrüsten");
                    
                    html += `
                        <div class="inv-row">
                            <div class="inv-info">
                                <span class="inv-name ${isEquipped ? 'text-gold' : ''}">${item.name}</span>
                                <span class="inv-type">${item.type}</span>
                            </div>
                            <button class="small-btn" onclick="window.gameAPI.useItem('${item.id}')">${btnLabel}</button>
                        </div>
                    `;
                });
                html += `</div>`;
            }
        }

        html += `</div>`; // Close content
        this.container.innerHTML = html;
    }

    setTab(tabName) {
        this.currentTab = tabName;
        this.render(stateManager.getState());
    }
}