/**
 * Centralized game configuration, constants, keybinds, rarities, and storm phases.
 */
export const Config = {
  GAME_TITLE: 'Legend Royale',
  STORAGE_KEY: 'lr_accounts_v2',
  SETTINGS_KEY: 'lr_settings_v2',
  DEV_MODE_KEY: 'lr_dev_camera_enabled',
  SEASON: 2,
  XP_PER_LEVEL: 1000,
  MAX_LEVEL: 125,
  TOTAL_COMBATANTS: 20,
  BOT_COUNT: 19,
  ISLAND_RADIUS: 460,
  SPAWN_ISLAND_CENTER: { x: 560, y: 12, z: 560 },
  BUILD_GRID_SIZE: 4,
  BUILD_COST: 10,

  RARITY_COLORS: {
    1: '#9ca3af',
    2: '#22c55e',
    3: '#3b82f6',
    4: '#a855f7',
    5: '#f59e0b'
  },

  RARITY_NAMES: {
    1: 'Common',
    2: 'Uncommon',
    3: 'Rare',
    4: 'Epic',
    5: 'Legendary'
  },

  DEFAULT_KEYBINDS: {
    forward: 'w',
    backward: 's',
    left: 'a',
    right: 'd',
    jump: ' ',
    crouch: 'x',
    interact: 'e',
    inventory: 'i',
    wall: 'q',
    floor: 'f',
    ramp: 'v',
    cone: 'c',
    rotate: 'r',
    editBuild: 'g',
    emoteWheel: 'b',
    mapToggle: 'm'
  },

  STORM_PHASES: [
    { phase: 1, waitTime: 120, shrinkTime: 35, targetRadius: 330, damage: 1 },
    { phase: 2, waitTime: 120, shrinkTime: 30, targetRadius: 210, damage: 2 },
    { phase: 3, waitTime: 120, shrinkTime: 25, targetRadius: 120, damage: 5 },
    { phase: 4, waitTime: 120, shrinkTime: 20, targetRadius: 55, damage: 8 },
    { phase: 5, waitTime: 90, shrinkTime: 20, targetRadius: 12, damage: 10 }
  ],

  DEFAULT_SETTINGS: {
    quality: 'high',
    fov: 72,
    sensitivity: 1.0,
    masterVolume: 0.7,
    musicVolume: 0.45,
    sfxVolume: 0.75,
    muted: false
  }
};
