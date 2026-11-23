/**
 * Developer-only Bot Perception Debugger.
 * Visualizes FOV cones, LOS visibility rays (green = clear, red = blocked),
 * last known target positions, reaction timers, and AI states.
 * Disabled during normal gameplay.
 */
export class BotPerceptionDebug {
  constructor(scene) {
    this.scene = scene;
    this.enabled = false;
    this.group = new window.THREE.Group();
    this.group.visible = false;
    this.scene.add(this.group);
    this._hudEl = document.getElementById('bot-debug-panel');
  }

  setEnabled(val) {
    this.enabled = !!val;
    this.group.visible = this.enabled;
    if (this._hudEl) this._hudEl.classList.toggle('hidden', !this.enabled);
  }

  update(bots, player) {
    if (!this.enabled) return;
    const THREE = window.THREE;
    while (this.group.children.length) this.group.remove(this.group.children[0]);

    let summaryLines = [];
    const nearby = bots
      .filter((b) => b.alive && Math.hypot(b.x - player.x, b.z - player.z) < 75)
      .slice(0, 8);

    for (const b of nearby) {
      // FOV cone lines (left/right edges at +-65 deg)
      const halfAngle = 1.13;
      const range = Math.min(26, b.personality.aggroRange);
      for (const offset of [-halfAngle, halfAngle]) {
        const a = b.dir + offset;
        const pts = [
          new THREE.Vector3(b.x, b.y + 1.5, b.z),
          new THREE.Vector3(b.x + Math.cos(a) * range, b.y + 1.5, b.z + Math.sin(a) * range)
        ];
        this.group.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: 0x38bdf8 })
        ));
      }

      // LOS line to target or lastKnownPos
      const tgt = b.currentTarget || b.lastKnownPos;
      if (tgt) {
        const pts = [
          new THREE.Vector3(b.x, b.y + 1.6, b.z),
          new THREE.Vector3(tgt.x, (tgt.y || b.y) + 1.4, tgt.z)
        ];
        this.group.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: b.losBlocked ? 0xef4444 : 0x22c55e })
        ));
      }

      summaryLines.push(
        `${b.name} [${b.personality.name}] • ${b.state} • LOS:${b.losBlocked ? 'BLOCKED' : 'CLEAR'} • React:${b.reactionTimer.toFixed(2)}s`
      );
    }

    if (this._hudEl) {
      this._hudEl.innerHTML = summaryLines.length
        ? `<b>BOT PERCEPTION DEBUG (DEV)</b><br>${summaryLines.join('<br>')}`
        : '<b>BOT PERCEPTION DEBUG (DEV)</b><br>No bots within 75m';
    }
  }
}
