import { eventBus } from '../core/EventBus.js';

const ALL_EMOTE_IDS = [
  'emote_dance_moves',
  'emote_squat_kick',
  'emote_take_the_l',
  'emote_doom',
  'emote_kneel_of_honor',
  'emote_disco_fever',
  'emote_dab'
];

/**
 * Manages the active player's account data, guest profile, ownership, and loadout.
 */
export class PlayerProfile {
  constructor(saveManager) {
    this.saveManager = saveManager;
    this.current = null;
  }

  login(accounts, username, password) {
    const match = accounts.find((a) => a.username === username && a.password === password);
    if (!match) return { ok: false, error: 'Invalid username or password.' };
    this.current = this.saveManager.loadAccount(match);
    this._ensureDefaults();
    eventBus.emit('profile:loggedIn', this.current);
    return { ok: true, profile: this.current };
  }

  loginGuest() {
    this.current = {
      username: 'Guest',
      displayName: 'Guest',
      isGuest: true,
      level: 1,
      xp: 0,
      ownedItems: [
        'default_skin_1', 'default_skin_2', 'default_skin_3', 'default_skin_4',
        ...ALL_EMOTE_IDS
      ],
      loadout: {
        skin: 'default_skin_1',
        pickaxeColor: '#64748b',
        gliderColor: '#475569',
        bannerIcon: 'star',
        bannerColor: '#2563eb',
        emotes: [...ALL_EMOTE_IDS, null]
      }
    };
    eventBus.emit('profile:loggedIn', this.current);
    return this.current;
  }

  logout() {
    this.current = null;
    eventBus.emit('profile:loggedOut');
  }

  ownsItem(itemId) {
    if (!this.current) return false;
    if (itemId && itemId.startsWith('emote_')) return true;
    return this.current.ownedItems.includes(itemId);
  }

  grantItem(itemId) {
    if (!this.current || this.ownsItem(itemId)) return false;
    this.current.ownedItems.push(itemId);
    this.save();
    eventBus.emit('profile:updated', this.current);
    return true;
  }

  save() {
    this.saveManager.saveAccount(this.current);
  }

  _ensureDefaults() {
    if (!Array.isArray(this.current.ownedItems)) this.current.ownedItems = [];
    for (const em of ALL_EMOTE_IDS) {
      if (!this.current.ownedItems.includes(em)) {
        this.current.ownedItems.push(em);
      }
    }
    if (!this.current.loadout) {
      this.current.loadout = {
        skin: 'default_skin_1',
        pickaxeColor: '#64748b',
        gliderColor: '#475569',
        bannerIcon: 'star',
        bannerColor: '#2563eb',
        emotes: [...ALL_EMOTE_IDS, null]
      };
    }
    if (!this.current.loadout.pickaxeColor) this.current.loadout.pickaxeColor = '#64748b';
    if (!this.current.loadout.gliderColor) this.current.loadout.gliderColor = '#475569';
    if (!Array.isArray(this.current.loadout.emotes)) {
      this.current.loadout.emotes = [...ALL_EMOTE_IDS, null];
    }
  }
}
