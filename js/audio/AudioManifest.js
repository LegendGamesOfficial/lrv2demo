/**
 * Manifest of all required user-supplied MP3 audio files under assets/audio/.
 * No external URLs or synthesized replacements are used.
 */
export const AUDIO_MANIFEST = {
  music: [
    { key: 'music_login', file: 'assets/audio/music_login.mp3', loop: true, purpose: 'Loops on the Login screen and stops when entering the Lobby' },
    { key: 'music_lobby', file: 'assets/audio/music_lobby.mp3', loop: true, purpose: 'Loops in the Lobby and stops when a match begins' }
  ],
  sfx: [
    { key: 'player_footsteps', file: 'assets/audio/player_footsteps.mp3', purpose: 'Footstep sound during walking and running' },
    { key: 'player_damage', file: 'assets/audio/player_damage.mp3', purpose: 'Plays when the player takes damage' },
    { key: 'player_elimination', file: 'assets/audio/player_elimination.mp3', purpose: 'Plays when eliminating an opponent' },
    { key: 'weapon_rifle_fire', file: 'assets/audio/weapon_rifle_fire.mp3', purpose: 'Assault Rifle / SCAR firing sound' },
    { key: 'weapon_shotgun_fire', file: 'assets/audio/weapon_shotgun_fire.mp3', purpose: 'Pump / Tactical Shotgun firing sound' },
    { key: 'weapon_smg_fire', file: 'assets/audio/weapon_smg_fire.mp3', purpose: 'SMG / Compact SMG / Pistol firing sound' },
    { key: 'weapon_sniper_fire', file: 'assets/audio/weapon_sniper_fire.mp3', purpose: 'Bolt-Action Sniper firing sound' },
    { key: 'weapon_reload', file: 'assets/audio/weapon_reload.mp3', purpose: 'Weapon reload sound' },
    { key: 'weapon_empty', file: 'assets/audio/weapon_empty.mp3', purpose: 'Dry-fire click when magazine is empty' },
    { key: 'build_place', file: 'assets/audio/build_place.mp3', purpose: 'Structure placement sound' },
    { key: 'build_edit', file: 'assets/audio/build_edit.mp3', purpose: 'Structure edit confirmation sound' },
    { key: 'build_destroy', file: 'assets/audio/build_destroy.mp3', purpose: 'Structure destruction sound' },
    { key: 'item_pickup', file: 'assets/audio/item_pickup.mp3', purpose: 'Item / weapon / ammo pickup sound' },
    { key: 'chest_open', file: 'assets/audio/chest_open.mp3', purpose: 'Chest opening sound' },
    { key: 'heal_use', file: 'assets/audio/heal_use.mp3', purpose: 'Med Kit, Bandages, Shield Potion, and Bush use sound' },
    { key: 'storm_warning', file: 'assets/audio/storm_warning.mp3', purpose: 'Storm shrink phase warning sound' },
    { key: 'ui_click', file: 'assets/audio/ui_click.mp3', purpose: 'Menu and HUD button click sound' }
  ]
};
