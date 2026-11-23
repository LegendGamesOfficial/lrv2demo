/**
 * In-game 8-slot radial/grid Emote Wheel (B keybind or HUD Emote button).
 */
export class EmoteWheel {
  constructor(emoteManager, audio) {
    this.emoteManager = emoteManager;
    this.audio = audio;
    this.overlay = document.getElementById('emote-wheel-overlay');
    this.grid = document.getElementById('emote-wheel-grid');
    this.isOpen = false;
    document.getElementById('btn-close-emotes').addEventListener('click', () => this.toggle(false));
  }

  toggle(forceState = null, onSelectEmote = null) {
    this.isOpen = forceState !== null ? forceState : !this.isOpen;
    this.overlay.classList.toggle('hidden', !this.isOpen);
    if (this.isOpen) {
      if (document.pointerLockElement) document.exitPointerLock();
      this._render(onSelectEmote);
    }
    return this.isOpen;
  }

  _render(onSelectEmote) {
    this.grid.innerHTML = '';
    const equipped = this.emoteManager.getEquippedEmotes();
    equipped.forEach((em, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-fn btn-dark emote-wheel-btn';
      btn.textContent = em ? em.name : `Empty ${idx + 1}`;
      btn.disabled = !em;
      btn.addEventListener('click', () => {
        if (!em) return;
        this.audio.sfx.emote();
        this.toggle(false);
        if (onSelectEmote) onSelectEmote(em);
      });
      this.grid.appendChild(btn);
    });
  }
}
