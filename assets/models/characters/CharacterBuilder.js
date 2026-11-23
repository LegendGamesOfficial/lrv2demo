/**
 * Stylized cartoon character rig builder (procedural fallback when GLTF assets are absent).
 * Uses rounded cylinders and spheres with slightly exaggerated hero proportions and shared geometries.
 */
export const CharacterBuilder = {
  createCharacter(skinData, assetManager) {
    const THREE = window.THREE;
    const c = (skinData && skinData.colors) || {
      shirt: '#3d5a3b', pants: '#2d3436', skin: '#e0ac69', hair: '#3b2314', accent: '#c2a878'
    };

    const root = new THREE.Group();
    const g = (k, fn) => assetManager.getGeometry(k, fn);
    const m = (col, opts) => assetManager.getMaterial(col, opts);

    // Tapered stylized torso
    const torsoGeo = g('char_torso', (T) => new T.CylinderGeometry(0.38, 0.31, 0.88, 10));
    const torso = new THREE.Mesh(torsoGeo, m(c.shirt));
    torso.position.y = 1.38;
    torso.scale.set(1.08, 1, 0.72);
    torso.castShadow = true;
    root.add(torso);

    // Belt
    const beltGeo = g('char_belt', (T) => new T.CylinderGeometry(0.33, 0.34, 0.14, 10));
    const belt = new THREE.Mesh(beltGeo, m(c.accent, { metalness: 0.3 }));
    belt.position.y = 0.98;
    belt.scale.set(1.06, 1, 0.76);
    root.add(belt);

    // Head Group
    const headGrp = new THREE.Group();
    headGrp.position.y = 2.08;
    const headGeo = g('char_head', (T) => new T.SphereGeometry(0.26, 12, 10));
    const head = new THREE.Mesh(headGeo, m(c.skin));
    head.scale.set(1, 1.06, 0.96);
    head.castShadow = true;
    headGrp.add(head);

    const eyeGeo = g('char_eye', (T) => new T.SphereGeometry(0.036, 8, 8));
    const eyeMat = c.helmet === 'skull'
      ? m(c.accent || '#a855f7', { emissive: c.accent || '#a855f7' })
      : m('#111827');
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.095, 0.03, 0.22);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.095, 0.03, 0.22);
    headGrp.add(eyeL, eyeR);

    if (c.helmet === 'knight') {
      const helm = new THREE.Mesh(g('char_helm_k', (T) => new T.CylinderGeometry(0.29, 0.3, 0.5, 10)), m('#18181b', { metalness: 0.6 }));
      const visor = new THREE.Mesh(g('char_visor_k', (T) => new T.BoxGeometry(0.32, 0.08, 0.08)), m(c.accent, { emissive: c.accent }));
      visor.position.set(0, 0.04, 0.25);
      const crest = new THREE.Mesh(g('char_crest_k', (T) => new T.BoxGeometry(0.09, 0.22, 0.36)), m(c.accent));
      crest.position.set(0, 0.32, 0);
      headGrp.add(helm, visor, crest);
    } else if (c.helmet === 'astronaut') {
      const dome = new THREE.Mesh(g('char_helm_astro', (T) => new T.SphereGeometry(0.32, 14, 12)), m(c.accent || '#f8fafc', { roughness: 0.3 }));
      const visor = new THREE.Mesh(g('char_visor_astro', (T) => new T.SphereGeometry(0.27, 12, 10, 0, Math.PI, 0.2, Math.PI * 0.6)), m('#f59e0b', { metalness: 0.85, roughness: 0.15 }));
      visor.rotation.y = -Math.PI / 2;
      visor.position.set(0, 0.02, 0.07);
      headGrp.add(dome, visor);
    } else if (c.helmet === 'skull') {
      const hood = new THREE.Mesh(g('char_hood_sk', (T) => new T.SphereGeometry(0.295, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62)), m('#18181b'));
      hood.position.set(0, 0.04, -0.03);
      const jaw = new THREE.Mesh(g('char_jaw_sk', (T) => new T.BoxGeometry(0.22, 0.09, 0.08)), m(c.accent || '#a855f7', { emissive: c.accent || '#a855f7' }));
      jaw.position.set(0, -0.11, 0.21);
      headGrp.add(hood, jaw);
    } else if (c.helmet === 'carbon') {
      const helm = new THREE.Mesh(g('char_helm_c', (T) => new T.SphereGeometry(0.29, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6)), m('#0f172a', { metalness: 0.7 }));
      helm.position.y = 0.04;
      const visor = new THREE.Mesh(g('char_visor_c', (T) => new T.BoxGeometry(0.36, 0.11, 0.08)), m(c.accent || '#38bdf8', { emissive: c.accent || '#38bdf8' }));
      visor.position.set(0, 0.04, 0.24);
      headGrp.add(helm, visor);
    } else if (c.helmet === 'alpha') {
      const helm = new THREE.Mesh(g('char_helm_a', (T) => new T.CylinderGeometry(0.29, 0.3, 0.5, 10)), m('#09090b', { metalness: 0.75 }));
      const visor = new THREE.Mesh(g('char_visor_a', (T) => new T.BoxGeometry(0.34, 0.09, 0.08)), m(c.accent || '#eab308', { emissive: c.accent || '#eab308' }));
      visor.position.set(0, 0.04, 0.25);
      const crown = new THREE.Mesh(g('char_crown_a', (T) => new T.ConeGeometry(0.18, 0.24, 5)), m(c.accent || '#eab308', { emissive: c.accent || '#eab308', metalness: 0.6 }));
      crown.position.set(0, 0.36, 0);
      headGrp.add(helm, visor, crown);
    } else if (c.helmet === 'tactical' || c.helmet === 'army' || c.helmet === 'commando') {
      const cap = new THREE.Mesh(g('char_helm_t', (T) => new T.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55)), m(c.shirt));
      cap.position.y = 0.04;
      const goggles = new THREE.Mesh(g('char_gog', (T) => new T.BoxGeometry(0.36, 0.1, 0.09)), m(c.accent, { metalness: 0.5 }));
      goggles.position.set(0, 0.06, 0.23);
      headGrp.add(cap, goggles);
    } else if (c.helmet === 'hood') {
      const hood = new THREE.Mesh(g('char_hood', (T) => new T.SphereGeometry(0.3, 12, 10)), m('#09090b'));
      hood.position.z = -0.03;
      const mask = new THREE.Mesh(g('char_mask', (T) => new T.BoxGeometry(0.34, 0.15, 0.08)), m(c.accent));
      mask.position.set(0, -0.09, 0.23);
      headGrp.add(hood, mask);
    } else if (c.hat === 'propeller') {
      const cap = new THREE.Mesh(g('char_cap_p', (T) => new T.SphereGeometry(0.27, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.52)), m(c.accent));
      cap.position.y = 0.06;
      const prop = new THREE.Mesh(g('char_prop', (T) => new T.BoxGeometry(0.44, 0.04, 0.08)), m('#ef4444'));
      prop.position.y = 0.34;
      headGrp.add(cap, prop);
    } else {
      const hair = new THREE.Mesh(g('char_hair', (T) => new T.SphereGeometry(0.275, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58)), m(c.hair));
      hair.position.set(0, 0.05, -0.02);
      headGrp.add(hair);
      if (c.visor) {
        const v = new THREE.Mesh(g('char_visor_p', (T) => new T.BoxGeometry(0.38, 0.1, 0.06)), m(c.visor, { emissive: c.visor }));
        v.position.set(0, 0.04, 0.23);
        headGrp.add(v);
      }
    }
    root.add(headGrp);

    // Arms
    const armGeo = g('char_arm', (T) => new T.CylinderGeometry(0.11, 0.09, 0.72, 8));
    const handGeo = g('char_hand', (T) => new T.SphereGeometry(0.1, 8, 8));

    const armL = new THREE.Group();
    armL.position.set(-0.48, 1.72, 0);
    const armLMesh = new THREE.Mesh(armGeo, m(c.shirt));
    armLMesh.position.y = -0.32;
    const handL = new THREE.Mesh(handGeo, m(c.skin));
    handL.position.y = -0.7;
    armL.add(armLMesh, handL);

    const armR = new THREE.Group();
    armR.position.set(0.48, 1.72, 0);
    const armRMesh = new THREE.Mesh(armGeo, m(c.shirt));
    armRMesh.position.y = -0.32;
    const handR = new THREE.Mesh(handGeo, m(c.skin));
    handR.position.y = -0.7;
    const itemMount = new THREE.Group();
    itemMount.position.set(0, -0.72, 0.14);
    armR.add(armRMesh, handR, itemMount);
    root.add(armL, armR);

    // Legs
    const legGeo = g('char_leg', (T) => new T.CylinderGeometry(0.14, 0.11, 0.78, 8));
    const bootGeo = g('char_boot', (T) => new T.BoxGeometry(0.24, 0.18, 0.34));

    const legL = new THREE.Group();
    legL.position.set(-0.18, 0.92, 0);
    const legLMesh = new THREE.Mesh(legGeo, m(c.pants));
    legLMesh.position.y = -0.38;
    const bootL = new THREE.Mesh(bootGeo, m('#111827'));
    bootL.position.set(0, -0.82, 0.04);
    legL.add(legLMesh, bootL);

    const legR = new THREE.Group();
    legR.position.set(0.18, 0.92, 0);
    const legRMesh = new THREE.Mesh(legGeo, m(c.pants));
    legRMesh.position.y = -0.38;
    const bootR = new THREE.Mesh(bootGeo, m('#111827'));
    bootR.position.set(0, -0.82, 0.04);
    legR.add(legRMesh, bootR);
    root.add(legL, legR);

    root.userData = {
      isProceduralRig: true,
      headGrp,
      armL,
      armR,
      legL,
      legR,
      itemMount,
      torso
    };
    return root;
  }
};
