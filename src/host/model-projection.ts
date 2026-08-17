/**
 * Host-side session projection: the dominant model of each session.
 *
 * Sessions are priced per-model by the client; without this projection the
 * client only knows the current session's model (from the history RPC) and
 * had to price every OTHER session at the default model. The projection
 * folds the session log's `request/header` events — pure, unit-tested,
 * registered with the generic SessionProjectionRegistry the harness drives.
 *
 * Wire facts (verified against the live API): `request/header` carries
 * `data.header.config.model` for the subsequent steps.
 */
import { z } from 'zod'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'

/** The last non-empty model seen in the session's request headers. */
export interface ModelState {
  model: string
}

/** A request header event — the only log record this unit reads. */
export interface RequestHeaderEvent {
  type: string
  data?: {
    header?: {
      config?: {
        model?: string
      }
    }
  }
}

/** Pure transition: keep the previous model until a header names a new one. */
export function applyModelProjection(state: ModelState, event: RequestHeaderEvent): ModelState {
  if (event?.type !== 'request/header') return state
  const model = event.data?.header?.config?.model
  if (typeof model === 'string' && model !== '' && model !== state.model) {
    return { model }
  }
  return state
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Last request-header model of the session ('' until the first request). */
    dominantModel: string
  }
}

export const modelProjectionDefinition: ProjectionDefinition<'dominantModel', ModelState> = {
  key: 'dominantModel',
  schema: z.string(),
  init: () => ({ model: '' }),
  apply: applyModelProjection,
  view: state => state.model,
  stateVersion: 1,
}
