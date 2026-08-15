/**
 * Chuunibyou rank ladder over lifetime tokens (all sessions).
 * Thresholds are cumulative totals; rankFor picks the highest level whose
 * floor the total meets.
 */
export interface RankLevel {
  floor: number
  emoji: string
  zh: string
  en: string
}

export const LEVELS: readonly RankLevel[] = [
  { floor: 0, emoji: '🐣', zh: '初生码芽', en: 'Token Sprout' },
  { floor: 10_000, emoji: '🥉', zh: '青铜打字机', en: 'Bronze Typist' },
  { floor: 100_000, emoji: '🥈', zh: '白银话痨', en: 'Silver Chatter' },
  { floor: 1_000_000, emoji: '🥇', zh: '黄金炼丹师', en: 'Gold Alchemist' },
  { floor: 10_000_000, emoji: '💎', zh: '钻石词匠', en: 'Diamond Wordsmith' },
  { floor: 100_000_000, emoji: '🚀', zh: '星际词王', en: 'Interstellar Wordlord' },
  { floor: 1_000_000_000, emoji: '👑', zh: '十亿词帝', en: 'Billion-Token Emperor' },
]

/** The active level for a lifetime token total. */
export function rankFor(total: number): { level: RankLevel; next: RankLevel | null } {
  let level = LEVELS[0]
  for (const candidate of LEVELS) {
    if (total >= candidate.floor) level = candidate
  }
  const index = LEVELS.indexOf(level)
  const next = index + 1 < LEVELS.length ? LEVELS[index + 1] : null
  return { level, next }
}
