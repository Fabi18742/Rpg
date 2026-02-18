// src/engine/StatCalculator.js

export class StatCalculator {

    /**
     * Berechnet den finalen Angriffswert eines Entitys
     * unter Berücksichtigung von Basis-Stats, Ausrüstung und Skills.
     */
    static calculateAttack(attacker, skill) {
        // 1. Basis-Werte sammeln
        const stats = attacker.stats || {};
        const weapon = attacker.equipped ? attacker.equipped.weapon : null; // Player hat equipped, Gegner oft direkt weapon stats
        
        // Fallback für Gegner (die haben oft keine stats-Objekte wie der Player)
        const baseStr = stats.strength || attacker.strength || 0;
        const weaponDmg = weapon ? (weapon.damage || 0) : 0;
        
        // 2. Rohschaden berechnen
        let totalDamage = baseStr + weaponDmg;

        // 3. Skill-Modifikator anwenden (z.B. Heavy Strike = 1.5x)
        const skillMult = skill ? (skill.damageMult || 1.0) : 1.0;
        totalDamage = Math.floor(totalDamage * skillMult);

        // 4. PIPELINE: "OnAttack" Effekte
        // Hier prüfen wir auf Crit. Später können hier Gift, Feuer etc. dazu kommen.
        
        const critResult = this.calculateCrit(attacker, weapon, totalDamage);
        totalDamage = critResult.damage;
        
        return {
            damage: totalDamage,
            isCrit: critResult.isCrit,
            // Hier können wir später Flags wie 'isPoisoned' zurückgeben
        };
    }

    /**
     * Berechnet die Verteidigung (Incoming Damage)
     */
    static calculateDefense(defender, rawDamage) {
        // Stats beim Player vs. Gegner unterscheiden
        const stats = defender.stats || defender; 
        const baseDef = stats.defense || 0;
        
        const armor = defender.equipped ? defender.equipped.armor : null;
        const armorDef = armor ? (armor.defense || 0) : 0;

        const totalDef = baseDef + armorDef;
        
        // Schaden reduzieren (nicht unter 0, aber min 1, falls getroffen wurde?)
        // Design-Entscheidung: Verteidigung kann Schaden auf 0 reduzieren.
        let finalDamage = Math.max(0, rawDamage - totalDef);

        return {
            damage: finalDamage,
            blocked: totalDef // Info für Logs
        };
    }

    // --- INTERNE EFFEKT-LOGIK ---

    static calculateCrit(attacker, weapon, currentDamage) {
        const stats = attacker.stats || attacker; // Fallback
        
        // Werte aggregieren (Basis + Waffe)
        const baseCrit = stats.critChance || 0;
        const weaponCrit = weapon ? (weapon.critChance || 0) : 0;
        const totalChance = baseCrit + weaponCrit;

        const baseMult = stats.critMultiplier || 1.5; // Standard 1.5x
        // Waffe könnte auch critMultiplier haben, addieren wir hier optional:
        const weaponMult = weapon ? (weapon.critMultiplier || 0) : 0;
        const totalMult = baseMult + weaponMult;

        // Würfeln
        const isCrit = (Math.random() * 100) < totalChance;

        if (isCrit) {
            return {
                isCrit: true,
                damage: Math.floor(currentDamage * totalMult)
            };
        }

        return { isCrit: false, damage: currentDamage };
    }
}