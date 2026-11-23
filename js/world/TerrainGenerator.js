import { MathUtils } from '../utils/MathUtils.js';
import { Config } from '../core/Config.js';

/**
 * Generates natural rolling hills, mountain ridges, coastal beaches, river channel, and Spawn Island.
 */
export class TerrainGenerator {
  getHeight(x, z) {
    const sc = Config.SPAWN_ISLAND_CENTER;
    if (Math.hypot(x - sc.x, z - sc.z) < 65) {
      return 3.5 + Math.sin(x * 0.08) * 0.8;
    }

    const r = Math.hypot(x, z);
    if (r > 475) return -6;

    const edgeFall = Math.max(0, 1 - Math.pow(r / 470, 3.2));
    const noiseHills = MathUtils.fbm2D(x * 0.0045 + 10, z * 0.0045 + 10, 4) * 26 - 6;
    const mountainRidge = Math.max(0, MathUtils.fbm2D(x * 0.008 - 5, z * 0.008 + 7, 3) - 0.58) * 42;

    const riverDist = Math.abs(z - Math.sin(x * 0.012) * 75 + 20);
    const riverDip = riverDist < 18 ? -3.4 * (1 - riverDist / 18) : 0;

    const lakeDist = Math.hypot(x + 110, z + 95);
    const lakeDip = lakeDist < 55 ? -3.0 * (1 - lakeDist / 55) : 0;

    return Math.max(-4, edgeFall * (5.0 + noiseHills + mountainRidge) + riverDip + lakeDip);
  }

  buildMesh(scene, assetManager) {
    const THREE = window.THREE;
    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(2400, 2400),
      assetManager.getMaterial('#0284c7', { roughness: 0.25, metalness: 0.2 })
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.7;
    scene.add(ocean);

    const geo = new THREE.PlaneGeometry(1000, 1000, 108, 108);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = this.getHeight(x, z);
      pos.setY(i, y);

      if (y < 0.4) colors.push(0.91, 0.82, 0.56);       // Sandy beach
      else if (y > 18) colors.push(0.45, 0.48, 0.52);   // Mountain stone
      else if (y > 11) colors.push(0.28, 0.48, 0.24);   // Highland grass
      else colors.push(0.24, 0.66, 0.24);               // Vibrant stylized meadow
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const terrain = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, flatShading: true })
    );
    terrain.receiveShadow = true;
    scene.add(terrain);

    const sc = Config.SPAWN_ISLAND_CENTER;
    const spawnDisk = new THREE.Mesh(
      new THREE.CylinderGeometry(58, 62, 4, 24),
      assetManager.getMaterial('#4d7c0f')
    );
    spawnDisk.position.set(sc.x, 1.5, sc.z);
    scene.add(spawnDisk);
  }
}
