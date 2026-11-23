import { HitDetection } from './HitDetection.js';
import { eventBus } from '../core/EventBus.js';

/**
 * Coordinates firing, spread, recoil, empty-mag click, reloading, consumables, and grenades for the player.
 */
export class WeaponManager {
  constructor(inventory, projectileManager, damageSystem, audio) {
    this.inventory = inventory;
    this.projectiles = projectileManager;
    this.damageSystem = damageSystem;
    this.audio = audio;
    this.cooldown = 0;
    this.reloading = false;
    this.reloadTimer = 0;
  }

  update(dt, player) {
    if (this.cooldown > 0) this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.reloading) {
      this.reloadTimer -= dt;
      if (player.animator) player.animator.state.isReloading = true;
      if (this.reloadTimer <= 0) {
        this._finishReload();
        if (player.animator) player.animator.state.isReloading = false;
      }
    }
  }

  startReload() {
    const item = this.inventory.getActiveItem();
    if (!item || item.category !== 'weapon' || this.reloading) return;
    const aType = this.inventory.getAmmoType(item.id);
    if ((item.currentMag ?? item.mag) >= item.mag || (this.inventory.ammo[aType] || 0) <= 0) return;

    this.reloading = true;
    this.reloadTimer = item.reloadTime || 1.5;
    this.audio.sfx.reload();
    eventBus.emit('ui:notify', `Reloading ${item.name}...`);
  }

  _finishReload() {
    this.reloading = false;
    const item = this.inventory.getActiveItem();
    if (!item || item.category !== 'weapon') return;
    const aType = this.inventory.getAmmoType(item.id);
    const needed = item.mag - (item.currentMag ?? item.mag);
    const take = Math.min(needed, this.inventory.ammo[aType] || 0);
    item.currentMag = (item.currentMag ?? item.mag) + take;
    this.inventory.ammo[aType] -= take;
    eventBus.emit('inventory:changed', this.inventory);
  }

  useActiveItem(player, bots, buildingManager, world, onBotEliminated) {
    const item = this.inventory.getActiveItem();
    if (!item) return;

    if (item.category === 'weapon') {
      if (this.reloading || this.cooldown > 0) return;
      if ((item.currentMag ?? item.mag) <= 0) {
        this.audio.sfx.empty();
        this.startReload();
        return;
      }
      this._fireWeapon(player, item, bots, buildingManager, world, onBotEliminated);
    } else if (item.category === 'heal') {
      let used = false;
      if (item.id === 'small_shield') used = player.health.addShield(25, 50);
      else if (item.id === 'shield_potion') used = player.health.addShield(50, 100);
      else if (item.id === 'med_kit') used = player.health.healHp(100, 100);
      else if (item.id === 'bandages') used = player.health.healHp(5, 75);
      if (used) {
        this.audio.sfx.heal();
        this.inventory.consumeActiveOne();
      }
    } else if (item.id === 'bush') {
      player.setInBush(true);
      this.audio.sfx.heal();
      this.inventory.consumeActiveOne();
    } else if (item.id === 'grenade') {
      const THREE = window.THREE;
      const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ')).normalize();
      this.projectiles.spawnGrenade(player.x, player.y + 1.7, player.z, dir);
      this.inventory.consumeActiveOne();
    }
  }

  _fireWeapon(player, item, bots, buildingManager, world, onBotEliminated) {
    const THREE = window.THREE;
    this.cooldown = item.fireRate || 0.2;
    item.currentMag = (item.currentMag ?? item.mag) - 1;
    this.audio.sfx.shoot(item.id);
    if (player.animator) player.animator.triggerShoot();

    player.pitch = Math.min(1.1, player.pitch + (item.id.includes('shotgun') ? 0.03 : 0.01));

    const dmgArr = item.damage || [25];
    const baseDmg = dmgArr[Math.min(dmgArr.length - 1, (item.rarity || 1) - 1)];
    const pellets = item.pellets || 1;
    const spread = (item.spread || 0.025) * (player.aiming ? 0.45 : 1);

    const dirBase = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ')).normalize();
    const origin = new THREE.Vector3(player.x, player.y + (player.crouch ? 1.2 : 1.75), player.z);
    const enemyBots = bots.filter((b) => b.alive && !b.isMate);

    const colliders = [];
    if (world) colliders.push(...world.getNearbyColliders(player.x, player.z, item.range || 150));
    if (buildingManager) colliders.push(...buildingManager.getRaycastBoxesNear(player.x, player.z, item.range || 150));

    for (let p = 0; p < pellets; p++) {
      const dir = dirBase.clone();
      dir.x += (Math.random() - 0.5) * spread;
      dir.y += (Math.random() - 0.5) * spread;
      dir.z += (Math.random() - 0.5) * spread;
      dir.normalize();

      const res = HitDetection.raycastShot(origin, dir, item.range || 150, enemyBots, colliders);
      const endPoint = origin.clone().add(dir.clone().multiplyScalar(res.distance));
      this.projectiles.spawnTracer(origin, endPoint);

      if (res.hitTarget) {
        const dmgPerPellet = (baseDmg / pellets) * (pellets > 1 ? 1.15 : 1);
        this.damageSystem.applyBotDamage(
          res.hitTarget,
          dmgPerPellet,
          { attackerIsPlayer: true, isHeadshot: res.isHeadshot },
          this.audio,
          onBotEliminated
        );
      } else if (res.hitBuild && buildingManager) {
        buildingManager.damagePiece(res.hitBuild, baseDmg / pellets, this.audio);
      }
    }
    eventBus.emit('inventory:changed', this.inventory);
  }
}
