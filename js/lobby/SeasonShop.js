import { eventBus } from '../core/EventBus.js';

/**
 * Season 2 Season Shop: 5 free skins unlocked by player level (Season 2 only, not saved to Locker).
 */
export class SeasonShop {
  constructor(assetManager, profile, cosmeticManager, preview, audio) {
    this.assetManager = assetManager;
    this.profile = profile;
    this.cosmeticManager = cosmeticManager;
    this.preview = preview;
    this.audio = audio;
  }

  render() {
    const user = this.profile.current;
    const grid = document.getElementById('season-shop-grid');
    if (!user || !grid) return;

    const skins = (this.assetManager.data.seasonShop && this.assetManager.data.seasonShop.skins) || [];
    grid.innerHTML = '';

    skins.forEach((skin) => {
      const unlocked = (user.level || 1) >= skin.requiredLevel;
      const equipped = user.loadout.skin === skin.id;

      const card = document.createElement('div');
      card.className = `item-card rarity-${skin.rarity || 2}`;
      card.innerHTML = `
        <div class="item-type-tag">SEASON 2 • LEVEL ${skin.requiredLevel}</div>
        <div class="item-name">${skin.name}</div>
        <div class="item-meta">${unlocked ? (equipped ? 'EQUIPPED' : 'FREE • UNLOCKED') : `Requires Level ${skin.requiredLevel}`}</div>
      `;

      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '6px';
      row.style.marginTop = '8px';

      const prevBtn = document.createElement('button');
      prevBtn.className = 'btn-fn btn-blue';
      prevBtn.style.cssText = 'flex:1;padding:8px;font-size:0.75rem;';
      prevBtn.textContent = '3D PREVIEW';
      prevBtn.addEventListener('click', () => {
        this.audio.sfx.click();
        this.preview.showCharacter({
          skinItem: skin,
          pickaxeItem: this.cosmeticManager.getEquipped('pickaxe'),
          gliderItem: this.cosmeticManager.getEquipped('glider'),
          mode: 'character',
          offsetX: 0
        });
        eventBus.emit('ui:notify', `Previewing ${skin.name} (Season 2)`);
      });

      const equipBtn = document.createElement('button');
      equipBtn.className = `btn-fn ${equipped ? 'btn-dark' : unlocked ? 'btn-yellow' : 'btn-dark'}`;
      equipBtn.style.cssText = 'flex:1;padding:8px;font-size:0.75rem;';
      equipBtn.disabled = !unlocked || equipped;
      equipBtn.textContent = equipped ? 'EQUIPPED' : unlocked ? 'EQUIP FREE' : `LVL ${skin.requiredLevel}`;
      equipBtn.addEventListener('click', () => {
        this.audio.sfx.click();
        if (this.cosmeticManager.equipItem(skin.id)) {
          this.preview.showCharacter({ skinItem: skin, mode: 'character', offsetX: 0 });
          eventBus.emit('ui:notify', `Equipped ${skin.name} for Season 2!`);
          this.render();
        }
      });

      row.append(prevBtn, equipBtn);
      card.appendChild(row);
      grid.appendChild(card);
    });
  }
}
