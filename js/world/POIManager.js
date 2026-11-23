/**
 * Manages named Points of Interest (POIs) from data/map.json.
 */
export class POIManager {
  constructor(mapData) {
    this.pois = (mapData && mapData.pois) || [];
  }

  getPOIs() {
    return this.pois;
  }

  getPOIAt(x, z) {
    for (const poi of this.pois) {
      if (Math.hypot(x - poi.x, z - poi.z) <= poi.radius) {
        return poi;
      }
    }
    return null;
  }
}
