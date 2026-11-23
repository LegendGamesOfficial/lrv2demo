import { Config } from '../core/Config.js';

/**
 * Represents a placed wall, floor, ramp, cone, or trap with ownership, health,
 * edit patterns (Door, Window, Half-Wall, Corner Cutout, Ramp Rotate), and accurate collision boxes.
 */
export class BuildingPiece {
  constructor({ type, x, y, z, rot = 0, trapId = null, owner = 'player', assetManager }) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.z = z;
    this.rot = rot;
    this.trapId = trapId;
    this.owner = owner;
    this.hp = type === 'trap' ? 120 : 150;
    this.maxHp = this.hp;
    this.editShape = 'full'; // 'full' | 'door' | 'window' | 'half' | 'corner' | 'rotated'
    this.alive = true;
    this.assetManager = assetManager;

    this.mesh = new window.THREE.Group();
    this.mesh.position.set(x, y, z);
    this.mesh.rotation.y = rot;
    this._rebuildMesh();
  }

  applyEdit(shape) {
    this.editShape = shape || 'full';
    if (this.type === 'stairs' && shape === 'rotated') {
      this.rot = (this.rot + Math.PI / 2) % (Math.PI * 2);
      this.mesh.rotation.y = this.rot;
    }
    this._rebuildMesh();
  }

  _rebuildMesh() {
    const THREE = window.THREE;
    const GRID = Config.BUILD_GRID_SIZE;
    while (this.mesh.children.length) this.mesh.remove(this.mesh.children[0]);

    if (this.type === 'trap') {
      const col = this.trapId === 'launch_pad' ? '#a855f7'
        : this.trapId === 'bouncer' ? '#38bdf8'
        : this.trapId === 'zap_trap' ? '#eab308' : '#64748b';
      const m = new THREE.Mesh(new THREE.BoxGeometry(GRID, 0.25, GRID), this.assetManager.getMaterial(col, { emissive: col }));
      m.position.y = 0.15;
      this.mesh.add(m);
      return;
    }

    const mat = this.assetManager.getMaterial('#b45309');

    if (this.type === 'wall') {
      if (this.editShape === 'door') {
        const left = new THREE.Mesh(new THREE.BoxGeometry(1.3, GRID, 0.28), mat);
        left.position.set(-1.35, GRID / 2, 0);
        const right = new THREE.Mesh(new THREE.BoxGeometry(1.3, GRID, 0.28), mat);
        right.position.set(1.35, GRID / 2, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 0.28), mat);
        top.position.set(0, GRID - 0.65, 0);
        this.mesh.add(left, right, top);
      } else if (this.editShape === 'window') {
        const bot = new THREE.Mesh(new THREE.BoxGeometry(GRID, 1.4, 0.28), mat);
        bot.position.set(0, 0.7, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(GRID, 1.2, 0.28), mat);
        top.position.set(0, GRID - 0.6, 0);
        const left = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.28), mat);
        left.position.set(-1.4, 2.1, 0);
        const right = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.28), mat);
        right.position.set(1.4, 2.1, 0);
        this.mesh.add(bot, top, left, right);
      } else if (this.editShape === 'half') {
        const half = new THREE.Mesh(new THREE.BoxGeometry(GRID, GRID * 0.5, 0.28), mat);
        half.position.set(0, GRID * 0.25, 0);
        this.mesh.add(half);
      } else {
        const full = new THREE.Mesh(new THREE.BoxGeometry(GRID, GRID, 0.28), mat);
        full.position.set(0, GRID / 2, 0);
        this.mesh.add(full);
      }
      return;
    }

    if (this.type === 'floor') {
      if (this.editShape === 'corner') {
        const f1 = new THREE.Mesh(new THREE.BoxGeometry(GRID, 0.28, GRID * 0.5), mat);
        f1.position.set(0, 0.15, -GRID * 0.25);
        const f2 = new THREE.Mesh(new THREE.BoxGeometry(GRID * 0.5, 0.28, GRID * 0.5), mat);
        f2.position.set(-GRID * 0.25, 0.15, GRID * 0.25);
        this.mesh.add(f1, f2);
      } else {
        const full = new THREE.Mesh(new THREE.BoxGeometry(GRID, 0.28, GRID), mat);
        full.position.set(0, 0.15, 0);
        this.mesh.add(full);
      }
      return;
    }

    if (this.type === 'stairs') {
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(GRID, 0.28, GRID * 1.4), mat);
      ramp.position.set(0, GRID * 0.45, 0);
      ramp.rotation.x = -0.65;
      this.mesh.add(ramp);
      return;
    }

    const h = this.editShape === 'corner' ? GRID * 0.42 : GRID * 0.7;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(GRID * 0.72, h, 4), mat);
    cone.position.set(0, h / 2, 0);
    cone.rotation.y = Math.PI / 4;
    this.mesh.add(cone);
  }

  /**
   * Returns accurate AABB collision/bullet-blocking boxes matching the current piece & edit shape.
   */
  getBoundingBoxes() {
    if (!this.alive) return [];
    const GRID = Config.BUILD_GRID_SIZE;
    const rot90 = Math.abs(Math.sin(this.rot)) > 0.7;

    if (this.type === 'wall') {
      const h = this.editShape === 'half' ? GRID * 0.5 : GRID;
      if (this.editShape === 'door') {
        const offset = 1.35;
        const dx = rot90 ? 0 : offset;
        const dz = rot90 ? offset : 0;
        return [
          { x: this.x - dx, y: this.y, z: this.z - dz, halfW: rot90 ? 0.3 : 0.65, halfD: rot90 ? 0.65 : 0.3, height: GRID, pieceRef: this },
          { x: this.x + dx, y: this.y, z: this.z + dz, halfW: rot90 ? 0.3 : 0.65, halfD: rot90 ? 0.65 : 0.3, height: GRID, pieceRef: this }
        ];
      }
      return [{
        x: this.x, y: this.y, z: this.z,
        halfW: rot90 ? 0.3 : GRID / 2,
        halfD: rot90 ? GRID / 2 : 0.3,
        height: h,
        pieceRef: this
      }];
    }

    if (this.type === 'stairs') {
      return [{
        x: this.x, y: this.y, z: this.z,
        halfW: GRID / 2, halfD: GRID / 2,
        height: GRID * 0.85,
        pieceRef: this
      }];
    }

    if (this.type === 'cone') {
      return [{
        x: this.x, y: this.y, z: this.z,
        halfW: GRID / 2, halfD: GRID / 2,
        height: this.editShape === 'corner' ? GRID * 0.42 : GRID * 0.7,
        pieceRef: this
      }];
    }

    return [{
      x: this.x, y: this.y, z: this.z,
      halfW: GRID / 2, halfD: GRID / 2,
      height: 0.45,
      pieceRef: this
    }];
  }
}
