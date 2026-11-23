import { ObjectPool } from '../utils/ObjectPool.js';

/**
 * Manages pooled bullet tracers and thrown explosive grenades.
 */
export class ProjectileManager {
  constructor(scene, assetManager) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.grenades = [];

    const THREE = window.THREE;
    this.tracerPool = new ObjectPool(
      () => {
        const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xfde047 }));
        line.visible = false;
        this.scene.add(line);
        return { line, life: 0 };
      },
      (obj, a, b) => {
        const pos = obj.line.geometry.attributes.position;
        pos.setXYZ(0, a.x, a.y, a.z);
        pos.setXYZ(1, b.x, b.y, b.z);
        pos.needsUpdate = true;
        obj.line.visible = true;
        obj.life = 0.08;
      },
      24
    );
  }

  spawnTracer(a, b) {
    this.tracerPool.acquire(a, b);
  }

  spawnGrenade(x, y, z, dir) {
    const THREE = window.THREE;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 8, 8),
      this.assetManager.getMaterial('#15803d')
    );
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    this.grenades.push({
      x, y, z,
      vx: dir.x * 26,
      vy: dir.y * 26 + 6,
      vz: dir.z * 26,
      mesh
    });
  }

  update(dt, world, onExplode) {
    for (const tr of [...this.tracerPool.activeItems]) {
      tr.life -= dt;
      if (tr.life <= 0) {
        tr.line.visible = false;
        this.tracerPool.release(tr);
      }
    }

    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const g = this.grenades[i];
      g.vy -= 24 * dt;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.z += g.vz * dt;
      g.mesh.position.set(g.x, g.y, g.z);
      if (g.y <= world.getTerrainHeight(g.x, g.z)) {
        onExplode(g.x, g.y, g.z);
        this.scene.remove(g.mesh);
        this.grenades.splice(i, 1);
      }
    }
  }

  clear() {
    for (const tr of this.tracerPool.activeItems) tr.line.visible = false;
    this.tracerPool.releaseAll();
    for (const g of this.grenades) this.scene.remove(g.mesh);
    this.grenades = [];
  }
}
