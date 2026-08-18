/**
 * dsh-board host half: registers one read-only session projection —
 * `dominantModel` — so the client can price every session at its own model's
 * rate instead of the default model. Everything else stays client-side.
 */
import type { Context } from '@deepseek-ai/cordis'
import { modelProjectionDefinition } from './host/model-projection.ts'
import { sessionCostProjectionDefinition } from './host/cost-projection.ts'

export const name = 'dsh-board'

export function apply(ctx: Context): void {
  ctx.inject(['sessionProjections'], (projectionCtx) => {
    projectionCtx.sessionProjections.register(modelProjectionDefinition)
    projectionCtx.sessionProjections.register(sessionCostProjectionDefinition)
  })
}
