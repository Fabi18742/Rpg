# PixelGame - Browser-basiertes RPG

## 📋 Projektübersicht

Ein pixelbasiertes Browser-RPG, das auf Cloudflare gehostet wird. Der Fokus liegt auf Boss-Kämpfen, Tiererkundung und Fähigkeitenerwerb.

---

## 🎯 Spielkonzept

### Kernmechanik
1. **Bosse besiegen** → Drops erhalten
2. **Neue Tiere anlocken** → Fähigkeiten lernen
3. **Stärkere Bosse bekämpfen** → Bessere Tiere freischalten
4. **Progression Loop** → Kontinuierliche Verbesserung

---

## 🎨 Interface Design

| Bereich | Beschreibung | Verwendung |
|---------|--------------|------------|
| **Obere 2/3** | Visueller Bereich mit Pixel-Art Szenen | - Arena-Darstellung bei Kämpfen<br>- Gegner-Sprites<br>- HP-Balken & Level-Anzeige<br>- Scene-spezifische Bilder |
| **Unteres 1/3** | Interaktionsbereich | - Action-Buttons<br>- Navigation<br>- Spieler-Aktionen |

---

## 🏠 Game Screens

### Hideout (Hauptbereich)
Zentrale Anlaufstelle mit Zugang zu:
- **Shop** - Ausrüstung & Items kaufen
- **Boss-Auswahl** - Kämpfe starten
- **Tiererkundung** - Neue Tiere entdecken

### Kampf-Screen
- Pixel-Art Arena
- Gegner-Darstellung
- HP-Balken
- Aktions-Buttons

---

## 💾 Datenspeicherung

| Phase | Technologie | Beschreibung |
|-------|-------------|--------------|
| **Initial** | LocalStorage | Einfache clientseitige Speicherung |
| **Später** | Datenbank | Cloud-basierte persistente Speicherung |

---

## 🛠️ Technologie-Stack (Vanilla JS First)

### Spielmechanik
- **Point & Click basiert** - Keine Physik, keine Bewegung
- **Statische SVG-Grafiken** - Keine Animation, keine Sprites
- **UI-fokussiert** - Reine Interaktion über Buttons

### Technologien

| Komponente | Empfehlung | Begründung |
|------------|-----------|------------|
| **Frontend** | **Vanilla JS** + HTML/CSS | - Keine Dependencies<br>- Direkte DOM-Manipulation<br>- Maximale Performance<br>- Ausreichend für Point & Click |
| **Styling** | **Native CSS** | - Keine zusätzlichen Tools nötig<br>- CSS Grid/Flexbox für Layout<br>- CSS Variables für Theming |
| **State Management** | **Vanilla JS Objekte** | - Einfache JavaScript Objects<br>- Event System für Updates<br>- Keine externe Library nötig |
| **Datenspeicherung** | **LocalStorage API** | - Native Browser-API<br>- `JSON.stringify/parse` für Objekte<br>- Später: Cloudflare D1 |
| **SVG-Handling** | **Inline SVG** im HTML | - Direkt im DOM manipulierbar<br>- `document.querySelector()` für Zugriff<br>- Keine zusätzliche Library |
| **Alternative** | **Komplett ohne Build-Tool** | - Einfach `index.html` im Browser öffnen<br>- Noch simpler<br>- Perfekt für kleine Projekte |

### 🎯 Finaler Stack:

**Option A - Komplett Vanilla (Empfohlen zum Start):**
```
Frontend: Vanilla JavaScript + HTML + CSS
Dev: Browser direkt öffnen (index.html)
State: JavaScript Objects
SVG: Inline im HTML
Storage: LocalStorage API
Hosting: Cloudflare Pages (Files direkt hochladen)

### 📂 Projekt-Struktur:
```
/src
  /js
    - game.js       (Game State & Logic)
    - ui.js         (DOM Manipulation)
    - storage.js    (LocalStorage Wrapper)
  /css
    - styles.css    (Alle Styles)
  /assets
    /svg            (Deine SVG-Grafiken)
  index.html        (Entry Point)
---

## 🚀 Deployment auf Cloudflare

### Ohne Vite (Super einfach!)

1. **Dateien direkt hochladen:**
   - Gehe zu Cloudflare Pages Dashboard
   - "Upload assets" wählen
   - Alle Dateien (HTML/CSS/JS/SVG) hochladen
   - **Fertig!** URL: `dein-projekt.pages.dev`


## 📋 Deployment-Checkliste

**Ohne Vite:**
- [x] Ordner mit index.html, /js, /css, /assets erstellen
- [x] Game mit Vanilla JS entwickeln
- [x] SVG-Assets einbinden
- [x] Auf Cloudflare Pages hochladen
- [x] **Live! 🎉**


## ⚠️ Wichtige Hinweise

> **WICHTIG:** Keine Inhalte erfinden! Buttons und UI-Elemente mit Platzhaltern füllen (z.B. `platzhalter1`, `platzhalter2`, etc.)

## Checklist 
- Spieler soll in definitions definiert werden
- Für Debuggründe consoleausgabe wo die verrechnung im kampfangezeigt wird.
- Statspanel soll sich immer schließen wenn man anders fenster betritt. aktuell nur wenn man ins fähigkeiten menü geht. soll auch bei allen anderen zb Bossmenü sein
- Button um das Statspanel im Kampf anzuzeigen.
- Blocken soll sich logisch mit dem defense stat verrechnen und 1 AP kosten (Wenn man Blockt ist der Zug abgeschlossen wie als hätte man keine AP mehr, wenn man blockt und AP übrig hat soll das den Blockwert verhältnismäßig stärken).
- Wenn man eine Fähigkeit bekommt die man schon hat soll man anderes Item bekommen was man zB Verkaufen kann.


---

- Crawlsystem: Wenn man eine Bosswelt betritt soll man 100% Sicherheit haben. Nun Kann man aus Events wählen. Belohnende Events lassen die Sicherheit sinken. Kämpfe lassen sie im vergleich weniger sinken. Nach jedem Event wird gewürfelt ob der Boss nun erscheint. Es wird also über Zeit warscheinlicher das der Boss angreift. Bei großem Pech greift er auch früh an. Die Events sind zufallgeneriert für einen immer unterschiedlichen Ablauf. Wenn man stirbt dann soll man wieder im Hideout aufwachen. Mit hören Leveln sollen bessere Events erscheinen. 

---

Wenn man ein Ritual macht kombiniert man zB 6 Objekte in eine Fähigkeit. Wenn man 3 Feuer und 3 Eis Items kombiniert dann ist es 50% welche Art die Fähigkeit wird. Bei 2 Feuer 4 Eis dementsprechend 30% Feuer und 70% Eis. Außerdem hat jedes Item eine MagieValue die bestimmt wie wertvoll das Item zum kombinieren ist. Alle Values der 6 Items werden zusammengerechnet und bestimmen wie hoch der Wert der Fähigkeit ca wird. Wenn ich also 6 Items mit der Value 1 verbinde kann nur eine Fähigkeit entstehen die sehr schwach ist. Wenn ich 6 Items mit Value 10 verbinde dann kommt eine sehr starke Fähigkeit raus weil der kombinierte wert 60 (maximum) ist.

Ein eigenes Waffen feld wird abgeschaffen und dafür sind die 4 Fähigkeiten Waffen / Zauber Slots. So bekommt man anstatt fähigkeiten waffen die man dann ausrüsten kann. die waffen gibts dann in unterschiedlichen zuständen für builds

---

## 🔮 Das Ritual-System

### Konzept
Das Ritual ermöglicht es, aus 6 speziellen Ritual-Items eine Waffe mit potenziellen Effekten zu erschaffen. Die Items bestimmen sowohl die Stärke (Tier) der Waffe als auch die Wahrscheinlichkeit für zusätzliche Effekte.

### System-Mechanik

#### 1. Item-Eigenschaften
Jedes Ritual-Item besitzt zwei wichtige Werte:
- **value** (1-10): Bestimmt die Power und damit das Tier
- **modifierType**: Bestimmt die Effekt-Chance ("none", "testdamage", etc.)

#### 2. Power-Score Berechnung
```
Power-Score = Summe aller values der 6 Items
Minimum: 6  (6x value:1)
Maximum: 60 (6x value:10)
```

#### 3. Tier-Zuordnung
Der Power-Score bestimmt das Waffen-Tier:

| Power-Score | Tier | Beschreibung |
|-------------|------|--------------|
| 6 - 25      | 1    | Schwache Waffen (z.B. Dolch) |
| 26 - 45     | 2    | Mittlere Waffen (z.B. Schwert) |
| 46 - 60     | 3    | Starke Waffen (z.B. Gummischwert) |

#### 4. Waffen-Auswahl
Jede Waffe hat einen `ritualValue`:
- Das Ritual wählt automatisch die Waffe aus dem passenden Tier
- Die Waffe mit dem **nächstliegenden ritualValue** zum Power-Score wird gewählt

**Beispiele:**
- Power-Score: 15 → Tier 1 → Dolch (ritualValue: 15)
- Power-Score: 35 → Tier 2 → Schwert (ritualValue: 35)
- Power-Score: 55 → Tier 3 → Gummischwert (ritualValue: 55)

#### 5. Effekt-Wahrscheinlichkeit
Die Modifier-Types bestimmen die Chance auf Effekte:

**Formel:**
```
Wahrscheinlichkeit = (Anzahl Items mit Typ) ÷ 6
```

**Beispiele:**

| Items | Testdamage-Chance | Erklärung |
|-------|------------------|-----------|
| 0 Testdamage, 6 None | 0% | Keine Effekt-Chance |
| 1 Testdamage, 5 None | 16.7% (1/6) | 1 von 6 Items |
| 3 Testdamage, 3 None | 50% (3/6) | Hälfte der Items |
| 6 Testdamage, 0 None | 100% (6/6) | Alle Items |

**Wichtig:** Items mit `modifierType: "none"` zählen explizit mit und verringern die Effekt-Chance!

#### 6. Mehrere Modifier-Typen
Wenn verschiedene Modifier-Typen verwendet werden, wird **für jeden Typ separat gewürfelt**:

**Beispiel:**
- 3 Items "testdamage"
- 2 Items "poison"
- 1 Item "none"

Würfel-Chancen:
- Testdamage: 50% (3/6)
- Poison: 33.3% (2/6)

Mögliche Ergebnisse:
- Keine Effekte (beide Würfe scheitern)
- Nur Testdamage (nur erster Wurf erfolgreich)
- Nur Poison (nur zweiter Wurf erfolgreich)
- **Beide Effekte** (beide Würfe erfolgreich)

### Strategien

#### Schwache Tier-1-Waffe ohne Effekt
```
6x ritualItem_weak_none
→ Power-Score: 6
→ Tier 1
→ 0% Effekt-Chance
```

#### Starke Tier-3-Waffe mit garantiertem Effekt
```
6x ritualItem_strong_testdamage
→ Power-Score: 60
→ Tier 3
→ 100% Testdamage-Effekt
```

#### Mittlere Tier-2-Waffe mit 50% Effekt
```
3x ritualItem_medium_none
3x ritualItem_medium_testdamage
→ Power-Score: 30
→ Tier 2
→ 50% Testdamage-Effekt
```

#### Gemischte Strategie
```
2x ritualItem_weak_none (value: 1)
2x ritualItem_medium_testdamage (value: 5)
2x ritualItem_strong_testdamage (value: 10)
→ Power-Score: 32
→ Tier 2
→ 66.7% Testdamage-Effekt (4/6)
```

### Verfügbare Test-Items

| Item | Value | Modifier | Kosten |
|------|-------|----------|--------|
| Schwaches Ritual-Item (Neutral) | 1 | none | 0 Glitzer |
| Schwaches Ritual-Item (Schaden) | 1 | testdamage | 0 Glitzer |
| Mittleres Ritual-Item (Neutral) | 5 | none | 0 Glitzer |
| Mittleres Ritual-Item (Schaden) | 5 | testdamage | 0 Glitzer |
| Starkes Ritual-Item (Neutral) | 10 | none | 0 Glitzer |
| Starkes Ritual-Item (Schaden) | 10 | testdamage | 0 Glitzer |

**Alle Test-Items sind kostenlos im Shop beim Testhändler erhältlich!**

### Ablauf

1. **"Das Ritual" Button** im Hideout öffnen
2. **6 Ritual-Items** aus dem Inventar auswählen
3. **"Ritual durchführen"** klicken
4. **Items werden verbraucht** (aus Inventar entfernt)
5. **Waffe wird erschaffen** und automatisch zum Inventar hinzugefügt
6. **Effekte** werden basierend auf Wahrscheinlichkeiten angewendet

### Zukunftserweiterungen
- Weitere Modifier-Typen (Poison, Fire, Ice, etc.)
- Mehr Waffen in jedem Tier-Pool
- Spezielle Ritual-Events mit Boni
- Kombinierte Effekt-Synergien
