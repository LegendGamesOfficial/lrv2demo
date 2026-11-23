import { Config } from '../../../js/core/Config.js';

/**
 * Stylized procedural 3D weapon and pickaxe builder.
 */
export const WeaponBuilder = {
  createWeapon(weaponId = 'assault_rifle', rarity = 1, assetManager) {
    const THREE = window.THREE;
    const grp = new THREE.Group();
    const accent = Config.RARITY_COLORS[rarity] || Config.RARITY_COLORS[1];
    const m = (col, opts) => assetManager.getMaterial(col, opts);

    const isPistol = weaponId.includes('pistol');
    const isSmg = weaponId.includes('smg');
    const isSniper = weaponId.includes('sniper');
    const len = isPistol ? 0.42 : isSmg ? 0.64 : isSniper ? 1.32 : 0.95;

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.17, len), m('#1e293b', { metalness: 0.45 }));
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, len * 0.65, 8), m('#475569', { metalness: 0.65 }));
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.04, len * 0.55);

    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.05, len * 0.45), m(accent, { emissive: accent }));
    strip.position.y = 0.08;
    grp.add(body, barrel, strip);

    if (isSniper) {
      const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.36, 8), m('#0f172a', { metalness: 0.7 }));
      scope.rotation.x = Math.PI / 2;
      scope.position.set(0, 0.14, 0.05);
      grp.add(scope);
    }
    return grp;
  },

  createPickaxe(item, assetManager) {
    const THREE = window.THREE;
    const grp = new THREE.Group();
    const color = (item && item.color) || '#64748b';
    const accent = (item && item.accent) || '#f59e0b';
    const style = (item && item.style) || 'classic';
    const m = (col, opts) => assetManager.getMaterial(col, opts);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 1.35, 8), m(style === 'pencil' ? '#facc15' : '#334155'));
    shaft.rotation.x = Math.PI / 2;
    shaft.position.z = 0.45;
    grp.add(shaft);

    if (style === 'sword') {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 1.25), m(color, { metalness: 0.7 }));
      blade.position.z = 0.95;
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.1), m(accent));
      guard.position.z = 0.35;
      grp.add(blade, guard);
    } else if (style === 'balloon') {
      const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), m(color));
      b1.position.set(-0.22, 0, 1.08);
      const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 10), m(accent));
      b2.position.set(0.22, 0, 1.08);
      grp.add(b1, b2);
    } else if (style === 'shovel') {
      const spade = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.42), m(accent, { metalness: 0.5 }));
      spade.position.z = 1.18;
      grp.add(spade);
    } else if (style === 'pencil') {
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 6), m('#111827'));
      tip.rotation.x = Math.PI / 2;
      tip.position.z = 1.22;
      const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 8), m(accent));
      eraser.rotation.x = Math.PI / 2;
      eraser.position.z = -0.22;
      grp.add(tip, eraser);
    } else {
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, 0.16), m(color, { metalness: 0.4 }));
      head.position.z = 1.08;
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.08), m(accent, { emissive: style === 'prism' ? accent : 0 }));
      tip.position.z = 1.14;
      grp.add(head, tip);
    }
    return grp;
  }
};
