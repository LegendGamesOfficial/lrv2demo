# Legend Royale

**Exact Title:** `Legend Royale`

A modular, browser-based 3D Battle Royale game built with **Three.js**, **HTML5**, **CSS3**, and **ES6 Modules**, designed for static hosting on **GitHub Pages**.

## Key Features
- **Modular Architecture:** Clean separation across `core/`, `player/`, `animation/`, `bots/`, `combat/`, `inventory/`, `building/`, `world/`, `storm/`, `audio/`, `cosmetics/`, `ui/`, `lobby/`, `progression/`, `dev/`, and `utils/`.
- **Camera-Relative Player & Unified Animations:** Smooth separated `bodyYaw` vs `cameraYaw` orientation and coordinated hierarchical animations for both player and bots.
- **Fair Line-of-Sight Bot AI:** 6 personalities with FOV cones, terrain/building LOS raycasts, reaction delays, realistic spread, and build-aware combat.
- **Grid Building & Editing:** `Q` Wall, `F` Floor, `V` Ramp, `C` Cone, `R` Rotate, `G` Edit (Door, Window, Half-Wall, Corner Cutout, Ramp Rotate) with real collision updates.
- **Developer Camera Mode:** Free-fly cinematic camera, presets, temporary lighting/weather, slow-motion time-scale, bot staging, and one-click `HIDE HUD`.

## AUDIO FILE SETUP

1. **Folder to Create:** Place all audio files inside `assets/audio/` at the root of your repository.
2. **Supported Formats:** `.mp3` (recommended for all browsers and GitHub Pages).
3. **Exact Required Filenames:**
   - **Music:**
     - `assets/audio/music_lobby.mp3` — Loops in the Lobby and stops when a match begins
   - **Sound Effects:**
     - `assets/audio/player_footsteps.mp3` — Walking and running footsteps
     - `assets/audio/player_damage.mp3` — Player damage taken
     - `assets/audio/player_elimination.mp3` — Opponent elimination cue
     - `assets/audio/weapon_rifle_fire.mp3` — Assault Rifle & SCAR fire
     - `assets/audio/weapon_shotgun_fire.mp3` — Pump & Tactical Shotgun fire
     - `assets/audio/weapon_smg_fire.mp3` — SMG, Compact SMG, & Pistol fire
     - `assets/audio/weapon_sniper_fire.mp3` — Bolt-Action Sniper fire
     - `assets/audio/weapon_reload.mp3` — Weapon reload sound
     - `assets/audio/weapon_empty.mp3` — Dry-fire click when magazine is empty
     - `assets/audio/build_place.mp3` — Building placement sound
     - `assets/audio/build_edit.mp3` — Building edit confirmation sound
     - `assets/audio/build_destroy.mp3` — Building destruction sound
     - `assets/audio/item_pickup.mp3` — Item/weapon pickup sound
     - `assets/audio/chest_open.mp3` — Chest opening sound
     - `assets/audio/heal_use.mp3` — Healing, shield, & bush use sound
     - `assets/audio/storm_warning.mp3` — Storm shrink warning
     - `assets/audio/ui_click.mp3` — Menu & UI button click
4. **How to Replace a Sound:** Overwrite the corresponding `.mp3` file in `assets/audio/` keeping the exact filename, commit, and push to GitHub. Missing files log a developer warning in the browser console without crashing the game.

## Running Locally & Deploying to GitHub Pages
- **Local:** `npm start` (or `python3 -m http.server 8080`)
- **Tests:** `npm test`
- **GitHub Pages:** Push this folder to your repository root and enable **Settings -> Pages -> Deploy from a branch (`main`, `/ (root)`)**.
