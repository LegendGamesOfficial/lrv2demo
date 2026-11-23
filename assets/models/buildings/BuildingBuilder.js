import { Config } from '../../../js/core/Config.js';

/**
 * Stylized procedural builders for player structures and POI buildings.
 */
export const BuildingBuilder = {
  createPlayerPiece(type, trapId = null, assetManager) {
    const THREE = window.THREE;
    const GRID = Config.BUILD_GRID_SIZE;
    const m = (col, opts) => assetManager.getMaterial(col, opts);

    if (type === 'trap') {
      const col = trapId === 'launch_pad' ? '#a855f7'
        : trapId === 'bouncer' ? '#38bdf8'
        : trapId === 'zap_trap' ? '#eab308' : '#64748b';
      return new THREE.Mesh(new THREE.BoxGeometry(GRID, 0.25, GRID), m(col, { emissive: col }));
    }

    let geo;
    if (type === 'wall') geo = new THREE.BoxGeometry(GRID, GRID, 0.28);
    else if (type === 'floor') geo = new THREE.BoxGeometry(GRID, 0.28, GRID);
    else if (type === 'stairs') geo = new THREE.BoxGeometry(GRID, 0.28, GRID * 1.4);
    else geo = new THREE.ConeGeometry(GRID * 0.72, GRID * 0.7, 4);

    const mesh = new THREE.Mesh(geo, m('#b45309'));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  },

  createPOIBuilding(w, h, d, poiType, assetManager) {
    const THREE = window.THREE;
    const grp = new THREE.Group();
    const m = (col, opts) => assetManager.getMaterial(col, opts);

    const wallCol = poiType === 'city' ? '#475569'
      : poiType === 'springs' ? '#581c87'
      : poiType === 'swamp' ? '#3f6212' : '#b45309';

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m(wallCol));
    body.position.y = h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    grp.add(body);

    const roofCol = poiType === 'city' ? '#1e293b' : '#7f1d1d';
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.75, 2.4, 4), m(roofCol));
    roof.position.y = h + 1.2;
    roof.rotation.y = Math.PI / 4;
    grp.add(roof);

    return grp;
  }
};
