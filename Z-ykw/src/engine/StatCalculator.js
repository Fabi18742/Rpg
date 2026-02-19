// src/engine/StatCalculator.js
import { Definitions } from "../data/definitions.js";

export class StatCalculator {

    static calculateAttack(attacker, skill) {
        const stats = attacker.stats || {};
        const weapon = attacker.equipped ? attacker.equipped.weapon : attacker.weapon; 
        
        const baseStr = stats.strength || attacker.strength || 0;
        let weaponDmg = weapon ? (weapon.damage || 0) : 0;
        let activeEffects = []; // Hier sammeln wir "on_hit" Effekte für später
        
        // --- 1. PASSIVE WAFFENEFFEKTE BERECHNEN ---
        if (weapon && weapon.effects) {
            weapon.effects.forEach(effectId => {
                const effectDef = Definitions.effects[effectId];
                if (!effectDef) return;

                // Wenn es ein Stat-Boost ist, direkt draufrechnen
                if (effectDef.type === "stat_boost" && effectDef.stat === "damage") {
                    weaponDmg += (effectDef.value || 0);
                } 
                // Wenn es ein Treffer-Effekt ist, für die ActionEngine speichern
                else if (effectDef.type === "on_hit") {
                    activeEffects.push(effectId);
                }
            });
        }

        // 2. Rohschaden
        let totalDamage = baseStr + weaponDmg;

        // 3. Skill-Multiplikator
        const skillMult = skill ? (skill.damageMult || 1.0) : 1.0;
        totalDamage = Math.floor(totalDamage * skillMult);

        // 4. Crit-Berechnung
        const critResult = this.calculateCrit(attacker, weapon, totalDamage);
        
        return {
            damage: critResult.damage,
            isCrit: critResult.isCrit,
            activeEffects: activeEffects // Wird an ActionEngine gereicht
        };
    }

    static calculateDefense(defender, rawDamage) {
        const stats = defender.stats || defender; 
        let baseDef = stats.defense || 0;
        
        const armor = defender.equipped ? defender.equipped.armor : null;
        let armorDef = armor ? (armor.defense || 0) : 0;

        // --- 1. PASSIVE RÜSTUNGSEFFEKTE ---
        // Funktioniert später automatisch, wenn Rüstungen Effekte haben
        if (armor && armor.effects) {
            armor.effects.forEach(effectId => {
                const effectDef = Definitions.effects[effectId];
                if (effectDef && effectDef.type === "stat_boost" && effectDef.stat === "defense") {
                    armorDef += (effectDef.value || 0);
                }
            });
        }

        const totalDef = baseDef + armorDef;
        let finalDamage = Math.max(0, rawDamage - totalDef);

        return {
            damage: finalDamage,
            blocked: totalDef
        };
    }

    static calculateCrit(attacker, weapon, currentDamage) {
        const stats = attacker.stats || attacker;
        const baseCrit = stats.critChance || 0;
        const weaponCrit = weapon ? (weapon.critChance || 0) : 0;
        const totalChance = baseCrit + weaponCrit;

        const baseMult = stats.critMultiplier || 1.5;
        const weaponMult = weapon ? (weapon.critMultiplier || 0) : 0;
        const totalMult = baseMult + weaponMult;

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