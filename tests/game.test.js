import assert from 'node:assert/strict';
import { Config } from '../js/core/Config.js';
import { GameState, GamePhases } from '../js/core/GameState.js';
import { MathUtils } from '../js/utils/MathUtils.js';

export function runGameTests() {
  assert.equal(Config.SEASON, 2);
  assert.equal(Config.TOTAL_COMBATANTS, 20);
  assert.equal(Config.BOT_COUNT, 19);

  const gs = new GameState();
  assert.equal(gs.phase, GamePhases.LOGIN);
  gs.setMode('SQUAD');
  assert.equal(gs.mode, 'SQUAD');
  gs.resetMatch();
  assert.equal(gs.phase, GamePhases.SPAWN_ISLAND);
  assert.equal(gs.aliveCount, 20);
  assert.equal(MathUtils.clamp(150, 0, 100), 100);
  console.log('PASS: game.test.js');
}
