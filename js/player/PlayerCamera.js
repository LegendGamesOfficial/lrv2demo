import { MathUtils } from '../utils/MathUtils.js';

/**
 * Smooth third-person over-the-shoulder camera with ADS zoom and Battle Bus framing.
 */
export class PlayerCamera {
  constructor(camera, settings) {
    this.camera = camera;
    this.settings = settings;
    this.currentDist = 5.6;
  }

  update(player, busPosition, isBusPhase, dt) {
    const baseFov = this.settings.fov || 72;
    const targetFov = player.aiming ? Math.max(42, baseFov - 22) : baseFov;
    this.camera.fov = MathUtils.damp(this.camera.fov, targetFov, 12, dt);
    this.camera.updateProjectionMatrix();

    if (isBusPhase && busPosition) {
      this.camera.position.set(busPosition.x - 18, busPosition.y + 12, busPosition.z + 22);
      this.camera.lookAt(busPosition.x, busPosition.y + 2, busPosition.z);
      return;
    }

    const targetDist = player.aiming ? 3.1 : player.gliding ? 7.2 : 5.6;
    this.currentDist = MathUtils.damp(this.currentDist, targetDist, 10, dt);

    const shoulderOffset = 0.75;
    const camX = player.x + Math.sin(player.yaw) * this.currentDist + Math.cos(player.yaw) * shoulderOffset;
    const camZ = player.z + Math.cos(player.yaw) * this.currentDist - Math.sin(player.yaw) * shoulderOffset;
    const eyeH = player.crouch ? 1.85 : 2.35;
    const camY = player.y + eyeH - Math.sin(player.pitch) * 2.6;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(
      player.x - Math.sin(player.yaw) * 14 + Math.cos(player.yaw) * shoulderOffset,
      player.y + (player.crouch ? 1.45 : 1.85) + Math.sin(player.pitch) * 12,
      player.z - Math.cos(player.yaw) * 14 - Math.sin(player.yaw) * shoulderOffset
    );
  }
}
