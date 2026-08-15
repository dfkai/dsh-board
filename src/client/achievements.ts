/**
 * Habit stats (check-in streak, peak day, active days) and the achievement
 * collection — the retention layer of the usage console. Every rule derives
 * from the daily token map, so each badge is earned by real usage.
 */

export interface UsageStats {
  /** Consecutive active days ending today (or yesterday, if today is idle). */
  streak: number
  /** Longest consecutive run ever. */
  best: number
  /** Highest single-day token total. */
  peakDay: number
  /** Days with any token activity. */
  activeDays: number
  /** Total session count. */
  sessions: number
}

export function computeStats(
  daily: readonly { day: number; tokens: number }[],
  sessionCount: number,
): UsageStats {
  const daySet = new Set(daily.filter(item => item.tokens > 0).map(item => item.day))
  const now = new Date()
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  let streak = 0
  let cursor = todayMid
  if (!daySet.has(todayMid)) cursor -= 86_400_000
  while (daySet.has(cursor)) {
    streak += 1
    cursor -= 86_400_000
  }
  const days = [...daySet].sort((left, right) => left - right)
  let best = 0
  let run = 0
  let prev: number | null = null
  for (const day of days) {
    run = prev !== null && day - prev === 86_400_000 ? run + 1 : 1
    if (run > best) best = run
    prev = day
  }
  let peakDay = 0
  for (const item of daily) {
    if (item.tokens > peakDay) peakDay = item.tokens
  }
  return { streak, best, peakDay, activeDays: days.length, sessions: sessionCount }
}

/** Achievement rule: id + display key roots (`ach.<id>` / `ach.<id>.cond`). */
export interface Achievement {
  id: string
  emoji: string
  test: (stats: UsageStats) => boolean
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'streak3', emoji: '🔥', test: stats => stats.best >= 3 },
  { id: 'streak7', emoji: '⚡', test: stats => stats.best >= 7 },
  { id: 'streak30', emoji: '🌙', test: stats => stats.best >= 30 },
  { id: 'day10', emoji: '🌱', test: stats => stats.activeDays >= 10 },
  { id: 'day50', emoji: '🌳', test: stats => stats.activeDays >= 50 },
  { id: 'peak100k', emoji: '💥', test: stats => stats.peakDay >= 100_000 },
  { id: 'peak1m', emoji: '🌋', test: stats => stats.peakDay >= 1_000_000 },
  { id: 'session10', emoji: '🗂', test: stats => stats.sessions >= 10 },
  { id: 'session50', emoji: '📚', test: stats => stats.sessions >= 50 },
]
