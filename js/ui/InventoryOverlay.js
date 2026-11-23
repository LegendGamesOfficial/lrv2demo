import { Config } from '../core/Config.js';
import { eventBus } from '../core/EventBus.js';

/**
 * Controls the [I] Inventory overlay where players can click an item to drop it onto the map.
 */
export class InventoryOverlay {
  constructor(audio) {
    this.audio = audio;
    this.isOpen = false;
    this.overlay = document.getElementById('inventory-overlay');
    this.slotsEl = document.getElementById('inventory-modal-slots');
    this.ammoEl = document.getElementById('inventory-modal-ammo');
    const closeBtn = document.getElementById('btn-close-inventory');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
  }

  toggle(inventory, player, onDropSlot) {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(inventory, player, onDropSlot);
    }
  }

  open(inventory, player, onDropSlot) {
    this.isOpen = true;
    if (document.pointerLockElement) document.exitPointerLock();
    if (this.overlay) this.overlay.classList.remove('hidden');
    this.render(inventory, player, onDropSlot);
  }

  close() {
    this.isOpen = false;
    if (this.overlay) this.overlay.classList.add('hidden');
  }

  render(inventory, player, onDropSlot) {
    if (!this.slotsEl || !inventory) return;
    this.slotsEl.innerHTML = '';

    inventory.slots.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.className = `inv-drop-slot ${item ? '' : 'empty'}`;
      if (item) {
        btn.style.borderColor = Config.RARITY_COLORS[item.rarity || 1] || '#9ca3af';
        const sub = item.category === 'weapon'
          ? `${item.currentMag ?? item.mag}/${item.mag} • Click to Drop`
          : `x${item.qty || 1} • Click to Drop`;
        btn.innerHTML = `
          <div class="item-type-tag">SLOT ${idx + 1}</div>
          <div class="item-name">${item.name}</div>
          <div class="item-meta">${sub}</div>
        `;
        btn.addEventListener('click', () => {
          if (this.audio && this.audio.sfx) this.audio.sfx.click();
          if (onDropSlot) onDropSlot(idx);
          this.render(inventory, player, onDropSlot);
        });
      } else {
        btn.disabled = true;
        btn.innerHTML = `
          <div class="item-type-tag">SLOT ${idx + 1}</div>
          <div class="item-name" style="color:#64748b;">Empty</div>
        `;
      }
      this.slotsEl.appendChild(btn);
    });

    if (this.ammoEl) {
      this.ammoEl.innerHTML = `
        <span>Light: <b>${inventory.ammo.light || 0}</b></span>
        <span>Medium: <b>${inventory.ammo.medium || 0}</b></span>
        <span>Shells: <b>${inventory.ammo.shells || 0}</b></span>
        <span>Heavy: <b>${inventory.ammo.heavy || 0}</b></span>
        <span>Wood: <b>${player ? player.wood : 0}</b></span>
      `;
    }
    eventBus.emit('inventory:overlayToggled', this.isOpen);
  }
}
