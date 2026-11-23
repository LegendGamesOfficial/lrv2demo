/**
 * Default cinematic camera presets and save/load camera bookmark slot.
 */
export const CameraPresets = {
  getPreset(name, player, stormManager, pois = []) {
    const poi = pois[1] || pois[0] || { x: 115, z: -125 };
    switch (name) {
      case 'Island Overview':
        return { x: 0, y: 240, z: 380, yaw: 0, pitch: -0.58 };
      case 'High Altitude':
        return { x: -120, y: 360, z: 120, yaw: -0.78, pitch: -1.1 };
      case 'Map Flyover':
        return { x: -320, y: 125, z: -260, yaw: -2.35, pitch: -0.35 };
      case 'POI Showcase':
        return { x: poi.x + 35, y: 38, z: poi.z + 55, yaw: 0.55, pitch: -0.45 };
      case 'Character Showcase':
        return { x: player.x + 2.8, y: player.y + 2.2, z: player.z + 3.6, yaw: 0.62, pitch: -0.15 };
      case 'Battle Showcase':
        return { x: player.x - 18, y: player.y + 14, z: player.z + 22, yaw: -0.65, pitch: -0.42 };
      case 'Storm Showcase':
        return {
          x: stormManager.cx + stormManager.radius * 0.72,
          y: 65,
          z: stormManager.cz + stormManager.radius * 0.72,
          yaw: 0.78,
          pitch: -0.32
        };
      default:
        return { x: 0, y: 120, z: 180, yaw: 0, pitch: -0.45 };
    }
  }
};
