import { Config } from './Config.js';
import { GamePhases } from './GameState.js';
import { PerformanceManager } from './PerformanceManager.js';
import { AnimationManager } from '../animation/AnimationManager.js';
import { Player } from '../player/Player.js';
import { PlayerMovement } from '../player/PlayerMovement.js';
import { PlayerCamera } from '../player/PlayerCamera.js';
import { PlayerController } from '../player/PlayerController.js';
import { ItemDefinitions } from '../inventory/ItemDefinitions.js';
import { Inventory } from '../inventory/Inventory.js';
import { PickupManager } from '../inventory/PickupManager.js';
import { LootManager } from '../inventory/LootManager.js';
import { ProjectileManager } from '../combat/ProjectileManager.js';
import { DamageSystem } from '../combat/DamageSystem.js';
import { WeaponManager } from '../combat/WeaponManager.js';
import { BuildingManager } from '../building/BuildingManager.js';
import { World } from '../world/World.js';
import { MapManager } from '../world/MapManager.js';
import { Minimap } from '../world/Minimap.js';
import { StormManager } from '../storm/StormManager.js';
import { BotManager } from '../bots/BotManager.js';
import { BotPerceptionDebug } from '../bots/BotPerceptionDebug.js';
import { DeveloperCamera } from '../dev/DeveloperCamera.js';
import { CinematicEnvironment } from '../dev/CinematicEnvironment.js';
import { BotStaging } from '../dev/BotStaging.js';
import { CharacterShowcase } from '../dev/CharacterShowcase.js';
import { CinematicControls } from '../dev/CinematicControls.js';
import { HUD } from '../ui/HUD.js';
import { MapUI } from '../ui/MapUI.js';
import { EmoteWheel } from '../ui/EmoteWheel.js';
import { InventoryOverlay } from '../ui/InventoryOverlay.js';
import { MatchResults } from '../ui/MatchResults.js';
import { eventBus } from './EventBus.js';

/**
 * Orchestrates the 3D Battle Royale match lifecycle, update loop, Developer Camera Mode, and clean teardown.
 */
export class Game {
  constructor({ assetManager, gameState, profile, xpManager, cosmeticManager, emoteManager, settings, audio, onMatchFinished }) {
    this.assetManager = assetManager;
    this.gameState = gameState;
    this.profile = profile;
    this.xpManager = xpManager;
    this.cosmeticManager = cosmeticManager;
    this.emoteManager = emoteManager;
    this.settings = settings;
    this.audio = audio;
    this.onMatchFinished = onMatchFinished;

    this.perf = new PerformanceManager();
    this.animManager = new AnimationManager();
    this.hud = new HUD();
    this.mapManager = new MapManager();
    this.mapUI = new MapUI(this.mapManager);
    this.emoteWheel = new EmoteWheel(emoteManager, audio);
    this.inventoryOverlay = new InventoryOverlay(audio);
    this.matchResults = new MatchResults(() => this._exitToLobby());

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controller = null;
    this.devCam = null;
    this.cinControls = null;
    this.botDebug = null;
    this._animId = null;
    this._clock = null;
    this._spawnTimer = 0;
    this._busProgress = 0;
    this._lastXP = 0;

    this._bindHUDButtons();
    this._bindDevEvents();
    eventBus.on('player:eliminated', () => {
      if (this.gameState.phase === GamePhases.PLAYING) this._endMatch(false);
    });
  }

  _bindHUDButtons() {
    document.getElementById('btn-hud-map').addEventListener('click', () => this._toggleMap());
    document.getElementById('btn-hud-emotes').addEventListener('click', () => this._toggleEmoteWheel());
    const invBtn = document.getElementById('btn-hud-inventory');
    if (invBtn) invBtn.addEventListener('click', () => this._toggleInventory());
  }

  _bindDevEvents() {
    eventBus.on('devcam:toggled', (enabled) => {
      if (!this.devCam || !this.cinControls) return;
      if (enabled) {
        this.devCam.enable();
        this.cinControls.show();
      } else {
        this.devCam.disable();
        this.cinControls.hide();
      }
    });
    eventBus.on('devcam:openPanel', () => {
      if (this.cinControls) this.cinControls.show();
    });
    eventBus.on('devcam:restorePlayer', () => {
      if (this.devCam) this.devCam.disable();
      if (this.cinControls) this.cinControls.hide();
    });
  }

  startMatch() {
    this.teardown();
    this.gameState.resetMatch();
    this.hud.clearKillFeed();
    this.inventoryOverlay.close();
    this.matchResults.hide();
    this.audio.music.stop();

    const THREE = window.THREE;
    const canvas = document.getElementById('game-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.settings.values.quality !== 'low' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x60a5fa);
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0014);
    this.perf.applyQualitySettings(this.renderer, this.scene, this.settings.values.quality);

    this.camera = new THREE.PerspectiveCamera(this.settings.values.fov || 72, window.innerWidth / window.innerHeight, 0.2, 1200);
    this._onResize = () => {
      if (!this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this._onResize);

    const hemi = new THREE.HemisphereLight(0xbae6fd, 0x365314, 0.88);
    const sun = new THREE.DirectionalLight(0xfff7ed, 1.28);
    sun.position.set(160, 240, 120);
    if (this.settings.values.quality === 'high') {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
    }
    this.scene.add(hemi, sun);

    this.itemDefs = new ItemDefinitions(this.assetManager.data.lootpool);
    this.inventory = new Inventory();
    this.pickupManager = new PickupManager(this.scene, this.assetManager);
    this.lootManager = new LootManager(this.scene, this.assetManager, this.itemDefs, this.pickupManager);
    this.world = new World(this.scene, this.assetManager, this.lootManager, this.pickupManager, this.itemDefs);
    this.world.build();

    this.buildingManager = new BuildingManager(this.scene, this.assetManager);
    this.projectiles = new ProjectileManager(this.scene, this.assetManager);
    this.damageSystem = new DamageSystem();
    this.weaponManager = new WeaponManager(this.inventory, this.projectiles, this.damageSystem, this.audio);

    this.player = new Player(this.assetManager);
    const user = this.profile.current;
    const gliderItem = this.cosmeticManager ? this.cosmeticManager.getEquipped('glider') : { color: '#475569', accent: '#eab308' };
    this.player.spawnInScene(
      this.scene,
      this.assetManager.getItemById(user.loadout.skin),
      gliderItem,
      this.animManager
    );
    this.playerMovement = new PlayerMovement();
    this.playerCamera = new PlayerCamera(this.camera, this.settings.values);
    this.minimap = new Minimap(document.getElementById('minimap-canvas'), this.mapManager);
    this.stormManager = new StormManager(this.scene);

    this.botManager = new BotManager(this.scene, this.assetManager, this.animManager);
    this.botManager.spawnAll(this.gameState.mode, this.world);
    this.botDebug = new BotPerceptionDebug(this.scene);

    this.devCam = new DeveloperCamera(this.camera, canvas);
    this.devCam.onExit = () => {
      this.devCam.disable();
      if (this.cinControls) this.cinControls.hide();
    };
    const cinEnv = new CinematicEnvironment(this.scene);
    const botStaging = new BotStaging(this.botManager, this.world, this.buildingManager);
    const charShowcase = new CharacterShowcase(this.assetManager, this.player);
    this.cinControls = new CinematicControls({
      devCam: this.devCam,
      cinEnv,
      botStaging,
      charShowcase,
      botDebug: this.botDebug,
      assetManager: this.assetManager,
      player: this.player,
      stormManager: this.stormManager,
      pois: this.world.poiManager.getPOIs(),
      onExitDevCam: () => {
        this.devCam.disable();
        this.cinControls.hide();
      }
    });

    if (this.settings.devCameraEnabled) {
      this.devCam.enable();
      this.cinControls.show();
    }

    this.controller = new PlayerController(canvas, this.settings.values);
    this.controller.bind(this.player, {
      isDevCamActive: () => this.devCam && this.devCam.enabled,
      isOverlayOpen: () => this.mapUI.isOpen || this.emoteWheel.isOpen || this.inventoryOverlay.isOpen || this.buildingManager.editMode || this.gameState.phase === GamePhases.MATCH_END,
      canDeployGlider: () => this.gameState.phase === GamePhases.SKYDIVING && this.player.y < 110 && !this.player.gliding,
      onToggleMap: () => this._toggleMap(),
      onToggleEmoteWheel: () => this._toggleEmoteWheel(),
      onToggleInventory: () => this._toggleInventory(),
      onSelectBuildPiece: (piece) => {
        if (this.buildingManager.buildMode && this.buildingManager.selectedPiece === piece) {
          this.buildingManager.exitBuildMode();
        } else {
          this.buildingManager.enterBuildMode(piece);
        }
      },
      onRotateOrReload: () => {
        if (this.buildingManager.buildMode) this.buildingManager.rotate();
        else this.weaponManager.startReload();
      },
      onInteract: () => this._handleInteract(),
      onEditBuild: () => this.buildingManager.openEditForAimed(this.player, this.audio),
      onNumberKey: (idx) => {
        this.buildingManager.exitBuildMode();
        this.inventory.selectSlot(idx);
        if (this.player.animator) this.player.animator.triggerSwitch();
      },
      onPrimaryAction: () => this._handlePrimaryAction(),
      onSecondaryAction: (down) => {
        if (this.buildingManager.buildMode && down) this.buildingManager.exitBuildMode();
        else this.player.aiming = down;
      }
    });

    this._spawnTimer = 0;
    this._busProgress = 0;
    this._clock = new THREE.Clock();
    this._loop();
  }

  _toggleMap() {
    if (this.gameState.phase === GamePhases.MATCH_END) return;
    this.mapUI.toggle();
    this.gameState.isMapOpen = this.mapUI.isOpen;
  }

  _toggleEmoteWheel() {
    if (this.gameState.phase === GamePhases.MATCH_END) return;
    this.emoteWheel.toggle(null, (em) => {
      if (this.player.animator) this.player.animator.triggerEmote(em.anim, 3.2);
    });
    this.gameState.isEmoteWheelOpen = this.emoteWheel.isOpen;
  }

  _toggleInventory() {
    if (this.gameState.phase === GamePhases.MATCH_END) return;
    this.inventoryOverlay.toggle(this.inventory, this.player, (idx) => {
      const dropped = this.inventory.dropSlot(idx);
      if (dropped && this.pickupManager && this.world) {
        const dropX = this.player.x - Math.sin(this.player.yaw) * 2.2;
        const dropZ = this.player.z - Math.cos(this.player.yaw) * 2.2;
        const dropY = this.world.getTerrainHeight(dropX, dropZ);
        this.pickupManager.spawnPickup(dropX, dropY, dropZ, dropped);
        eventBus.emit('ui:notify', `Dropped ${dropped.name}`);
      }
    });
    this.gameState.isInventoryOpen = this.inventoryOverlay.isOpen;
  }

  _handleInteract() {
    if (this.gameState.phase === GamePhases.BATTLE_BUS) {
      this.gameState.setPhase(GamePhases.SKYDIVING);
      this.player.x = this.world.busMesh.position.x;
      this.player.y = this.world.busMesh.position.y - 3;
      this.player.z = this.world.busMesh.position.z;
      this.player.vy = -8;
      return;
    }

    const opened = this.lootManager.tryOpenNearest(this.player.x, this.player.z, 4.5, this.audio);
    if (opened) {
      this.player.wood += 30;
      eventBus.emit('ui:notify', 'Opened Chest (+2 Loot, +30 Wood)');
      return;
    }

    const pIdx = this.pickupManager.findNearest(this.player.x, this.player.z, 3.6);
    if (pIdx !== -1) {
      const item = this.pickupManager.collectAt(pIdx, this.inventory, this.audio);
      if (item) eventBus.emit('ui:notify', `Picked up ${item.name}`);
    }
  }

  _handlePrimaryAction() {
    if (this.buildingManager.buildMode) {
      this.buildingManager.placePlayerPiece(this.player, this.inventory, this.audio, this.world);
      return;
    }
    const active = this.inventory.getActiveItem();
    if (!active) {
      this.world.envManager.harvestNearest(this.player.x, this.player.z, this.player, this.audio);
      return;
    }
    this.weaponManager.useActiveItem(
      this.player,
      this.botManager.bots,
      this.buildingManager,
      this.world,
      (bot, byPlayer) => this._onBotEliminated(bot, byPlayer)
    );
  }

  _onBotEliminated(bot, byPlayer) {
    this.gameState.aliveCount = Math.max(1, this.gameState.aliveCount - 1);
    if (byPlayer) this.player.kills += 1;
    const y = this.world.getTerrainHeight(bot.x, bot.z);
    this.pickupManager.spawnPickup(bot.x, y, bot.z, this.itemDefs.rollRandomLoot());
    if (this.gameState.aliveCount === 1 && this.player.health.alive) {
      this._endMatch(true);
    }
  }

  _endMatch(victory) {
    this.gameState.setPhase(GamePhases.MATCH_END);
    if (document.pointerLockElement) document.exitPointerLock();

    const placement = victory ? 1 : this.gameState.aliveCount;
    this._lastXP = this.xpManager.calculateMatchXP({ victory, placement, kills: this.player.kills });
    this.xpManager.awardXP(this._lastXP);

    this.matchResults.show({
      victory,
      placement,
      kills: this.player.kills,
      xpEarned: this._lastXP,
      mode: this.gameState.mode
    });
  }

  _exitToLobby() {
    this.teardown();
    this.onMatchFinished(this._lastXP);
  }

  _loop() {
    this._animId = requestAnimationFrame(() => this._loop());
    const rawDt = Math.min(0.05, this._clock.getDelta());
    this.perf.update(rawDt);

    const timeScale = (this.devCam && this.devCam.enabled && this.cinControls) ? this.cinControls.timeScale : 1.0;
    const dt = rawDt * timeScale;

    const phase = this.gameState.phase;
    const devActive = !!(this.devCam && this.devCam.enabled);
    const input = this.controller.getMovementInput(devActive);
    const totalBots = Config.BOT_COUNT || 19;

    if (dt > 0) {
      if (phase === GamePhases.SPAWN_ISLAND) {
        this._spawnTimer += dt;
        this.gameState.botsLoaded = Math.min(totalBots, Math.floor((this._spawnTimer / 2.6) * totalBots));
        this.hud.setBanner(`Spawn Island • Loading ${totalBots} Bots (${this.gameState.botsLoaded}/${totalBots})`);
        this.playerMovement.updateGround(this.player, input, this.world, null, this.audio, dt, this.buildingManager.buildMode);
        if (this.gameState.botsLoaded >= totalBots && this._spawnTimer > 2.8) {
          this.gameState.setPhase(GamePhases.BATTLE_BUS);
        }
      } else if (phase === GamePhases.BATTLE_BUS) {
        this._busProgress += dt * 0.065;
        this.world.busMesh.position.set(-420 + this._busProgress * 840, 145, -320 + this._busProgress * 640);
        this.player.x = this.world.busMesh.position.x;
        this.player.y = this.world.busMesh.position.y;
        this.player.z = this.world.busMesh.position.z;
        this.player.mesh.visible = false;
        this.botManager.updateBusAndDrops(dt, this.world.busMesh.position, this._busProgress, this.world);
        this.hud.setBanner('Battle Bus • Press [E] to Drop!');
        if (this._busProgress >= 1) this._handleInteract();
      } else if (phase === GamePhases.SKYDIVING) {
        this.player.mesh.visible = true;
        this._busProgress = Math.min(1, this._busProgress + dt * 0.065);
        this.world.busMesh.position.set(-420 + this._busProgress * 840, 145, -320 + this._busProgress * 640);
        this.botManager.updateBusAndDrops(dt, this.world.busMesh.position, this._busProgress, this.world);
        this.hud.setBanner(this.player.gliding ? 'Gliding • Land at a POI!' : 'Skydiving • [Space] to Deploy Glider');
        const landed = this.playerMovement.updateSkydive(this.player, input, this.world, dt);
        if (landed) this.gameState.setPhase(GamePhases.PLAYING);
      } else if (phase === GamePhases.PLAYING) {
        this.player.mesh.visible = true;
        this._busProgress = Math.min(1, this._busProgress + dt * 0.065);
        this.world.busMesh.position.set(-420 + this._busProgress * 840, 145, -320 + this._busProgress * 640);
        this.hud.setBanner(`Storm Circle ${this.stormManager.phaseIndex + 1} • ${this.stormManager.dmg} DMG/s`);
        this.weaponManager.update(dt, this.player);

        if (!devActive && this.controller.mouseDownL && !this.buildingManager.buildMode) {
          const it = this.inventory.getActiveItem();
          if (it && it.auto) this._handlePrimaryAction();
        }

        this.playerMovement.updateGround(this.player, input, this.world, this.buildingManager, this.audio, dt, this.buildingManager.buildMode);
        this.buildingManager.update(dt, this.player, this.botManager.bots, this.damageSystem, this.audio, (b, p) => this._onBotEliminated(b, p), this.world);
        this.pickupManager.update(dt);
        this.projectiles.update(dt, this.world, (gx, gy, gz) => {
          this.audio.sfx.explosion();
          for (const b of this.botManager.bots) {
            if (b.alive && !b.isMate && Math.hypot(b.x - gx, b.z - gz) < 11) {
              this.damageSystem.applyBotDamage(b, 100, { attackerIsPlayer: true }, this.audio, (bot, p) => this._onBotEliminated(bot, p));
            }
          }
        });

        this.botManager.update(
          dt,
          {
            scene: this.scene,
            player: this.player,
            bots: this.botManager.bots,
            stormManager: this.stormManager,
            world: this.world,
            pickupManager: this.pickupManager,
            buildingManager: this.buildingManager,
            projectileManager: this.projectiles,
            damageSystem: this.damageSystem,
            audio: this.audio,
            busPos: this.world.busMesh.position,
            busProgress: this._busProgress,
            onBotEliminated: (b, p) => this._onBotEliminated(b, p)
          },
          20
        );

        this.stormManager.update(dt, this.player, this.botManager.bots, this.damageSystem, this.audio, (b, p) => this._onBotEliminated(b, p));
      }

      this.player.syncTransform();
      this.animManager.update(dt);
    }

    if (devActive) {
      this.devCam.update(rawDt);
    } else {
      this.playerCamera.update(this.player, this.world.busMesh.position, phase === GamePhases.BATTLE_BUS, rawDt);
    }

    if (this.botDebug) this.botDebug.update(this.botManager.bots, this.player);

    const nearInteract =
      this.lootManager.hasNearbyClosedChest(this.player.x, this.player.z) ||
      this.pickupManager.findNearest(this.player.x, this.player.z) !== -1;

    this.hud.update({
      gameState: this.gameState,
      player: this.player,
      user: this.profile.current,
      inventory: this.inventory,
      stormManager: this.stormManager,
      buildingManager: this.buildingManager,
      nearInteract,
      fps: this.perf.fps
    });

    const pois = this.world.poiManager.getPOIs();
    this.minimap.render(this.player, this.stormManager, pois);
    this.mapUI.render(this.player, this.stormManager, pois);

    this.renderer.render(this.scene, this.camera);
  }

  teardown() {
    if (this._animId) {
      cancelAnimationFrame(this._animId);
      this._animId = null;
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }
    if (this.controller) this.controller.unbind();
    if (this.devCam) this.devCam.disable();
    if (this.cinControls) this.cinControls.hide();
    this.animManager.clear();
    if (this.scene) {
      this.perf.disposeScene(this.scene);
      this.scene = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}
