import assert from 'node:assert/strict';
import { Player } from '../js/player/Player.js';
import { PlayerHealth } from '../js/player/PlayerHealth.js';
import { assetManager } from '../js/core/AssetManager.js';

export function runPlayerTests() {
  const h = new PlayerHealth();
  h.addShield(50, 100);
  assert.equal(h.shield, 50);
  h.takeDamage(70);
  assert.equal(h.shield, 0);
  assert.equal(h.hp, 80);

  // Verify separated cameraYaw vs bodyYaw orientation
  const p = new Player(assetManager);
  p.yaw = 0; // Camera looking -Z
  p.moveDirX = 1; p.moveDirZ = 0; // Moving +X (right)
  p.currentSpeed = 8;
  p.updateOrientation(0.5, false);
  // bodyYaw should turn toward +PI/2 (+X), NOT stay locked to camera yaw 0
  assert.ok(Math.abs(p.bodyYaw - Math.PI / 2) < 0.25, `Expected bodyYaw near PI/2, got ${p.bodyYaw}`);
  console.log('PASS: player.test.js');
}
