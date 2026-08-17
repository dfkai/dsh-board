import { describe, expect, it } from 'vitest'
import { applyModelProjection, modelProjectionDefinition } from '../../src/host/model-projection.ts'

const header = (model?: string) => ({ type: 'request/header', data: { header: { config: { model } } } })

describe('applyModelProjection', () => {
  it('starts with an empty model', () => {
    expect(modelProjectionDefinition.init()).toEqual({ model: '' })
  })

  it('keeps the previous model for unrelated events', () => {
    const state = { model: 'deepseek-v4-pro' }
    expect(applyModelProjection(state, { type: 'user/message' })).toBe(state)
    expect(applyModelProjection(state, { type: 'assistant/chunk' })).toBe(state)
  })

  it('adopts the model of a request header', () => {
    expect(applyModelProjection({ model: '' }, header('deepseek-v4-flash') as never)).toEqual({ model: 'deepseek-v4-flash' })
  })

  it('ignores empty or missing models', () => {
    const state = { model: 'deepseek-v4-pro' }
    expect(applyModelProjection(state, header('') as never)).toBe(state)
    expect(applyModelProjection(state, header(undefined) as never)).toBe(state)
  })
})
