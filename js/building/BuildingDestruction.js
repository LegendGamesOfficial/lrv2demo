/**
 * Handles structural damage and cleanup when a building piece is destroyed.
 */
export class BuildingDestruction {
  applyDamage(piece, amount, scene, piecesList) {
    if (!piece || !piece.alive) return false;
    piece.hp -= amount;
    if (piece.hp <= 0) {
      piece.alive = false;
      scene.remove(piece.mesh);
      const idx = piecesList.indexOf(piece);
      if (idx !== -1) piecesList.splice(idx, 1);
      return true;
    }
    return false;
  }
}
