# RPG Engine - Modding Handbuch (`definitions.js`)

In der Datei `definitions.js` wird der gesamte Inhalt des Spiels definiert. Die Engine liest diese Daten automatisch aus. Hier ist die genaue Erklärung, welche Attribute (Eigenschaften) dir zur Verfügung stehen.

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
Alles, was ins normale Inventar geht.
* **`id`**: Eindeutiger interner Name (z.B. `"potion_small"`).
* **`name`**: Anzeigename im Spiel.
* **`type`**: Art des Items:
    * `"armor"`: Wird angezogen und gibt Rüstung.
    * `"consumable"`: Kann getrunken/benutzt werden.
    * `"material"`: Verkaufs- oder Quest-Item.
    * `"ritual"`: Kann im Ritualmenü verwendet werden.
* **`description`**: Beschreibungstext.
* **`value` / `goldValue`**: Preis beim Händler (Kauf/Verkauf).
* *Spezifische Attribute (je nach Typ):*
    * **`defense`** *(nur Rüstung)*: Wie viel Schaden blockt sie?
    * **`effect`** *(nur Consumable)*: Was tut es beim Nutzen? (Aktuell: `"heal"`).
    * **`value`** *(nur bei effect: "heal")*: Wie viele HP werden geheilt?
    * **`ritualValue`** *(nur Ritual)*: Power-Wert für das Ritual (Gibt an, welche Waffe entsteht).
    * **`modifierType`** *(nur Ritual)*: Welchen Effekt bekommt die hergestellte Waffe? Verweist auf eine ID aus den `effects`.

## 3. `weapons` (Waffen)
* **`id` / `name` / `description` / `value`**: Wie bei Items.
* **`type`**: Muss `"weapon"` sein.
* **`damageType`**: Art des Schadens (`"schlitz"`, `"stich"`, `"hieb"`). Wichtig für Schwächen der Gegner!
* **`damage`**: Grundschaden der Waffe.
* **`critChance`**: Bonus-Crit-Chance der Waffe in %.
* **`ritualValue`**: Welchen Gesamt-Power-Wert (aus Ritual Items) braucht man, um diese Waffe herzustellen?

## 4. `effects` (Status- & Waffeneffekte)
Passive Effekte, die auf Rüstungen, Waffen oder Ritual-Waffen liegen können.
* **`id` / `name` / `description`**
* **`type`**: 
    * `"stat_boost"`: Erhöht dauerhaft einen Wert (braucht `stat` z.B. `"damage"`, `"defense"` und `value`).
    * `"on_hit"`: Passiert, wenn man angreift.
* *Wenn Typ `"on_hit"` ist, braucht es einen `trigger`:*
    * `trigger: "apply_status"`: Belegt Gegner mit einem Zustand (z.B. Gift). Braucht `statusId`, `statusType` (z.B. `"dot"` = Damage over Time), `baseDamage`, `stacksToApply` und `applyChance` (0.0 bis 1.0).
    * `trigger: "heal_attacker"`: Vampirismus. Braucht `value` (z.B. `0.2` = heilt 20% des angerichteten Schadens).

## 5. `abilities` (Fähigkeiten)
Skills, die man ausrüsten kann.
* **`id` / `name`**
* **`type`**: `"attack"` (Schaden) oder `"heal"` (Heilung).
* **`text`**: Verb für das Kampflog (z.B. `"schwingt die Waffe"` -> *"Du schwingst die Waffe..."*).
* **`apCost`**: Wie viele AP kostet der Einsatz?
* *Spezifische Attribute:*
    * **`damageMult`** *(nur attack)*: Multiplikator (1.5 = 150% deines Gesamtschadens).
    * **`accuracy`** *(nur attack)*: Trefferchance (1.0 = 100%, 0.7 = 70%).
    * **`isAoE`** *(nur attack, optional)*: Wenn `true`, trifft der Angriff alle Gegner gleichzeitig.
    * **`value`** *(nur heal)*: Fixe Anzahl geheilter HP.

## 6. `enemies` (Gegner & Bosse)
* **`id` / `name`**
* **`hp`**: Leben.
* **`strength`**: Schaden.
* **`defense`**: Rüstungswert.
* **`xp`**: Erfahrungspunkte beim Tod.
* **`gold`**: Gold-Drop.
* **`weaknesses` / `resistances`**: Array aus Strings (z.B. `["schlitz"]`). Ein Angriff dieses Typs macht +30% oder -30% Schaden.
* **`lootTable`**: Array aus Objekten `{ itemId: "ID", chance: 0.8 }`. (0.8 = 80% Drop-Chance).

## 7. `worlds` (Dungeons & Gebiete)
* **`id` / `name` / `description`**
* **`type`**: (Optional). Wenn `"story"`, taucht am Ende kein Boss auf, wenn die Sicherheit auf 0 fällt, sondern man flieht automatisch.
* **`baseSecurity`**: Startwert des Sicherheitsbalkens.
* **`bossId`**: Welcher Gegner erscheint, wenn Sicherheit 0 ist oder am Ende des Dungeons?
* **`requiredAchievement`**: Welche Errungenschaft muss freigeschaltet sein, um diese Welt zu betreten? (Wenn null, ist sie von Anfang an offen).
* **`events`**: Array mit Event-IDs, die in diesem Dungeon als Karten gezogen werden können (Der "Kartenpool").

## 8. `events` (Crawl-Karten / Ereignisse)
Die Karten, die man im Dungeon auswählt.
* **`id` / `text`**: Interne ID und Text auf der Karte.
* **`securityCost`**: Wie viel Sicherheit (Grüner Balken) kostet das Anklicken?
* **`minChaos` / `maxChaos`**: (Optional). Die Karte taucht nur auf, wenn das Chaos in diesem Bereich ist.
* **`type`**: 
    * `"combat"`: Startet sofort einen Kampf. Braucht `enemies` (Array z.B. `["goblin", "goblin"]`) oder `enemyId` (einzelner Gegner).
    * `"choice"`: Ein Story-Event. Braucht `name` (Überschrift) und `choices` (Array von Button-Auswahlen).
* *Spezifische Attribute:*
    * **`onWinEvent`** *(nur combat)*: Welche Event-ID soll in den Pool gelegt werden, wenn der Kampf gewonnen ist? (Für Questreihen).
    * **`choices`** *(nur choice)*: Array aus Objekten `{ text: "Buttontext", effect: "...", nextEvent: "ID" }`.

**Mögliche `effect` Strings in Choices:**
* `"none"`: Nichts passiert.
* `"exit"`: Man verlässt den Dungeon erfolgreich mit dem ganzen Loot.
* `"heal_20"`: Heilt 20 HP.
* `"damage_10"`: Fügt 10 direkten Schaden zu.
* `"loot_item_id"`: Gibt das Item (Ersetze `item_id` mit der echten ID, z.B. `"loot_potion_small"`).

## 9. `merchants` (Händler)
* **`id` / `name`**
* **`offers`**: Ein Array aus `{ id: "item_oder_waffen_id", price: 50 }`.

## 10. `achievements` (Errungenschaften)
* **`id` / `name` / `description`**
* **`triggerType`**: Wann wird es ausgelöst? *(Aktuell unterstützt: `"boss_kill"`).*
* **`targetId`**: Die ID des Ziels (bei `"boss_kill"` ist es die `id` des Bosses aus den `enemies`).
* **`rewardText`**: Text, der angezeigt wird ("Schaltet XY frei").
* **`unlocksSkill`**: (Optional) ID der Fähigkeit, die man dadurch erhält.
* **`unlocksMerchant`**: (Optional) ID des Händlers, der auf dem Marktplatz auftauchen soll.