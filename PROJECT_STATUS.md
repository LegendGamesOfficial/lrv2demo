# Legend Royale — Project Status & Migration Tracker

## Architecture Overview
Restructured from a 4-script prototype (`audio.js`, `models.js`, `lobby.js`, `game.js`) into a modular ES6 architecture compatible with GitHub Pages.

## Security & Backend Limitation Notice
Because GitHub Pages serves static client-side files only, `accounts/accounts.json`, `localStorage` (`lr_accounts_v1`), L-Bucks balances, and Item Shop purchases are **client-side local progression only**. Before any commercial release, authentication, currency ledgers, inventory ownership, and shop transactions must be moved to an authoritative backend server.

## Batch Progress
- [x] Batch 1: Core Foundation (`package.json`, `.gitignore`, `PROJECT_STATUS.md`, `js/core/EventBus.js`, `js/core/Config.js`, `js/utils/MathUtils.js`)
- [x] Batch 2: Utils, Core State & Asset/Performance Managers (`CollisionUtils.js`, `ObjectPool.js`, `GameState.js`, `AssetManager.js`, `PerformanceManager.js`)
- [x] Batch 3: Progression, SaveManager & Cosmetics Preview System
- [x] Batch 4: Audio Architecture (Music, SFX, Ambient, Volume Controls)
- [x] Batch 5: Animation System & Stylized Procedural Character/Weapon Models
- [x] Batch 6: Player Controller, Camera, Movement & Health
- [x] Batch 7: Combat, Weapons, Projectiles, Hit Detection & Inventory/Loot
- [x] Batch 8: Building System & World/Terrain/POI/Map/Minimap
- [x] Batch 9: Storm System & 99-Bot Personality AI System
- [x] Batch 10: Lobby, Locker, Shop, Battle Pass, HUD, MapUI, EmoteWheel, CSS, `index.html`, `main.js` & Tests
