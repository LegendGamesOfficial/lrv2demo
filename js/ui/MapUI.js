/**
 * Full-screen interactive Island Map (M shortcut or HUD button) with zoom, pan, POIs, storm circles, and waypoints.
 */
export class MapUI {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.overlay = document.getElementById('full-map-overlay');
    this.canvas = document.getElementById('full-map-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isOpen = false;
    this._dragging = false;
    this._dragMoved = false;
    this._lastX = 0;
    this._lastY = 0;
    this._bindControls();
  }

  _bindControls() {
    document.getElementById('btn-close-map').addEventListener('click', () => this.toggle(false));
    document.getElementById('btn-clear-waypoint').addEventListener('click', () => this.mapManager.clearWaypoint());

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.mapManager.zoom = Math.max(0.8, Math.min(3.0, this.mapManager.zoom - e.deltaY * 0.001));
    }, { passive: false });

    this.canvas.addEventListener('pointerdown', (e) => {
      this._dragging = true;
      this._dragMoved = false;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this._dragging || !this.isOpen) return;
      const dx = e.clientX - this._lastX;
      const dy = e.clientY - this._lastY;
      if (Math.hypot(dx, dy) > 3) this._dragMoved = true;
      this.mapManager.panX += dx;
      this.mapManager.panY += dy;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });

    window.addEventListener('pointerup', (e) => {
      if (!this._dragging) return;
      this._dragging = false;
      if (!this._dragMoved && this.isOpen && e.target === this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        const cx = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const cy = ((e.clientY - rect.top) / rect.height) * this.canvas.height;
        const { wx, wz } = this.mapManager.canvasToWorld(
          cx, cy, this.canvas.width, this.mapManager.zoom, this.mapManager.panX, this.mapManager.panY
        );
        this.mapManager.setWaypoint(wx, wz);
      }
    });
  }

  toggle(forceState = null) {
    this.isOpen = forceState !== null ? forceState : !this.isOpen;
    this.overlay.classList.toggle('hidden', !this.isOpen);
    if (this.isOpen && document.pointerLockElement) {
      document.exitPointerLock();
    }
    return this.isOpen;
  }

  render(player, stormState, pois) {
    if (!this.isOpen) return;
    const ctx = this.ctx;
    const S = this.canvas.width;
    const { zoom, panX, panY } = this.mapManager;

    ctx.fillStyle = '#0369a1';
    ctx.fillRect(0, 0, S, S);

    const center = this.mapManager.worldToCanvas(0, 0, S, zoom, panX, panY);
    const islandPx = (460 / 500) * (S * 0.45 * zoom);

    // Island
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(center.cx, center.cy, islandPx, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 4;
    ctx.stroke();

    // POIs
    ctx.font = '800 13px sans-serif';
    ctx.textAlign = 'center';
    for (const poi of pois) {
      const p = this.mapManager.worldToCanvas(poi.x, poi.z, S, zoom, panX, panY);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(p.cx - 54, p.cy - 10, 108, 20);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(poi.name, p.cx, p.cy + 4);
    }

    // Current Storm
    const cur = this.mapManager.worldToCanvas(stormState.cx, stormState.cz, S, zoom, panX, panY);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cur.cx, cur.cy, (stormState.radius / 500) * (S * 0.45 * zoom), 0, Math.PI * 2);
    ctx.stroke();

    // Next Safe Zone
    const nxt = this.mapManager.worldToCanvas(stormState.targetCx, stormState.targetCz, S, zoom, panX, panY);
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([7, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(nxt.cx, nxt.cy, (stormState.targetRadius / 500) * (S * 0.45 * zoom), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Waypoint
    if (this.mapManager.waypoint) {
      const wp = this.mapManager.worldToCanvas(this.mapManager.waypoint.x, this.mapManager.waypoint.z, S, zoom, panX, panY);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(wp.cx, wp.cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Player Marker
    const pl = this.mapManager.worldToCanvas(player.x, player.z, S, zoom, panX, panY);
    ctx.save();
    ctx.translate(pl.cx, pl.cy);
    ctx.rotate(-player.yaw);
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(8, 9);
    ctx.lineTo(0, 5);
    ctx.lineTo(-8, 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
