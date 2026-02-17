export class StatCalculator {
    
    /**
     * Berechnet den Gesamtschaden eines Angriffs.
     * Formel: (BasisStärke + WaffenSchaden) * Multiplikatoren
     */
    static calculateAttackDamage(entityStats, weapon) {
        const baseStr = entityStats.strength || 0;
        const weaponDmg = weapon ? (weapon.damage || 0) : 0;
        
        // Hier können wir später Crit oder Buffs einrechnen
        return baseStr + weaponDmg;
    }

    /**
     * Berechnet den erlittenen Schaden.
     * Formel: Eingehender Schaden - Verteidigung (min. 0)
     */
    static calculateIncomingDamage(rawDamage, defense) {
        const finalDamage = rawDamage - defense;
        return Math.max(0, finalDamage); // Schaden kann nicht negativ sein
    }
}