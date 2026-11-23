import { CharacterBuilder } from '../../assets/models/characters/CharacterBuilder.js';
import { CharacterAnimator } from '../animation/CharacterAnimator.js';

/**
 * Character showcase helper reusing CharacterBuilder, CharacterAnimator, and AssetManager items.
 */
export class CharacterShowcase {
  constructor(assetManager, player) {
    this.assetManager = assetManager;
    this.player = player;
  }

  applySkin(skinId) {
    const skin = this.assetManager.getItemById(skinId);
    if (!skin || !this.player || !this.player.mesh) return;
    const parent = this.player.mesh.parent;
    if (!parent) return;

    const newMesh = CharacterBuilder.createCharacter(skin, this.assetManager);
    newMesh.position.copy(this.player.mesh.position);
    newMesh.rotation.copy(this.player.mesh.rotation);
    parent.remove(this.player.mesh);
    parent.add(newMesh);
    this.player.mesh = newMesh;
    this.player.animator = new CharacterAnimator(newMesh);
  }

  rotateCharacter(deltaYaw) {
    if (this.player) this.player.bodyYaw += deltaYaw;
  }

  playEmote(animId) {
    if (this.player && this.player.animator) {
      this.player.animator.triggerEmote(animId, 4.0);
    }
  }
}
