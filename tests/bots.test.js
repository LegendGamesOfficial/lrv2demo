import assert from 'node:assert/strict';
import { BotPersonalities, pickRandomPersonality } from '../js/bots/BotPersonalities.js';
import { BotPerception } from '../js/bots/BotPerception.js';
import { HitDetection } from '../js/combat/HitDetection.js';

export function runBotTests() {
  assert.equal(Object.keys(BotPersonalities).length, 6);
  const p = pickRandomPersonality();
  assert.ok(p.aggroRange > 0 && p.accuracy > 0 && p.accuracy <= 0.30, 'Bot accuracy must be fair');

  // Verify wall blocks bot LOS & bullets
  const mockBuildingMgr = {
    getRaycastBoxesNear: () => [{ x: 0, y: 0, z: 5, halfW: 2, halfD: 0.3, height: 4, pieceRef: { id: 'wall1' } }]
  };
  const los = BotPerception.hasLineOfSight(0, 0, 0, 0, 0, 10, null, mockBuildingMgr);
  assert.equal(los, false, 'Bot must not have LOS through a solid wall');

  const shot = HitDetection.raycastShot(
    { x: 0, y: 1.5, z: 0 },
    { x: 0, y: 0, z: 1 },
    50,
    [{ alive: true, x: 0, y: 0, z: 10 }],
    mockBuildingMgr.getRaycastBoxesNear()
  );
  assert.ok(shot.hitBuild !== null && shot.hitTarget === null, 'Wall must block bullet before hitting target');

  // Verify bots detect and target other enemy bots on the ground
  const botA = { x: 0, y: 0, z: 0, dir: 0, isMate: false, alive: true, personality: { aggroRange: 55 } };
  const botB = { x: 15, y: 0, z: 0, dir: Math.PI, isMate: false, alive: true, hp: 75, dropPhase: 'GROUND' };
  const threat = BotPerception.findNearestThreat(botA, { health: { alive: false } }, [botA, botB], null, null, null);
  assert.ok(threat.target && threat.target.ref === botB, 'Bots must target and fight each other');

  console.log('PASS: bots.test.js');
}
