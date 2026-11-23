/**
 * Loads JSON data files, caches shared Three.js materials/geometries,
 * and provides optional GLTF loading with procedural fallback.
 */
export class AssetManager {
  constructor() {
    this.data = {
      accounts: [],
      items: [],
      seasonShop: { season: 2, title: 'Season 2 Season Shop', skins: [] },
      lootpool: null,
      mapData: null
    };
    this._materials = new Map();
    this._geometries = new Map();
  }

  async loadAllData() {
    const [acc, items, seasonShop, loot, map] = await Promise.all([
      this._fetchJSON('accounts/accounts.json'),
      this._fetchJSON('items/all_items.json'),
      this._fetchJSON('data/season_shop.json'),
      this._fetchJSON('data/lootpool.json'),
      this._fetchJSON('data/map.json')
    ]);

    this.data.accounts = (acc && acc.accounts) || [];
    this.data.items = (items && items.items) || [];
    this.data.seasonShop = seasonShop || { season: 2, title: 'Season 2 Season Shop', skins: [] };
    this.data.lootpool = loot || { weapons: [], consumables: [], traps: [] };
    this.data.mapData = map || { islandRadius: 460, pois: [] };

    return this.data;
  }

  async _fetchJSON(path) {
    try {
      const res = await fetch(path);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn(`[AssetManager] Failed to load ${path}:`, err);
    }
    return null;
  }

  getItemById(id) {
    return this.data.items.find((item) => item.id === id)
      || (this.data.seasonShop && this.data.seasonShop.skins
        ? this.data.seasonShop.skins.find((s) => s.id === id)
        : null)
      || null;
  }

  getSeasonSkinById(id) {
    return (this.data.seasonShop && this.data.seasonShop.skins
      ? this.data.seasonShop.skins.find((s) => s.id === id)
      : null) || null;
  }

  /**
   * Returns a cached MeshStandardMaterial to maximize GPU batching.
   */
  getMaterial(color, opts = {}) {
    const THREE = window.THREE;
    const key = `${color}_${opts.roughness ?? 0.68}_${opts.metalness ?? 0.08}_${opts.emissive ?? 0}_${opts.flatShading ?? true}_${opts.transparent ?? false}_${opts.opacity ?? 1}`;
    if (!this._materials.has(key)) {
      this._materials.set(
        key,
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness: opts.roughness ?? 0.68,
          metalness: opts.metalness ?? 0.08,
          emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
          emissiveIntensity: opts.emissiveIntensity ?? 0.6,
          flatShading: opts.flatShading ?? true,
          transparent: opts.transparent ?? false,
          opacity: opts.opacity ?? 1
        })
      );
    }
    return this._materials.get(key);
  }

  getGeometry(key, factoryFn) {
    if (!this._geometries.has(key)) {
      this._geometries.set(key, factoryFn(window.THREE));
    }
    return this._geometries.get(key);
  }

  async loadGLTFOrFallback(url) {
    const THREE = window.THREE;
    if (!THREE || !THREE.GLTFLoader || !url) return null;
    return new Promise((resolve) => {
      const loader = new THREE.GLTFLoader();
      loader.load(
        url,
        (gltf) => resolve(gltf),
        undefined,
        () => resolve(null)
      );
    });
  }

  dispose() {
    for (const mat of this._materials.values()) mat.dispose();
    for (const geo of this._geometries.values()) geo.dispose();
    this._materials.clear();
    this._geometries.clear();
  }
}

export const assetManager = new AssetManager();
