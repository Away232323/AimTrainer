# Away Aim — Ranked Minecraft Aim Trainer

Browserbasierter Aim Trainer mit Account-System, globalem Leaderboard und 16-stufiger Ranked Ladder.

## Features

- Vier Drills: Reflex Flick, Strafe Lock, Microshot und Chaos
- Score, Accuracy, Reaction, Streaks und Session Stats
- Guest Progress via LocalStorage — kein Account nötig
- E-Mail/Passwort Accounts über Supabase Auth
- Globales Top-100 Leaderboard für Accounts
- Server-seitige Run-Validierung und RP-Berechnung über Supabase Edge Function
- Ranked Ladder: Copper I → Copper II → Copper III → Iron I → Iron II → Iron III → Gold I → Gold II → Gold III → Diamond I → Diamond II → Diamond III → Elite I → Elite II → Champion I → Master I
- Responsive UI

## GitHub Pages

Deployments laufen über GitHub Actions automatisch bei Pushes auf `main`.

URL: `https://away232323.github.io/AimTrainer/`

## Backend

Das Frontend nutzt ausschließlich einen öffentlichen Supabase Publishable Key. Passwörter werden von Supabase Auth verarbeitet und nicht in diesem Repository gespeichert. Schreibzugriffe auf Ranked Stats erfolgen über eine JWT-geschützte Edge Function.