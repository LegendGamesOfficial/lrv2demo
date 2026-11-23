import { eventBus } from '../core/EventBus.js';
import { Config } from '../core/Config.js';
import { InventoryUI } from './InventoryUI.js';

/**
 * Coordinates all in-game HUD bars (including top-left username & health), building status UI, alive/kill/storm counters, and kill feed.
 */
export class HUD {
  constructor() {
    this.inventoryUI = new InventoryUI(document.getElementById('hud-hotbar'));
    this._bindEvents();
  }

  _bindEvents() {
    eventBus.on('combat:elimination', ({ victim, byPlayer }) => {
      this.addKillFeed(byPlayer ? `You eliminated ${victim}!` : `${victim} was eliminated`);
    });
  }

  update({ gameState, player, user, inventory, stormManager, buildingManager, nearInteract, fps }) {
    document.getElementById('hud-alive').textContent = gameState.aliveCount;
    document.getElementById('hud-kills').textContent = player.kills;
    const mins = Math.floor(stormManager.timer / 60);
    const secs = Math.floor(stormManager.timer % 60).toString().padStart(2, '0');
    document.getElementById('hud-storm-timer').textContent = stormManager.shrinking ? 'SHRINK' : `${mins}:${secs}`;

    const hp = Math.ceil(player.health.hp);
    const shield = Math.ceil(player.health.shield);

    // Top-left username & health card
    const nameEl = document.getElementById('hud-player-username');
    if (nameEl && user) {
      nameEl.textContent = user.displayName || user.username || 'Guest';
    }
    const tlHpFill = document.getElementById('hud-tl-hp-fill');
    const tlHpText = document.getElementById('hud-tl-hp-text');
    const tlShieldFill = document.getElementById('hud-tl-shield-fill');
    const tlShieldText = document.getElementById('hud-tl-shield-text');
    if (tlHpFill) tlHpFill.style.width = `${player.health.hp}%`;
    if (tlHpText) tlHpText.textContent = `${hp} HP`;
    if (tlShieldFill) tlShieldFill.style.width = `${player.health.shield}%`;
    if (tlShieldText) tlShieldText.textContent = `${shield} SHD`;

    // Bottom-center bars
    document.getElementById('hud-shield-fill').style.width = `${player.health.shield}%`;
    document.getElementById('hud-shield-text').textContent = `${shield} / 100 SHIELD`;
    document.getElementById('hud-hp-fill').style.width = `${player.health.hp}%`;
    document.getElementById('hud-hp-text').textContent = `${hp} / 100 HP`;

    document.getElementById('hud-wood').textContent = player.wood;
    document.getElementById('hud-brick').textContent = player.brick;
    document.getElementById('hud-metal').textContent = player.metal;
    document.getElementById('hud-fps').textContent = `${fps} FPS`;

    document.getElementById('hud-interact').classList.toggle('hidden', !nearInteract);
    document.getElementById('hud-build-bar').classList.toggle('hidden', !buildingManager.buildMode);

    const statusEl = document.getElementById('hud-build-status');
    if (statusEl && buildingManager.buildMode) {
      const valid = buildingManager._lastPreviewValid;
      statusEl.textContent = `${buildingManager.selectedPiece.toUpperCase()} • Cost: ${Config.BUILD_COST} Wood • ${valid ? 'VALID' : 'INVALID'} • [R] Rotate [G] Edit`;
      statusEl.style.color = valid ? '#4ade80' : '#f87171';
    }

    document.querySelectorAll('.build-piece-pill').forEach((el) => {
      el.classList.toggle('active', el.dataset.piece === buildingManager.selectedPiece);
    });

    this.inventoryUI.render(inventory, (idx) => {
      buildingManager.exitBuildMode();
      inventory.selectSlot(idx);
      if (player.animator) player.animator.triggerSwitch();
    });
  }

  setBanner(text) {
    document.getElementById('hud-phase-banner').textContent = text;
  }

  addKillFeed(text) {
    const feed = document.getElementById('hud-kill-feed');
    if (!feed) return;
    const div = document.createElement('div');
    div.textContent = text;
    feed.appendChild(div);
    if (feed.children.length > 5) feed.removeChild(feed.firstChild);
  }

  clearKillFeed() {
    const feed = document.getElementById('hud-kill-feed');
    if (feed) feed.innerHTML = '';
  }
}
