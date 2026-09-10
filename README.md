# Away Aim Trainer

Ein Minecraft-inspirierter Aim Trainer, der direkt im Browser läuft.

## Modi

- **Flick** – statische Ziele springen nach jedem Klick an eine neue Position.
- **Strafe** – das Ziel bewegt sich seitlich und wird mit längeren Serien schneller.
- **Combo** – freie Bewegung in X/Y für schwereres Tracking und Reaktionstraining.

## Features

- Score, Accuracy, CPS, Streak und Reaktionszeit
- Einstellbare Bewegungsgeschwindigkeit, Zielgröße und Flick-Lifetime
- 15–120 Sekunden Sessions
- Personal Best pro Modus via LocalStorage
- Pause mit `ESC`
- Responsive Minecraft/PvP-inspiriertes UI
- Keine Anmeldung und kein Backend nötig

## Lokal starten

`index.html` im Browser öffnen oder einen lokalen Webserver verwenden.

## GitHub Pages veröffentlichen

GitHub erlaubt der verbundenen App nicht, Pages bei einem neuen Repository selbst zu aktivieren. Einmalig in GitHub:

1. `Settings` → `Pages`
2. Unter **Build and deployment** als Source **GitHub Actions** auswählen
3. Danach unter `Actions` den Workflow **Deploy GitHub Pages** manuell starten

Danach ist die geplante URL:

`https://away232323.github.io/AimTrainer/`
