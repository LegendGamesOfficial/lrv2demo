import { eventBus } from '../core/EventBus.js';

/**
 * Account Rewards page controller: explains account creation via email and previews the Season 2 exclusive skin.
 */
export class AccountRewards {
  constructor(assetManager, preview, audio) {
    this.assetManager = assetManager;
    this.preview = preview;
    this.audio = audio;
  }

  render() {
    const btn = document.getElementById('btn-preview-skull');
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        this.audio.sfx.click();
        const skull = this.assetManager.getItemById('skin_purple_skull_trooper');
        if (skull) {
          this.preview.showCharacter({ skinItem: skull, mode: 'character', offsetX: 0 });
          eventBus.emit('ui:notify', 'Previewing Purple Skull Trooper (Season 2 Account Exclusive)');
        }
      });
    }
  }
}
