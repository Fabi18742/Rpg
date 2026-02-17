System-Instruktion: RPG-Relaunch "Vanilla JS 2.0"
Projekt-Kontext:
Dieses Projekt ist ein Relaunch eines bestehenden JavaScript-Web-RPGs. Das Ziel ist ein Data-Driven Design, bei dem die Logik vollständig vom Content getrennt ist. Wir verzichten auf Frameworks (wie React) und setzen auf ein sauberes, modulares Vanilla JavaScript System.

IGNORIERE Z-CONTENTUpdate FOLDER

Architektur-Prinzipien:

1. Strict Logic-Content Separation: Alle Spieldaten (Items, Gegner, Skills, Quests) liegen ausschließlich in einer definitions.js. Die Engine darf keine hartcodierten Werte für spezifische Items enthalten.

2. State-Driven UI (Observer Pattern): Die Logik (Engine) ändert niemals direkt das DOM. Die Engine ändert nur ein zentrales State-Objekt. Die UI-Module "abonnieren" Änderungen am State und aktualisieren sich selbstständig.

3. Action-Pipeline: Berechnungen (z.B. Schaden) erfolgen über eine Pipeline, die Basis-Werte, Stats (Stärke, Verteidigung) und Modifikatoren (Crit, Buffs, Effekte) kombiniert.

4. Modulares System: Jedes System (Kampf, Inventar, Crawl, UI) ist ein eigenständiges ES6-Modul.

Daten-Struktur (Definitions):

1. Items/Waffen: Müssen erweiterbare Stats unterstützen (z.B. critChance, critMultiplier).

2. Effekte: Werden über Hooks definiert (z.B. onAttack, onTurnEnd), um das alte switch-case-System in der Engine zu ersetzen.

3. Events: Unterstützen rekursive Strukturen für Entscheidungsreihen (Quest-Ketten).

Aktueller technischer Fokus:

1. Implementierung einer StatCalculator-Klasse, die Entity-Werte (Player/Enemy) berechnet.

2. Umbau des Kampfsystems auf eine universelle ActionEngine.

Anweisungen für die KI:

1. Schlage keine innerHTML-Lösungen vor, die Logik und UI vermischen.

2. Priorisiere Wartbarkeit und Skalierbarkeit vor schnellen "Hacks".

3. Wenn du neuen Code schreibst, erkläre, in welches Modul er gehört und wie er mit dem globalen State kommuniziert.

4. Nutze das Observer-Pattern (Events/Signals), um die UI zu benachrichtigen.


Sobald diese drei „unsichtbaren“ Logik-Dateien perfekt funktionieren, kümmerst du dich um die UI. So stellst du sicher, dass dein „Gehirn“ (die Engine) sauber ist, bevor du das „Gesicht“ (die UI) baust.

rpg-relaunch/
├── index.html          # Der Einstiegspunkt (lädt main.js)
├── styles/
│   └── main.css        # Dein gesamtes UI-Styling (CSS)
├── src/
│   ├── main.js         # Initialisiert das Spiel und die Module
│   ├── data/
│   │   └── definitions.js  # DER CONTENT: Items, Gegner, Skills, Quests
│   ├── engine/         # DIE LOGIK: Rein mathematisch & funktional
│   │   ├── StateManager.js   # Verwaltet den Spielzustand (HP, Inventar)
│   │   ├── StatCalculator.js # Berechnet effektive Stats (Basis + Gear)
│   │   └── ActionEngine.js   # Berechnet Kämpfe und Skill-Effekte
│   └── ui/             # DAS GESICHT: Reagiert nur auf den State
│       ├── Component.js      # Basis-Klasse für UI-Elemente
│       ├── HUD.js            # Anzeige für HP, Gold, Level
│       ├── InventoryUI.js    # Darstellung des Inventars
│       └── BattleUI.js       # Kampf-Interface und Log
└── assets/             # Bilder, Icons und Sounds

src/data/definitions.js: Hier definierst du alles. Wenn du ein neues Item mit „Crit“-Stats willst, fügst du es hier einfach hinzu. Die Engine erkennt es automatisch.

src/engine/StateManager.js: Das „Gehirn“. Er hält den aktuellen Stand (player, currentEnemy). Wenn die ActionEngine Schaden berechnet, sagt sie dem StateManager Bescheid, und dieser benachrichtigt automatisch die UI.

src/engine/StatCalculator.js: Hier wird die Mathematik gemacht. Er rechnet: Basis-Stärke + Waffen-Bonus + Buff-Effekt = Endschaden. Hier implementierst du auch die neue Crit-Logik.

src/engine/ActionEngine.js: Hier liegt die Kampf-Logik. Sie weiß nicht, wie ein HP-Balken aussieht; sie berechnet nur, wer wen trifft und welche Effekte ausgelöst werden.

src/ui/: Diese Module hören auf den StateManager. Sobald sich die HP im State ändern, zeichnet z.B. HUD.js den Balken neu.