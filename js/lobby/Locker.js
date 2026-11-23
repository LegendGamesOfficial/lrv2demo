import { eventBus } from '../core/EventBus.js';

const BANNER_ICONS = {
  crown: '👑', star: '★', skull: '💀', bolt: '⚡', shield: '🛡️', flame: '🔥', target: '🎯', sword: '⚔️'
};
const ITEM_COLORS = ['#64748b', '#2563eb', '#dc2626', '#16a34a', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4', '#f8fafc', '#18181b'];

/**
 * Locker screen controller: outfits, pickaxe color, glider color, banner icon/color, and 8 emote slots (all emotes unlocked).
 */
export class Locker {
  constructor(assetManager, profile, cosmeticManager, skinManager, emoteManager, preview, audio) {
    this.assetManager = assetManager;
    this.profile = profile;
    this.cosmeticManager = cosmeticManager;
    this.skinManager = skinManager;
    this.emoteManager = emoteManager;
    this.preview = preview;
    this.audio = audio;
    this.category = 'skin';
    this.selectedEmoteSlot = 0;
  }

  render() {
    const user = this.profile.current;
    if (!user) return;

    const loadoutEl = document.getElementById('locker-loadout-slots');
    const emotesEl = document.getElementById('locker-emote-slots');
    const pickerEl = document.getElementById('locker-item-picker');
    const bannerEl = document.getElementById('locker-banner-controls');

    const activeSkin = this.assetManager.getItemById(user.loadout.skin);
    const slots = [
      { key: 'skin', label: 'Outfit', val: (activeSkin && activeSkin.name) || 'Default Skin 1' },
      { key: 'pickaxeColor', label: 'Pickaxe Color', val: `<span class="color-dot" style="background:${user.loadout.pickaxeColor || '#64748b'}"></span> Custom` },
      { key: 'gliderColor', label: 'Glider Color', val: `<span class="color-dot" style="background:${user.loadout.gliderColor || '#475569'}"></span> Custom` },
      { key: 'banner', label: 'Banner Icon', val: BANNER_ICONS[user.loadout.bannerIcon] || '★' }
    ];

    loadoutEl.innerHTML = '';
    slots.forEach((s) => {
      const b = document.createElement('button');
      b.className = `loadout-slot ${this.category === s.key ? 'selected' : ''}`;
      b.innerHTML = `<div class="item-type-tag">${s.label}</div><div class="item-name">${s.val}</div>`;
      b.addEventListener('click', () => {
        this.audio.sfx.click();
        this.category = s.key;
        this.syncPreview();
        this.render();
      });
      loadoutEl.appendChild(b);
    });

    emotesEl.innerHTML = '';
    user.loadout.emotes.forEach((emId, idx) => {
      const b = document.createElement('button');
      const em = emId ? this.assetManager.getItemById(emId) : null;
      b.className = `emote-slot-btn ${this.category === 'emote' && this.selectedEmoteSlot === idx ? 'selected' : ''}`;
      b.textContent = `Slot ${idx + 1}: ${em ? em.name : 'Empty'}`;
      b.addEventListener('click', () => {
        this.audio.sfx.click();
        this.category = 'emote';
        this.selectedEmoteSlot = idx;
        this.syncPreview();
        this.render();
      });
      emotesEl.appendChild(b);
    });

    pickerEl.innerHTML = '';
    bannerEl.innerHTML = '';

    if (this.category === 'banner') {
      Object.entries(BANNER_ICONS).forEach(([key, icon]) => {
        const b = document.createElement('button');
        b.className = `btn-fn ${user.loadout.bannerIcon === key ? 'btn-yellow' : 'btn-dark'}`;
        b.style.padding = '8px 12px';
        b.textContent = icon;
        b.addEventListener('click', () => {
          this.audio.sfx.click();
          this.cosmeticManager.setBanner(key, null);
          this.render();
        });
        bannerEl.appendChild(b);
      });
      ITEM_COLORS.forEach((col) => {
        const sw = document.createElement('button');
        sw.className = 'color-swatch';
        sw.style.background = col;
        sw.addEventListener('click', () => {
          this.audio.sfx.click();
          this.cosmeticManager.setBanner(null, col);
          this.render();
        });
        bannerEl.appendChild(sw);
      });
    } else if (this.category === 'pickaxeColor' || this.category === 'gliderColor') {
      const isPickaxe = this.category === 'pickaxeColor';
      const currentCol = isPickaxe ? (user.loadout.pickaxeColor || '#64748b') : (user.loadout.gliderColor || '#475569');
      const title = document.createElement('div');
      title.className = 'item-meta';
      title.style.width = '100%';
      title.textContent = `Choose your ${isPickaxe ? 'Pickaxe' : 'Glider'} color:`;
      bannerEl.appendChild(title);

      ITEM_COLORS.forEach((col) => {
        const sw = document.createElement('button');
        sw.className = 'color-swatch';
        sw.style.background = col;
        if (currentCol.toLowerCase() === col.toLowerCase()) {
          sw.style.outline = '3px solid #fde047';
        }
        sw.addEventListener('click', () => {
          this.audio.sfx.click();
          if (isPickaxe) this.cosmeticManager.setPickaxeColor(col);
          else this.cosmeticManager.setGliderColor(col);
          this.syncPreview();
          this.render();
        });
        bannerEl.appendChild(sw);
      });
    } else {
      if (this.category === 'emote' && user.loadout.emotes[this.selectedEmoteSlot]) {
        const unequipBtn = document.createElement('button');
        unequipBtn.className = 'btn-fn btn-dark';
        unequipBtn.style.padding = '8px 12px';
        unequipBtn.textContent = 'UNEQUIP SLOT';
        unequipBtn.addEventListener('click', () => {
          this.audio.sfx.click();
          this.emoteManager.unequipEmote(this.selectedEmoteSlot);
          this.render();
        });
        bannerEl.appendChild(unequipBtn);
      }

      const items = this.assetManager.data.items.filter((i) => i.type === this.category);
      items.forEach((item) => {
        const owned = this.profile.ownsItem(item.id);
        const isEquipped =
          (item.type === 'emote' && user.loadout.emotes[this.selectedEmoteSlot] === item.id) ||
          (item.type !== 'emote' && user.loadout[item.type] === item.id);

        const card = document.createElement('button');
        card.className = `item-card rarity-${item.rarity || 1}`;
        card.style.cursor = 'pointer';
        card.style.textAlign = 'left';
        card.style.opacity = owned ? '1' : '0.62';
        card.innerHTML = `
          <div class="item-type-tag">${isEquipped ? 'EQUIPPED' : owned ? item.type : 'PREVIEW (LOCKED)'}</div>
          <div class="item-name">${item.name}</div>
        `;
        card.addEventListener('click', () => {
          this.audio.sfx.click();
          if (item.type === 'emote') {
            this.preview.playEmote(item.anim, 3.6);
            this.audio.sfx.emote();
            this.emoteManager.equipEmote(this.selectedEmoteSlot, item.id);
          } else if (owned) {
            this.cosmeticManager.equipItem(item.id);
            this.syncPreview();
          } else {
            this.preview.showCharacter({
              skinItem: item,
              pickaxeItem: this.cosmeticManager.getEquipped('pickaxe'),
              gliderItem: this.cosmeticManager.getEquipped('glider'),
              mode: 'character',
              offsetX: 1.35
            });
            eventBus.emit('ui:notify', `Previewing ${item.name}`);
          }
          this.render();
        });
        pickerEl.appendChild(card);
      });
    }

    const label = document.getElementById('locker-preview-label');
    label.textContent = `Outfit: ${(activeSkin || {}).name || 'Default'} • Drag to Rotate, Scroll to Zoom`;
  }

  syncPreview() {
    const user = this.profile.current;
    if (!user) return;
    this.preview.showCharacter({
      skinItem: this.assetManager.getItemById(user.loadout.skin),
      pickaxeItem: this.cosmeticManager.getEquipped('pickaxe'),
      gliderItem: this.cosmeticManager.getEquipped('glider'),
      mode: this.category === 'gliderColor' ? 'glider' : this.category === 'pickaxeColor' ? 'pickaxe' : 'character',
      offsetX: 1.35
    });
  }
}

export { BANNER_ICONS };
