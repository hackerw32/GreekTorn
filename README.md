# Χάος (Chaos) - Greek Text-Based RPG

A Greek-themed text-based browser RPG inspired by Torn City. Built with Vue 3, Pinia, and Vite.

**[Play Now](https://hackerw32.github.io/GreekTorn/)**

## About

Χάος is a single-player RPG set in the Greek underworld. You create a character, commit crimes, train at the gym, fight NPCs, travel across Greece, and build your criminal empire — all in Greek.

## Features

### Core Gameplay
- **Character Creation** — Allocate stat points (Strength, Speed, Dexterity, Defense)
- **Real-time Regeneration** — HP, Energy, Nerve, and Happiness regenerate over time
- **Activity System** — Time-based actions with live countdown timers and dice roll animations
- **Save System** — Auto-save to localStorage + JSON export/import

### Crime System
- 8 crime tiers from pickpocketing to antiquities trafficking
- Each crime takes real time (1-10 minutes)
- Pre-rolled dice results with animated reveal
- Risk of jail with escape and bribe mechanics (Φακελάκι)

### Gym & Training
- 4 stat categories with 5 exercises each (20 total)
- Exercises unlock as you level up
- Higher-tier exercises take longer but give better stat gains
- Happiness multiplier affects training results

### Combat
- 15 NPCs across 5 difficulty tiers
- Turn-based combat with detailed combat log
- Weapon and armor equipment system

### Jobs & Economy
- 7 Greek-themed jobs with 5 ranks each
- 7 property tiers (studio apartment to private island)
- Vault system for secure cash storage
- ~30 items: weapons, armor, medical supplies, drugs, misc

### Greek Cultural Mechanics
- **Φιλότιμο (Filotimo)** — Honor system that affects high-tier crimes and promotions
- **Μέσον (Meson)** — Connections that help with escapes and special actions
- **Φακελάκι (Fakelaki)** — Bribe system for getting out of jail

### Phase 2: Advanced Systems
- **Travel** — 7 Greek cities and islands (Athens, Thessaloniki, Patras, Heraklion, Mykonos, Santorini, Corfu) with unique location bonuses
- **Education** — University courses in IT, Law, Medicine, Sports, and Business that grant permanent bonuses
- **Casino** — 5 OPAP-style betting games with dice animations (Coin Flip, Dice, Lucky Dice, Number Guess, PROTO)
- **Stock Market** — 8 fictional Greek company stocks with live price fluctuations, dividends, and portfolio tracking

## Tech Stack

- **Vue 3** — Composition API with `<script setup>`
- **Pinia** — 12 modular stores with serialization/hydration
- **Vue Router** — Hash-based routing (Capacitor-ready)
- **Vite** — Fast builds and HMR
- **CSS Custom Properties** — Greek blue/white theme

## Development

```bash
npm install
npm run dev     # Start dev server at localhost:3000
npm run build   # Production build to dist/
```

## Deployment

Automatically deployed to GitHub Pages via GitHub Actions on every push to `main`.

## Future Plans

- Online multiplayer
- More drugs with cooldowns/addiction
- Current events integration
- Capacitor build for Android

## License

MIT
