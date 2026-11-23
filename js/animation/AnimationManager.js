/**
 * Updates all registered CharacterAnimator instances each frame.
 */
export class AnimationManager {
  constructor() {
    this._animators = new Set();
    this._elapsed = 0;
  }

  register(animator) {
    this._animators.add(animator);
    return animator;
  }

  unregister(animator) {
    this._animators.delete(animator);
  }

  update(dt) {
    this._elapsed += dt;
    for (const anim of this._animators) {
      anim.update(dt, this._elapsed);
    }
  }

  clear() {
    this._animators.clear();
    this._elapsed = 0;
  }
}
