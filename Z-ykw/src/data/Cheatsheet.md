# 📖 RPG Engine - Modding Handbuch (`definitions.js`)

In der Datei `definitions.js` wird der gesamte Inhalt des Spiels definiert. Die Engine liest diese Daten automatisch aus. Hier ist die genaue Erklärung, welche Attribute (Eigenschaften) dir zur Verfügung stehen.

---

## 1. `player` (Startwerte des Spielers)
Definiert, womit ein komplett neuer Spielstand beginnt.
* **`baseHp`**: Maximale Lebenspunkte beim Start.
* **`baseStats`**: Objekt mit den Start-Attributen:
    * `strength`: Basis-Schaden.
    * `defense`: Basis-Rüstung.
    * `speed`: (Aktuell nicht für Kämpfe genutzt, aber vorbereitet).
    * `critChance`: Chance auf kritische Treffer in % (Standard: 5).
    * `critMultiplier`: Multiplikator bei einem Crit (Standard: 1.5 = 150% Schaden).
* **`baseActionPoints`**: Aktionspunkte (AP) pro Runde im Kampf.

## 2. `items` (Gegenstände & Rüstungen)
Alles, was ins normale Inventar wandert.
* **`id`**: Eindeutiger interner Name (z.B. `"potion_small"`).
* **`name`**: Anzeigename im Spiel.
* **`description`**: Beschreibungstext.
* **`goldValue`**: Preis beim Händler (Kauf/Verkauf).
* **`type`**: Art des Items:
    * `"armor"`: Wird angezogen und gibt Rüstung.
    * `"consumable"`: Kann getrunken/benutzt werden.
    * `"material"`: Verkaufs- oder Quest-Item.
    * `"ritual"`: Kann im Ritualmenü verwendet werden.

**Spezifische Attribute (je nach Typ):**
* **`defense`** *(nur bei armor)*: Wie viel Schaden blockt die Rüstung?
* **`effects`** *(nur bei armor, optional)*: Ein Array mit Effekt-IDs (z.B. `["sharpness"]`), die aktiv sind, solange die Rüstung getragen wird.
* **`effect`** *(nur bei consumable)*: Was tut es beim Nutzen? (Aktuell: `"heal"`).
* **`value`** *(nur bei effect: "heal")*: Wie viele HP werden geheilt?
* **`ritualValue`** *(nur bei ritual)*: Power-Wert für das Ritual (bestimmt, welche Waffe entsteht).
* **`modifierType`** *(nur bei ritual)*: Welchen Effekt bekommt die hergestellte Waffe? Verweist auf eine ID aus den `effects`.

## 3. `weapons` (Waffen)
* **`id` / `name` / `description` / `value`**: Wie bei normalen Items.
* **`type`**: Muss `"weapon"` sein.
* **`damageType`**: Art des Schadens (`"schlitz"`, `"stich"`, `"hieb"`). Wichtig für Schwächen der Gegner!
* **`damage`**: Grundschaden der Waffe.
* **`critChance`**: Bonus-Crit-Chance der Waffe in %.
* **`ritualValue`**: Welchen Gesamt-Power-Wert (aus Ritual Items) braucht man, um diese Waffe herzustellen?

## 4. `effects` (Status- & Waffeneffekte)
Passive Effekte, die auf Rüstungen, Waffen oder Ritual-Waffen liegen können.
* **`id` / `name` / `description`**
* **`type`**: 
    * `"stat_boost"`: Erhöht dauerhaft einen Wert (braucht `stat`, z.B. `"damage"`, `"defense"` und einen `value`).
    * `"on_hit"`: Tritt ein, wenn man angreift.

**Spezifische Attribute (wenn Typ `"on_hit"`):**
* **`trigger: "apply_status"`**: Belegt Gegner mit einem Zustand (z.B. Gift). Braucht `statusId`, `statusType` (z.B. `"dot"` = Damage over Time), `baseDamage`, `stacksToApply` und `applyChance` (0.0 bis 1.0).
* **`trigger: "heal_attacker"`**: Vampirismus. Braucht `value` (z.B. `0.2` = heilt 20% des angerichteten Schadens).

## 5. `abilities` (Fähigkeiten)
Skills, die man in den 4 Slots ausrüsten kann.
* **`id` / `name`**
* **`type`**: `"attack"` (Schaden verursachen) oder `"heal"` (Heilung).
* **`text`**: Verb für das Kampflog (z.B. `"schwingt die Waffe"` -> *"Du schwingst die Waffe..."*).
* **`apCost`**: Wie viele AP kostet der Einsatz?

**Spezifische Attribute:**
* **`damageMult`** *(nur attack)*: Multiplikator (1.5 = 150% deines Gesamtschadens).
* **`accuracy`** *(nur attack)*: Trefferchance (1.0 = 100%, 0.7 = 70%).
* **`isAoE`** *(nur attack, optional)*: Wenn `true`, trifft der Angriff alle Gegner gleichzeitig.
* **`value`** *(nur heal)*: Fixe Anzahl an HP, die geheilt werden.

## 6. `enemies` (Gegner & Bosse)
* **`id` / `name`**
* **`hp`**: Leben.
* **`strength`**: Schaden.
* **`defense`**: Rüstungswert.
* **`xp`**: Erfahrungspunkte beim Tod.
* **`gold`**: Gold-Drop.
* **`weaknesses` / `resistances`**: Array aus Strings (z.B. `["schlitz"]`). Ein Angriff dieses Typs macht +30% oder -30% Schaden.
* **`lootTable`**: Array aus Objekten im Format `{ itemId: "ID", chance: 0.8 }`. (0.8 = 80% Drop-Chance).

## 7. `worlds` (Dungeons & Gebiete)
* **`id` / `name` / `description`**
* **`type`**: (Optional). Wenn `"story"`, taucht am Ende kein Boss auf und es gibt keinen Sicherheits-Balken. Story-Entscheidungen gehen fließend ineinander über.
* **`baseSecurity`**: Startwert des Sicherheitsbalkens (nur für Boss-Welten relevant).
* **`bossId`**: Welcher Gegner erscheint, wenn die Sicherheit auf 0 fällt oder das Gebiet abgeschlossen ist?
* **`requiredAchievement`**: Welche Errungenschaft muss freigeschaltet sein, um diese Welt zu betreten? (Wenn `null`, ist sie von Anfang an offen).
* **`events`**: Array mit Event-IDs, die in diesem Dungeon als Karten gezogen werden können (Der "Kartenpool").

---

## 8. `events` (Crawl-Karten / Ereignisse)
Ein Event ist eine gezogene Karte im Dungeon oder ein Story-Abschnitt. Es gibt zwei Haupt-Typen: **Entscheidungen (`choice`)** und **Kämpfe (`combat`)**.

### 8.1 Basis-Attribute (Gelten für alle Events)
* **`id`**: Der eindeutige interne Name (z.B. `"wald_begegnung_1"`).
* **`type`**: Entweder `"choice"` oder `"combat"`.
* **`text`**: Die Beschreibung, die im Event-Fenster angezeigt wird.
* **`name`**: (Optional) Die Überschrift der Karte / des Fensters.
* **`securityCost`**: (Optional) Wie viel Sicherheit abgezogen wird, wenn man diese Karte im Auswahl-Screen anklickt *(wird in Story-Welten ignoriert)*.
* **`minChaos` / `maxChaos`**: (Optional) Das Event taucht im Kartenpool nur auf, wenn das Chaos im Dungeon in diesem Bereich liegt.

### 8.2 Typ: `"choice"` (Multiple-Choice & Story-Dialoge)
Der wichtigste Event-Typ für Weggabelungen, Fallen, Loot oder reine Dialoge. Benötigt das Array **`choices`**, welches die klickbaren Buttons definiert.

**Attribute eines Buttons (in `choices`):**
* **`text`**: Der Text auf dem Button (z.B. `"Truhe öffnen"`).
* **`nextEvent`**: (Optional) Die ID des Events, das *als Nächstes* kommen soll.
    * *In Story-Welten:* Überspringt den Karten-Screen und lädt dieses Event sofort (für nahtlosen Lesefluss).
    * *In Boss-Welten:* Legt dieses Event in den Karten-Pool.
* **`effect`**: Was passiert, wenn man den Button drückt?

**Verfügbare Effekte (`effect`):**
* `"none"`: Nichts passiert. Man geht einfach weiter.
* `"exit"`: Beendet den Dungeon / die Story sofort und bringt den Spieler zurück ins Hideout.
* `"heal_X"`: Heilt den Spieler um X HP (z.B. `"heal_20"`).
* `"damage_X"`: Zieht dem Spieler X HP ab (z.B. `"damage_15"`).
* `"loot_ITEMID"`: Gibt dem Spieler das Item mit der passenden ID (z.B. `"loot_heil_trank_klein"`).
* `"death"`: **Sofortiger Tod!** Die HP fallen auf 0, der "DU BIST GESTORBEN"-Screen erscheint und der Dungeon ist fehlgeschlagen.

### 8.3 Typ: `"combat"` (Kämpfe)
Dieser Typ startet sofort einen Kampf.
* **`enemies`**: Ein Array mit den IDs der Gegner (z.B. `["goblin", "goblin"]`).
* **`enemyId`**: (Alternative) Die ID eines einzelnen Gegners (z.B. `"wolf"`).
* **`onWinEvent`**: (Optional) Die ID eines Events, das *nach dem Sieg* ausgelöst wird (funktioniert wie `nextEvent` bei den Buttons).

> **💡 Tipp: Flüssige Story-Reihenfolgen bauen** > Verknüpfe einfach `choice`- und `combat`-Events über das Attribut `nextEvent` (bei Buttons) bzw. `onWinEvent` (bei Kämpfen). Solange ein Event auf ein anderes verweist, wird der Spieler in einer Story-Welt nicht durch den "3-Karten-ziehen"-Bildschirm unterbrochen, sondern klickt sich wie in einem Buch fließend durch die Story!

---

## 9. `merchants` (Händler)
* **`id` / `name`**
* **`offers`**: Ein Array aus Objekten im Format `{ id: "item_oder_waffen_id", price: 50 }`.

## 10. `achievements` (Errungenschaften)
* **`id` / `name` / `description`**
* **`triggerType`**: Wann wird es ausgelöst? *(Aktuell unterstützt: `"boss_kill"`).*
* **`targetId`**: Die ID des Ziels (bei `"boss_kill"` ist es die `id` des Bosses aus den `enemies`).
* **`rewardText`**: Text, der im Menü angezeigt wird (z.B. "Schaltet den Händler XY frei").
* **`unlocksSkill`**: (Optional) ID der Fähigkeit, die man durch die Errungenschaft erhält.
* **`unlocksMerchant`**: (Optional) ID des Händlers, der auf dem Marktplatz auftauchen soll.