/**
 * Renders the 3D translucent storm wall cylinder.
 */
export class StormVisuals {
  constructor(scene) {
    const THREE = window.THREE;
    const geo = new THREE.CylinderGeometry(1, 1, 260, 48, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x9333ea,
      transparent: true,
      opacity: 0.34,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.y = 110;
    scene.add(this.mesh);
  }

  update(cx, cz, radius) {
    this.mesh.position.x = cx;
    this.mesh.position.z = cz;
    this.mesh.scale.set(radius, 1, radius);
  }
}
