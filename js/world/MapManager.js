import { eventBus } from '../core/EventBus.js';

/**
 * Shared map coordinate projection, waypoint state, and pan/zoom state for Full Map & Minimap.
 */
export class MapManager {
  constructor() {
    this.waypoint = null; // { x, z }
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  setWaypoint(worldX, worldZ) {
    this.waypoint = { x: worldX, z: worldZ };
    eventBus.emit('map:waypointChanged', this.waypoint);
  }

  clearWaypoint() {
    this.waypoint = null;
    eventBus.emit('map:waypointChanged', null);
  }

  worldToCanvas(wx, wz, size, zoom = 1, panX = 0, panY = 0) {
    const scale = (size * 0.45 * zoom) / 500;
    return {
      cx: size / 2 + panX + wx * scale,
      cy: size / 2 + panY + wz * scale
    };
  }

  canvasToWorld(cx, cy, size, zoom = 1, panX = 0, panY = 0) {
    const scale = (size * 0.45 * zoom) / 500;
    return {
      wx: (cx - size / 2 - panX) / scale,
      wz: (cy - size / 2 - panY) / scale
    };
  }
}
