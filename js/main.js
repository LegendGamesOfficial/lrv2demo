import { assetManager } from './core/AssetManager.js';
import { GameState } from './core/GameState.js';
import { Game } from './core/Game.js';
import { audioManager } from './audio/AudioManager.js';
import { SaveManager } from './progression/SaveManager.js';
import { PlayerProfile } from './progression/PlayerProfile.js';
import { XPManager } from './progression/XPManager.js';
import { CosmeticManager } from './cosmetics/CosmeticManager.js';
import { SkinManager } from './cosmetics/SkinManager.js';
import { EmoteManager } from './cosmetics/EmoteManager.js';
import { LobbyManager } from './lobby/LobbyManager.js';
import { Notifications } from './ui/Notifications.js';

/**
 * Entry point: initializes data, progression, audio, lobby, and game engine in dependency order.
 */
async function bootstrap() {
  await assetManager.loadAllData();

  new Notifications(document.getElementById('toast-box'));

  const gameState = new GameState();
  const saveManager = new SaveManager();
  const profile = new PlayerProfile(saveManager);
  const xpManager = new XPManager(profile);
  const cosmeticManager = new CosmeticManager(assetManager, profile);
  const skinManager = new SkinManager(assetManager, profile, cosmeticManager);
  const emoteManager = new EmoteManager(assetManager, profile);

  let lobbyManager = null;
  const game = new Game({
    assetManager,
    gameState,
    profile,
    xpManager,
    cosmeticManager,
    emoteManager,
    settings: null,
    audio: audioManager,
    onMatchFinished: (xpEarned) => lobbyManager.returnFromMatch(xpEarned)
  });

  lobbyManager = new LobbyManager({
    assetManager,
    gameState,
    profile,
    cosmeticManager,
    skinManager,
    emoteManager,
    saveManager,
    audio: audioManager,
    onStartMatch: () => game.startMatch()
  });

  game.settings = lobbyManager.settings;
  audioManager.music.playTrack('login');
}

window.addEventListener('DOMContentLoaded', bootstrap);
