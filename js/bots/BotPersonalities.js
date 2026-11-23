/**
 * Defines 6 distinct bot AI personalities with fair reaction time and accuracy.
 */
export const BotPersonalities = {
  AGGRESSIVE: { name: 'Aggressive', aggroRange: 62, buildChance: 0.22, retreatHp: 18, accuracy: 0.26, reactionTime: 0.78 },
  DEFENSIVE: { name: 'Defensive', aggroRange: 50, buildChance: 0.55, retreatHp: 35, accuracy: 0.22, reactionTime: 0.95 },
  BUILDER: { name: 'Builder', aggroRange: 52, buildChance: 0.72, retreatHp: 32, accuracy: 0.21, reactionTime: 0.90 },
  EXPLORER: { name: 'Explorer', aggroRange: 46, buildChance: 0.18, retreatHp: 28, accuracy: 0.18, reactionTime: 1.10 },
  BALANCED: { name: 'Balanced', aggroRange: 55, buildChance: 0.38, retreatHp: 25, accuracy: 0.24, reactionTime: 0.88 },
  OPPORTUNISTIC: { name: 'Opportunistic', aggroRange: 58, buildChance: 0.30, retreatHp: 30, accuracy: 0.27, reactionTime: 0.82 }
};

export function pickRandomPersonality() {
  const keys = Object.keys(BotPersonalities);
  return BotPersonalities[keys[Math.floor(Math.random() * keys.length)]];
}
