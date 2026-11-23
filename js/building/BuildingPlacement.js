import { Config } from '../core/Config.js';

/**
 * Grid-snapped placement calculator with accurate per-piece green/red validity preview.
 */
export class BuildingPlacement {
  constructor(scene) {
    this.scene = scene;
    const THREE = window.THREE;
    const GRID = Config.BUILD_GRID_SIZE;
    this.validMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.45 });
    this.invalidMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.48 });

    // Separate preview meshes per piece type so the preview matches exact placed geometry
    this.previews = {
      wall: new THREE.Mesh(new THREE.BoxGeometry(GRID, GRID, 0.28), this.validMat),
      floor: new THREE.Mesh(new THREE.BoxGeometry(GRID, 0.28, GRID), this.validMat),
      stairs: new THREE.Mesh(new THREE.BoxGeometry(GRID, 0.28, GRID * 1.4), this.validMat),
      cone: new THREE.Mesh(new THREE.ConeGeometry(GRID * 0.72, GRID * 0.7, 4), this.validMat),
      trap: new THREE.Mesh(new THREE.BoxGeometry(GRID, 0.25, GRID), this.validMat)
    };

    this.previews.stairs.rotation.order = 'YXZ';
    this.previews.cone.rotation.order = 'YXZ';

    for (const mesh of Object.values(this.previews)) {
      mesh.visible = false;
      this.scene.add(mesh);
    }
    this.previewMesh = this.previews.wall;
  }

  getGridPosition(player, buildPiece, world = null) {
    const GRID = Config.BUILD_GRID_SIZE;
    const reach = buildPiece === 'floor' || buildPiece === 'cone' ? 3.2 : 4.2;
    const fwdX = -Math.sin(player.yaw) * reach;
    const fwdZ = -Math.cos(player.yaw) * reach;

    const gx = Math.round((player.x + fwdX) / GRID) * GRID;
    const gz = Math.round((player.z + fwdZ) / GRID) * GRID;

    // Snap vertical height cleanly to GRID increments, clamped to terrain
    const pitchOffset = (player.pitch || 0) > 0.45 ? GRID : (player.pitch || 0) < -0.55 ? -GRID : 0;
    let gy = Math.floor((player.y + 0.5) / GRID) * GRID + pitchOffset;
    if (world) {
      const terrainY = world.getTerrainHeight(gx, gz);
      const minGridY = Math.floor(terrainY / GRID) * GRID;
      if (gy < minGridY) gy = minGridY;
    } else if (gy < 0) {
      gy = 0;
    }

    // Snap yaw to nearest 90 degrees
    const snappedRot = Math.round(player.yaw / (Math.PI / 2)) * (Math.PI / 2);
    return { x: gx, y: gy, z: gz, snappedRot };
  }

  isValidPlacement(pos, buildPiece, rot, player, pieces, world) {
    if (buildPiece !== 'trap' && player.wood < Config.BUILD_COST) return false;
    if (world) {
      const terrainY = world.getTerrainHeight(pos.x, pos.z);
      if (pos.y < terrainY - Config.BUILD_GRID_SIZE) return false;
    }
    for (const p of pieces) {
      if (!p.alive) continue;
      if (p.type === buildPiece && Math.abs(p.x - pos.x) < 0.5 && Math.abs(p.y - pos.y) < 0.5 && Math.abs(p.z - pos.z) < 0.5) {
        if (buildPiece !== 'wall' || Math.abs(Math.sin(p.rot - rot)) < 0.2) {
          return false;
        }
      }
    }
    return true;
  }

  updatePreview(visible, player, buildPiece, extraRot, pieces, world) {
    for (const mesh of Object.values(this.previews)) {
      mesh.visible = false;
    }
    if (!visible) return { valid: false, pos: null };

    const GRID = Config.BUILD_GRID_SIZE;
    const pos = this.getGridPosition(player, buildPiece, world);
    const totalRot = pos.snappedRot + extraRot;
    const valid = this.isValidPlacement(pos, buildPiece, totalRot, player, pieces, world);

    const mesh = this.previews[buildPiece] || this.previews.wall;
    this.previewMesh = mesh;
    mesh.material = valid ? this.validMat : this.invalidMat;
    mesh.visible = true;

    if (buildPiece === 'wall') {
      mesh.position.set(pos.x, pos.y + GRID / 2, pos.z);
      mesh.rotation.set(0, totalRot, 0);
    } else if (buildPiece === 'stairs') {
      mesh.position.set(pos.x, pos.y + GRID * 0.45, pos.z);
      mesh.rotation.set(-0.65, totalRot, 0);
    } else if (buildPiece === 'cone') {
      mesh.position.set(pos.x, pos.y + (GRID * 0.7) / 2, pos.z);
      mesh.rotation.set(0, totalRot + Math.PI / 4, 0);
    } else {
      mesh.position.set(pos.x, pos.y + 0.15, pos.z);
      mesh.rotation.set(0, totalRot, 0);
    }

    return { valid, pos, rot: totalRot };
  }
}
