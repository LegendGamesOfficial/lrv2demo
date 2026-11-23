/**
 * Stylized procedural 3D environment props: trees, rocks, chests, gliders, Battle Bus, and bushes.
 */
export const EnvironmentBuilder = {
  createTree(scale = 1, assetManager) {
    const THREE = window.THREE;
    const grp = new THREE.Group();
    const g = (k, fn) => assetManager.getGeometry(k, fn);
    const m = (col, opts) => assetManager.getMaterial(col, opts);

    const trunk = new THREE.Mesh(g('env_trunk', (T) => new T.CylinderGeometry(0.3, 0.48, 3.4, 7)), m('#78350f'));
    trunk.position.y = 1.7;
    trunk.castShadow = true;

    const c1 = new THREE.Mesh(g('env_cone1', (T) => new T.ConeGeometry(2.1, 3.4, 7)), m('#15803d'));
    c1.position.y = 4.2;
    c1.castShadow = true;

    const c2 = new THREE.Mesh(g('env_cone2', (T) => new T.ConeGeometry(1.5, 2.6, 7)), m('#16a34a'));
    c2.position.y = 5.8;

    grp.add(trunk, c1, c2);
    grp.scale.setScalar(scale);
    return grp;
  },

  createRock(scale = 1, assetManager) {
    const THREE = window.THREE;
    const geo = assetManager.getGeometry('env_rock', (T) => new T.DodecahedronGeometry(1.4, 0));
    const mesh = new THREE.Mesh(geo, assetManager.getMaterial('#64748b', { roughness: 0.9 }));
    mesh.scale.set(scale * 1.2, scale * 0.85, scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  },

  createChest(assetManager) {
    const THREE = window.THREE;
    const grp = new THREE.Group();
    const m = (col, opts) => assetManager.getMaterial(col, opts);

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.85, 0.9), m('#b45309'));
    base.position.y = 0.42;
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.22, 0.96), m('#facc15', { emissive: '#92400e', metalness: 0.5 }));
    trim.position.y = 0.78;
    const glow = new THREE.PointLight(0xfde047, 1.1, 7);
    glow.position.y = 1.2;
    grp.add(base, trim, glow);
    return grp;
  },

  createGlider(item, assetManager) {
    const THREE = window.THREE;
    const grp = new THREE.Group();
    const color = (item && item.color) || '#475569';
    const accent = (item && item.accent) || '#eab308';
    const m = (col, opts) => assetManager.getMaterial(col, opts);

    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.15), m(color));
    wing.rotation.x = 0.08;
    const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.95), m(accent));
    tipL.position.set(-1.45, -0.08, 0);
    tipL.rotation.z = 0.25;
    const tipR = tipL.clone();
    tipR.position.x = 1.45;
    tipR.rotation.z = -0.25;

    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), m('#94a3b8'));
    bar.rotation.z = Math.PI / 2;
    bar.position.y = -0.75;
    const strutL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 6), m('#cbd5e1'));
    strutL.position.set(-0.45, -0.38, 0);
    const strutR = strutL.clone();
    strutR.position.x = 0.45;

    grp.add(wing, tipL, tipR, bar, strutL, strutR);
    return grp;
  },

  createBattleBus(assetManager) {
    const THREE = window.THREE;
    const bus = new THREE.Group();
    const m = (col, opts) => assetManager.getMaterial(col, opts);

    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 10.5), m('#1d4ed8'));
    body.position.y = 1.8;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.5, 10.6), m('#facc15'));
    stripe.position.y = 1.6;
    const balloon = new THREE.Mesh(new THREE.SphereGeometry(4.6, 14, 12), m('#38bdf8'));
    balloon.scale.set(1.1, 1.0, 1.45);
    balloon.position.y = 9.2;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.5, 8), m('#f97316', { emissive: '#f97316' }));
    flame.position.y = 4.2;
    bus.add(body, stripe, balloon, flame);
    return bus;
  }
};
