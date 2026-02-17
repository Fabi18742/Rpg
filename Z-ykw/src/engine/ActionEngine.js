// src/engine/ActionEngine.js
import { StatCalculator } from './StatCalculator.js';
import { stateManager } from './StateManager.js';
import { Definitions } from '../data/definitions.js';

export class ActionEngine {

    static startCombat(enemyId) {
        const enemyDef = Definitions.enemies[enemyId];
        if (!enemyDef) return;

        const enemy = { ...enemyDef, maxHp: enemyDef.hp };
        stateManager.setEnemy(enemy);
        this.log(`Ein wildes ${enemy.name} taucht auf!`, 'neutral');
    }

    static playerAttack() {
        const state = stateManager.getState();
        if (!state.currentEnemy) return;

        this.executeAttack('player', 'enemy');

        if (stateManager.getState().currentEnemy.hp <= 0) {
            this.winCombat();
        } else {
            setTimeout(() => {
                this.enemyTurn();
            }, 800); // Etwas schneller als vorher
        }
    }

    static enemyTurn() {
        const state = stateManager.getState();
        if (!state.currentEnemy) return;

        this.executeAttack('enemy', 'player');

        if (stateManager.getState().player.hp <= 0) {
            this.log("Du wurdest besiegt...", 'enemy');
            stateManager.setEnemy(null);
        }
    }

    static executeAttack(source, target) {
        const state = stateManager.getState();
        let attackerStats, defenderStats, weapon;

        if (source === 'player') {
            // NEU: Echte Stats aus dem State!
            attackerStats = state.player.stats; 
            weapon = state.player.equipped.weapon;
            
            // Gegner Stats (vereinfacht)
            defenderStats = { defense: state.currentEnemy.defense || 0 };
        } else {
            // Gegner greift an
            attackerStats = { strength: state.currentEnemy.strength };
            weapon = null; 
            
            // Spieler Def (Rüstung wird im Calculator beachtet, wenn wir Armor übergeben würden)
            // Hier vereinfacht: Wir berechnen Spieler-Def manuell oder erweitern StatCalculator
            const armorDef = state.player.equipped.armor ? state.player.equipped.armor.defense : 0;
            defenderStats = { defense: state.player.stats.defense + armorDef };
        }

        const rawDamage = StatCalculator.calculateAttackDamage(attackerStats, weapon);
        const finalDamage = StatCalculator.calculateIncomingDamage(rawDamage, defenderStats.defense);

        const type = source === 'player' ? 'player' : 'enemy';
        const attackerName = source === 'player' ? 'Du' : state.currentEnemy.name;
        
        this.log(`${attackerName} trifft für ${finalDamage} Schaden!`, type);

        if (target === 'player') {
            stateManager.modifyPlayerHp(-finalDamage);
        } else {
            stateManager.modifyEnemyHp(-finalDamage);
        }
    }

    // --- NEU: Loot & XP Logik ---
    static winCombat() {
        const enemy = stateManager.getState().currentEnemy;
        this.log(`${enemy.name} besiegt!`, 'player');
        
        // 1. XP geben
        if (enemy.xp) {
            stateManager.addXp(enemy.xp);
            this.log(`+${enemy.xp} Erfahrung erhalten.`, 'neutral');
        }

        // 2. Loot würfeln
        if (enemy.lootTable) {
            enemy.lootTable.forEach(loot => {
                if (Math.random() < loot.chance) {
                    // Item droppen
                    stateManager.addItem(loot.itemId);
                    // Name für Log holen
                    const itemName = Definitions.items[loot.itemId].name;
                    this.log(`Beute: ${itemName}`, 'neutral');
                }
            });
        }
        
        stateManager.setEnemy(null);
    }

    static log(message, type = 'neutral') {
        const event = new CustomEvent('combat-log', { detail: { message, type } });
        window.dispatchEvent(event);
    }
}