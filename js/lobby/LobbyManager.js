import { Config } from '../core/Config.js';
import { eventBus } from '../core/EventBus.js';
import { GamePhases } from '../core/GameState.js';
import { CosmeticPreview } from '../cosmetics/CosmeticPreview.js';
import { Locker, BANNER_ICONS } from './Locker.js';
import { SeasonShop } from './SeasonShop.js';
import { AccountRewards } from './AccountRewards.js';
import { Settings } from './Settings.js';

/**
 * Coordinates Login, Lobby 3D pedestal, Mode switcher, Season Shop, Locker, Account Rewards, and Tab navigation.
 */
export class LobbyManager {
  constructor({ assetManager, gameState, profile, cosmeticManager, skinManager, emoteManager, saveManager, audio, onStartMatch }) {
    this.assetManager = assetManager;
    this.gameState = gameState;
    this.profile = profile;
    this.cosmeticManager = cosmeticManager;
    this.audio = audio;
    this.onStartMatch = onStartMatch;

    this.preview = new CosmeticPreview(document.getElementById('lobby-canvas'), assetManager);
    this.locker = new Locker(assetManager, profile, cosmeticManager, skinManager, emoteManager, this.preview, audio);
    this.seasonShop = new SeasonShop(assetManager, profile, cosmeticManager, this.preview, audio);
    this.accountRewards = new AccountRewards(assetManager, this.preview, audio);
    this.settings = new Settings(saveManager, audio, () => this.logout());

    this.activeTab = 'lobby';
    this._bindEvents();
    eventBus.on('profile:updated', () => this.refreshHeaderAndLobby());
  }

  _bindEvents() {
    document.getElementById('btn-login').addEventListener('click', () => {
      this.audio.sfx.click();
      const u = document.getElementById('login-username').value.trim();
      const p = document.getElementById('login-password').value;
      const err = document.getElementById('login-error');
      const res = this.profile.login(this.assetManager.data.accounts, u, p);
      if (!res.ok) {
        err.textContent = res.error;
        return;
      }
      err.textContent = '';
      this.enterLobby();
    });

    document.getElementById('btn-guest').addEventListener('click', () => {
      this.audio.sfx.click();
      this.profile.loginGuest();
      this.enterLobby();
    });

    document.querySelectorAll('.nav-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.sfx.click();
        this.switchTab(btn.dataset.tab);
      });
    });

    const toggleMode = () => {
      this.audio.sfx.click();
      const next = this.gameState.mode === 'SOLO' ? 'SQUAD' : 'SOLO';
      this.gameState.setMode(next);
      document.getElementById('lobby-mode-label').textContent = next;
      this.syncLobbyScene();
    };
    document.getElementById('btn-mode-prev').addEventListener('click', toggleMode);
    document.getElementById('btn-mode-next').addEventListener('click', toggleMode);

    document.getElementById('btn-ready').addEventListener('click', () => {
      this.audio.sfx.ready();
      this.preview.isActive = false;
      document.getElementById('app-shell').classList.add('hidden');
      document.getElementById('game-screen').classList.remove('hidden');
      this.onStartMatch();
    });
  }

  enterLobby() {
    this.gameState.setPhase(GamePhases.LOBBY);
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    this.preview.isActive = true;
    this.audio.music.playTrack('lobby');
    this.switchTab('lobby');
    this.refreshHeaderAndLobby();
  }

  returnFromMatch(xpEarned) {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    this.gameState.setPhase(GamePhases.LOBBY);
    this.preview.isActive = true;
    this.audio.music.playTrack('lobby');
    this.switchTab('lobby');
    this.refreshHeaderAndLobby();
    eventBus.emit('ui:notify', `Returned to Lobby! +${xpEarned} XP earned.`);
  }

  logout() {
    this.profile.logout();
    this.gameState.setPhase(GamePhases.LOGIN);
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    this.audio.music.playTrack('login');
  }

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.nav-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-view').forEach((v) => v.classList.add('hidden'));
    const view = document.getElementById(`view-${tab}`);
    if (view) view.classList.remove('hidden');

    if (tab === 'lobby') this.syncLobbyScene();
    else if (tab === 'locker') { this.locker.syncPreview(); this.locker.render(); }
    else if (tab === 'seasonshop') this.seasonShop.render();
    else if (tab === 'rewards') this.accountRewards.render();
    else if (tab === 'settings') this.settings.renderAccount(this.profile.current);
  }

  refreshHeaderAndLobby() {
    const user = this.profile.current;
    if (!user) return;
    document.getElementById('nav-username').textContent = user.displayName || user.username;
    document.getElementById('lobby-level').textContent = `LEVEL ${user.level}`;
    const xpMod = user.xp % Config.XP_PER_LEVEL;
    document.getElementById('lobby-xp-fill').style.width = `${(xpMod / Config.XP_PER_LEVEL) * 100}%`;
    document.getElementById('lobby-xp-text').textContent = `${xpMod} / ${Config.XP_PER_LEVEL} XP`;

    const badge = document.getElementById('lobby-banner-badge');
    badge.textContent = BANNER_ICONS[user.loadout.bannerIcon] || '★';
    badge.style.background = user.loadout.bannerColor || '#2563eb';
    document.getElementById('lobby-mode-label').textContent = this.gameState.mode;
  }

  syncLobbyScene() {
    const user = this.profile.current;
    if (!user) return;
    const squadSkins = this.gameState.mode === 'SQUAD'
      ? ['default_skin_2', 'default_skin_3', 'default_skin_4'].map((id) => this.assetManager.getItemById(id))
      : [];

    this.preview.showCharacter({
      skinItem: this.assetManager.getItemById(user.loadout.skin),
      pickaxeItem: this.cosmeticManager.getEquipped('pickaxe'),
      gliderItem: this.cosmeticManager.getEquipped('glider'),
      mode: 'character',
      offsetX: 0,
      squadSkins
    });

    const labelsEl = document.getElementById('lobby-squad-labels');
    labelsEl.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const tag = document.createElement('div');
      tag.className = 'squad-slot-tag';
      tag.textContent = this.gameState.mode === 'SQUAD' ? `Bot Mate ${i + 1}` : '+ Empty Slot';
      labelsEl.appendChild(tag);
    }
  }
}
