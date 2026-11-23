import { CharacterBuilder } from '../../assets/models/characters/CharacterBuilder.js';
import { WeaponBuilder } from '../../assets/models/weapons/WeaponBuilder.js';
import { EnvironmentBuilder } from '../../assets/models/environment/EnvironmentBuilder.js';
import { EmoteAnimations } from '../animation/EmoteAnimations.js';

/**
 * Reusable 3D Cosmetic Preview Renderer shared by Lobby, Locker, and Item Shop.
 * Supports drag-to-rotate, wheel-to-zoom, idle breathing, pickaxe/glider display, and emote replay.
 */
export class CosmeticPreview {
  constructor(canvas, assetManager) {
    this.canvas = canvas;
    this.assetManager = assetManager;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.stage = null;
    this.playerRig = null;
    this.gliderMesh = null;
    this.squadRigs = [];

    this.orbitYaw = 0.12;
    this.zoom = 7.0;
    this.previewMode = 'character'; // 'character' | 'pickaxe' | 'glider' | 'emote'
    this.activeEmoteAnim = null;
    this.emoteTimer = 0;
    this.offsetX = 0;
    this.isActive = true;

    this._dragging = false;
    this._lastX = 0;
    this._clock = new window.THREE.Clock();
    this._animId = null;

    this._initScene();
    this._bindControls();
  }

  _initScene() {
    const THREE = window.THREE;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x10285a, 14, 42);

    this.camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 2.2, this.zoom);
    this.camera.lookAt(0, 1.35, 0);

    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 0.95);
    const key = new THREE.DirectionalLight(0xfffbeb, 1.3);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    const rim = new THREE.DirectionalLight(0x38bdf8, 0.75);
    rim.position.set(-5, 4, -5);
    this.scene.add(hemi, key, rim);

    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(8.5, 9.5, 0.5, 36),
      this.assetManager.getMaterial('#1e3a8a', { roughness: 0.6, metalness: 0.2 })
    );
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.1, 1.28, 36),
      this.assetManager.getMaterial('#38bdf8', { emissive: '#38bdf8' })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.scene.add(ring);

    this.stage = new THREE.Group();
    this.scene.add(this.stage);

    window.addEventListener('resize', () => {
      if (!this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this._loop();
  }

  _bindControls() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this._dragging = true;
      this._lastX = e.clientX;
    });
    window.addEventListener('pointerup', () => { this._dragging = false; });
    window.addEventListener('pointermove', (e) => {
      if (!this._dragging || !this.isActive) return;
      const dx = e.clientX - this._lastX;
      this._lastX = e.clientX;
      this.orbitYaw += dx * 0.01;
    });
    this.canvas.addEventListener('wheel', (e) => {
      if (!this.isActive) return;
      this.zoom = Math.max(3.6, Math.min(10.5, this.zoom + e.deltaY * 0.004));
    }, { passive: true });
  }

  showCharacter({ skinItem, pickaxeItem = null, gliderItem = null, mode = 'character', offsetX = 0, squadSkins = [] }) {
    while (this.stage.children.length) this.stage.remove(this.stage.children[0]);
    this.squadRigs = [];
    this.playerRig = null;
    this.gliderMesh = null;
    this.previewMode = mode;
    this.offsetX = offsetX;

    if (mode === 'glider' && gliderItem) {
      this.gliderMesh = EnvironmentBuilder.createGlider(gliderItem, this.assetManager);
      this.gliderMesh.position.set(offsetX, 1.65, 0);
      this.stage.add(this.gliderMesh);
      return;
    }

    this.playerRig = CharacterBuilder.createCharacter(skinItem, this.assetManager);
    this.playerRig.position.set(offsetX, 0, 0);

    if (mode === 'pickaxe' && pickaxeItem) {
      const px = WeaponBuilder.createPickaxe(pickaxeItem, this.assetManager);
      this.playerRig.userData.itemMount.add(px);
      this.playerRig.userData.armR.rotation.x = -0.85;
    }
    this.stage.add(this.playerRig);

    const squadOffsets = [[-2.15, -0.95], [2.15, -0.95], [-3.85, -1.85]];
    squadOffsets.forEach(([x, z], idx) => {
      const pad = new THREE.Mesh(
        new THREE.RingGeometry(0.65, 0.78, 24),
        this.assetManager.getMaterial(squadSkins.length ? '#facc15' : '#475569')
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(x, 0.01, z);
      this.stage.add(pad);

      if (squadSkins[idx]) {
        const mate = CharacterBuilder.createCharacter(squadSkins[idx], this.assetManager);
        mate.position.set(x, 0, z);
        mate.rotation.y = x > 0 ? -0.25 : 0.25;
        this.stage.add(mate);
        this.squadRigs.push(mate);
      }
    });
  }

  playEmote(animId, duration = 3.6) {
    this.previewMode = 'emote';
    this.activeEmoteAnim = animId;
    this.emoteTimer = duration;
  }

  _loop() {
    this._animId = requestAnimationFrame(() => this._loop());
    if (!this.isActive) return;
    const dt = Math.min(0.05, this._clock.getDelta());
    const t = this._clock.elapsedTime;

    this.camera.position.set(0, 2.15, this.zoom);
    this.camera.lookAt(0, 1.35, 0);

    if (this.playerRig) {
      this.playerRig.rotation.y = this.orbitYaw;
      if (this.previewMode === 'emote' && this.activeEmoteAnim) {
        EmoteAnimations.apply(this.playerRig, this.activeEmoteAnim, t);
        this.emoteTimer -= dt;
        if (this.emoteTimer <= 0) {
          this.previewMode = 'character';
          this.activeEmoteAnim = null;
          EmoteAnimations.reset(this.playerRig);
        }
      } else {
        // Subtle idle breathing
        this.playerRig.userData.torso.position.y = 1.38 + Math.sin(t * 2.2) * 0.015;
      }
    }
    if (this.gliderMesh) {
      this.gliderMesh.rotation.y = this.orbitYaw + t * 0.45;
      this.gliderMesh.position.y = 1.65 + Math.sin(t * 2) * 0.08;
    }
    this.squadRigs.forEach((m, i) => {
      m.position.y = Math.sin(t * 1.5 + i) * 0.02;
    });

    this.renderer.render(this.scene, this.camera);
  }
}
