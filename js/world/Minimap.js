/**
 * Renders the top-right real-time Minimap with player direction, storm circles, POIs, and waypoint.
 */
export class Minimap {
  constructor(canvas, mapManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.mapManager = mapManager;
  }

  render(player, stormState, pois) {
    const ctx = this.ctx;
    const S = this.canvas.width;

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 0, S, S);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, S * 0.43, 0, Math.PI * 2);
    ctx.fill();

    // POIs
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '700 8px sans-serif';
    ctx.textAlign = 'center';
    for (const poi of pois) {
      const { cx, cy } = this.mapManager.worldToCanvas(poi.x, poi.z, S);
      ctx.fillText(poi.name.split(' ')[0], cx, cy);
    }

    // Current Storm
    const cur = this.mapManager.worldToCanvas(stormState.cx, stormState.cz, S);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cur.cx, cur.cy, (stormState.radius / 500) * (S * 0.45), 0, Math.PI * 2);
    ctx.stroke();

    // Next Safe Zone
    const nxt = this.mapManager.worldToCanvas(stormState.targetCx, stormState.targetCz, S);
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(nxt.cx, nxt.cy, (stormState.targetRadius / 500) * (S * 0.45), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Waypoint
    if (this.mapManager.waypoint) {
      const wp = this.mapManager.worldToCanvas(this.mapManager.waypoint.x, this.mapManager.waypoint.z, S);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(wp.cx, wp.cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player Arrow
    const p = this.mapManager.worldToCanvas(player.x, player.z, S);
    ctx.save();
    ctx.translate(p.cx, p.cy);
    ctx.rotate(-player.yaw);
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4.5, 5);
    ctx.lineTo(0, 2.5);
    ctx.lineTo(-4.5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
