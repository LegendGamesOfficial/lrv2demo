import { Config } from '../core/Config.js';
import { CollisionUtils } from '../utils/CollisionUtils.js';
import { BuildingPiece } from './BuildingPiece.js';
import { BuildingPlacement } from './BuildingPlacement.js';
import { BuildingDestruction } from './BuildingDestruction.js';

/**
 * Coordinates player & bot building, raycasted edit mode (Door/Window/Half/Corner/Rotate/Reset),
 * trap triggers, destruction, ramp traversal, and raycast/movement collision boxes.
 */
export class BuildingManager {
  constructor(scene, assetManager) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.pieces = [];
    this.placement = new BuildingPlacement(scene);
    this.destruction = new BuildingDestruction();

    this.buildMode = false;
    this.selectedPiece = 'wall';
    this.extraRot = 0;

    this.editMode = false;
    this.editingPiece = null;
    this._lastPreviewValid = false;
    this._bindEditModal();
  }

  _bindEditModal() {
    const overlay = document.getElementById('edit-build-overlay');
    if (!overlay) return;
    overlay.querySelectorAll('[data-edit-shape]').forEach((btn) => {
      btn.onclick = () => {
        if (!this.editingPiece) return;
        this.confirmEdit(btn.dataset.editShape);
      };
    });
    const resetBtn = document.getElementById('btn-edit-reset');
    if (resetBtn) resetBtn.onclick = () => this.resetEdit();
    const cancelBtn = document.getElementById('btn-edit-cancel');
    if (cancelBtn) cancelBtn.onclick = () => this.closeEdit();
  }

  enterBuildMode(pieceType) {
    this.buildMode = true;
    if (pieceType) this.selectedPiece = pieceType;
  }

  exitBuildMode() {
    this.buildMode = false;
    if (this.placement && this.placement.previews) {
      for (const m of Object.values(this.placement.previews)) m.visible = false;
    }
  }

  rotate() {
    this.extraRot = (this.extraRot + Math.PI / 2) % (Math.PI * 2);
  }

  placePlayerPiece(player, inventory, audio, world) {
    const { valid, pos, rot } = this.placement.updatePreview(
      true, player, this.selectedPiece, this.extraRot, this.pieces, world
    );
    if (!valid || !pos) return false;

    if (this.selectedPiece === 'trap') {
      const trapIds = ['spike_trap', 'zap_trap', 'bouncer', 'launch_pad'];
      const chosen = trapIds.find((id) => (inventory.traps[id] || 0) > 0);
      if (!chosen) return false;
      inventory.traps[chosen] -= 1;
      const piece = new BuildingPiece({
        type: 'trap', x: pos.x, y: pos.y, z: pos.z, trapId: chosen, owner: 'player', assetManager: this.assetManager
      });
      this.scene.add(piece.mesh);
      this.pieces.push(piece);
      audio.sfx.build();
      return true;
    }

    player.wood -= Config.BUILD_COST;
    const piece = new BuildingPiece({
      type: this.selectedPiece, x: pos.x, y: pos.y, z: pos.z, rot, owner: 'player', assetManager: this.assetManager
    });
    this.scene.add(piece.mesh);
    this.pieces.push(piece);
    audio.sfx.build();
    return true;
  }

  placeBotWall(botId, x, y, z, rot, bots = []) {
    const GRID = Config.BUILD_GRID_SIZE;
    const gx = Math.round(x / GRID) * GRID;
    const gz = Math.round(z / GRID) * GRID;
    const gy = Math.max(0, Math.floor(y / GRID) * GRID);

    for (const b of bots) {
      if (b.alive && Math.hypot(b.x - gx, b.z - gz) < 1.3) return null;
    }
    for (const p of this.pieces) {
      if (p.alive && p.type === 'wall' && Math.abs(p.x - gx) < 0.5 && Math.abs(p.y - gy) < 0.5 && Math.abs(p.z - gz) < 0.5) return null;
    }

    const piece = new BuildingPiece({
      type: 'wall', x: gx, y: gy, z: gz, rot, owner: `bot_${botId}`, assetManager: this.assetManager
    });
    this.scene.add(piece.mesh);
    this.pieces.push(piece);
    return piece;
  }

  openEditForAimed(player, audio) {
    if (this.editMode) {
      this.closeEdit();
      return false;
    }

    // Raycast from player eye along camera aim direction to find the exact aimed piece
    const origin = { x: player.x, y: player.y + 1.65, z: player.z };
    const cp = Math.cos(player.pitch || 0);
    const aimDir = {
      x: -Math.sin(player.yaw) * cp,
      y: Math.sin(player.pitch || 0),
      z: -Math.cos(player.yaw) * cp
    };

    let target = null;
    let bestT = 9.0;

    for (const p of this.pieces) {
      if (!p.alive || p.owner !== 'player' || p.type === 'trap') continue;
      for (const box of p.getBoundingBoxes()) {
        const t = CollisionUtils.rayIntersectsAABB(origin, aimDir, box, bestT);
        if (t !== null && t < bestT) {
          bestT = t;
          target = p;
        }
      }
    }

    // Fallback: closest player-owned piece within 6.5m in front of the player
    if (!target) {
      const pos = this.placement.getGridPosition(player, 'wall');
      let bestDist = 6.5;
      for (const p of this.pieces) {
        if (!p.alive || p.owner !== 'player' || p.type === 'trap') continue;
        const d = Math.hypot(p.x - pos.x, p.z - pos.z) + Math.abs(p.y - pos.y) * 0.5;
        if (d < bestDist) {
          bestDist = d;
          target = p;
        }
      }
    }

    if (!target) return false;

    this.editMode = true;
    this.editingPiece = target;
    this._audioRef = audio;
    if (document.pointerLockElement) document.exitPointerLock();

    const overlay = document.getElementById('edit-build-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
      document.getElementById('edit-piece-title').textContent = `EDIT ${target.type.toUpperCase()}`;
      overlay.querySelectorAll('[data-for-type]').forEach((el) => {
        el.classList.toggle('hidden', el.dataset.forType !== target.type);
      });
    }
    return true;
  }

  confirmEdit(shape) {
    if (!this.editingPiece) return;
    this.editingPiece.applyEdit(shape);
    if (this._audioRef) this._audioRef.sfx.buildEdit();
    this.closeEdit();
  }

  resetEdit() {
    if (!this.editingPiece) return;
    this.editingPiece.applyEdit('full');
    if (this._audioRef) this._audioRef.sfx.buildEdit();
    this.closeEdit();
  }

  closeEdit() {
    this.editMode = false;
    this.editingPiece = null;
    const overlay = document.getElementById('edit-build-overlay');
    if (overlay) overlay.classList.add('hidden');
  }

  damagePiece(piece, amount, audio = null) {
    const destroyed = this.destruction.applyDamage(piece, amount, this.scene, this.pieces);
    if (destroyed && audio) audio.sfx.buildDestroy();
    return destroyed;
  }

  getSolidWallsNear(x, z, radius) {
    const out = [];
    for (const p of this.pieces) {
      if (!p.alive || p.type !== 'wall') continue;
      if (Math.hypot(p.x - x, p.z - z) <= radius) {
        out.push(...p.getBoundingBoxes());
      }
    }
    return out;
  }

  getRaycastBoxesNear(x, z, radius) {
    const out = [];
    for (const p of this.pieces) {
      if (!p.alive || p.type === 'trap') continue;
      if (Math.hypot(p.x - x, p.z - z) <= radius) {
        out.push(...p.getBoundingBoxes());
      }
    }
    return out;
  }

  getFloorHeightAt(x, y, z) {
    let maxH = -999;
    const GRID = Config.BUILD_GRID_SIZE;
    const half = GRID * 0.55;
    for (const p of this.pieces) {
      if (!p.alive) continue;
      if (Math.abs(p.x - x) < half && Math.abs(p.z - z) < half && y >= p.y - 1.0) {
        if (p.type === 'floor') {
          maxH = Math.max(maxH, p.y + 0.35);
        } else if (p.type === 'stairs') {
          // Interpolate height along ramp's local -Z (upward) direction
          const dx = x - p.x;
          const dz = z - p.z;
          const localZ = -dx * Math.sin(p.rot) + dz * Math.cos(p.rot);
          const t = Math.max(0, Math.min(1, (GRID * 0.5 - localZ) / GRID));
          maxH = Math.max(maxH, p.y + t * GRID * 0.85);
        }
      }
    }
    return maxH;
  }

  update(dt, player, bots, damageSystem, audio, onBotEliminated, world) {
    const res = this.placement.updatePreview(this.buildMode, player, this.selectedPiece, this.extraRot, this.pieces, world);
    this._lastPreviewValid = res.valid;

    for (const p of this.pieces) {
      if (!p.alive || p.type !== 'trap') continue;
      if (p.trapId === 'bouncer' && Math.hypot(p.x - player.x, p.z - player.z) < 2.2 && Math.abs(p.y - player.y) < 2) {
        player.vy = 22;
        player.grounded = false;
        audio.sfx.bounce();
      } else if (p.trapId === 'launch_pad' && Math.hypot(p.x - player.x, p.z - player.z) < 2.2 && Math.abs(p.y - player.y) < 2) {
        player.y += 4;
        player.vy = 28;
        player.setGliding(true);
        audio.sfx.bounce();
      } else if (p.trapId === 'spike_trap' || p.trapId === 'zap_trap') {
        const dmg = p.trapId === 'spike_trap' ? 100 : 50;
        for (const bot of bots) {
          if (bot.alive && !bot.isMate && Math.hypot(bot.x - p.x, bot.z - p.z) < 2.4) {
            damageSystem.applyBotDamage(bot, dmg, { attackerIsPlayer: true }, audio, onBotEliminated);
          }
        }
      }
    }
  }

  clear() {
    for (const p of this.pieces) this.scene.remove(p.mesh);
    this.pieces = [];
    this.buildMode = false;
    this.closeEdit();
  }
}
