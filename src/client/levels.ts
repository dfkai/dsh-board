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
  { floor: 0, emoji: '🐣', zh: '词芽未醒', en: 'Unawakened Sprout' },
  { floor: 10_000, emoji: '🥉', zh: '打字机学徒', en: 'Typist Apprentice' },
  { floor: 100_000, emoji: '🥈', zh: '白银话痨', en: 'Silver Chatterbox' },
  { floor: 1_000_000, emoji: '🥇', zh: '黄金炼丹师', en: 'Gold Alchemist' },
  { floor: 10_000_000, emoji: '💎', zh: '钻石词匠', en: 'Diamond Wordsmith' },
  { floor: 100_000_000, emoji: '🚀', zh: '星际词王', en: 'Interstellar Wordlord' },
  { floor: 1_000_000_000, emoji: '👑', zh: '十亿词帝', en: 'Billion-Token Emperor' },
  { floor: 10_000_000_000, emoji: '🐲', zh: '百亿言灵龙', en: 'Hundred-Billion Wordwyrm' },
  { floor: 100_000_000_000, emoji: '🌌', zh: '千亿创世者', en: 'Trillion Genesis' },
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
