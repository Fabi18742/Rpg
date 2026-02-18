// src/engine/StatCalculator.js

export class StatCalculator {
    
    /**
     * Berechnet den Schaden eines Angriffs inkl. Crit-Prüfung
     * @param {Object} entityStats - Stats des Angreifers (strength, critChance)
     * @param {Object} weapon - Ausgerüstete Waffe (damage, critBonus)
     * @returns {Object} { damage: number, isCrit: boolean }
     */
    static calculateAttackDamage(entityStats, weapon) {
        const baseStr = entityStats.strength || 0;
        const weaponDmg = weapon ? (weapon.damage || 0) : 0;
        
        // 1. Basis-Schaden berechnen
        let damage = baseStr + weaponDmg;
        
        // 2. Crit-Berechnung (Pipeline)
        // Standard Crit-Chance: 5% (falls nicht definiert) + Waffeneffekte
        const baseCrit = entityStats.critChance || 5; 
        const weaponCrit = weapon ? (weapon.critChance || 0) : 0;
        const totalCritChance = baseCrit + weaponCrit;

        const isCrit = Math.random() * 100 < totalCritChance;

        if (isCrit) {
            // Kritischer Treffer: 1.5x Schaden (kann später in Definitions globalisiert werden)
            damage = Math.floor(damage * 1.5);
        }

        return { damage, isCrit };
    }

    /**
     * Berechnet den erlittenen Schaden.
     */
    static calculateIncomingDamage(rawDamage, defense) {
        if (rawDamage <= 0) return 0;
        const finalDamage = rawDamage - defense;
        // Mindestens 1 Schaden, wenn getroffen wurde (außer der Angriff war 0)
        return Math.max(1, finalDamage);
    }
}