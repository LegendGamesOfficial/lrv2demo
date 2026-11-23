/**
 * Generic ObjectPool to reuse short-lived projectiles, tracers, and particles without GC spikes.
 */
export class ObjectPool {
  constructor(factoryFn, resetFn, initialSize = 0) {
    this._factory = factoryFn;
    this._reset = resetFn;
    this._pool = [];
    this._active = new Set();

    for (let i = 0; i < initialSize; i++) {
      this._pool.push(this._factory());
    }
  }

  acquire(...args) {
    const obj = this._pool.length > 0 ? this._pool.pop() : this._factory();
    this._reset(obj, ...args);
    this._active.add(obj);
    return obj;
  }

  release(obj) {
    if (!this._active.has(obj)) return;
    this._active.delete(obj);
    this._pool.push(obj);
  }

  releaseAll() {
    for (const obj of this._active) {
      this._pool.push(obj);
    }
    this._active.clear();
  }

  get activeItems() {
    return this._active;
  }

  get activeCount() {
    return this._active.size;
  }
}
