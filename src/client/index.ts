/** dsh-rich browser half: mounts the monitor strip on the input dock slot. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { RichStrip } from './RichStrip.tsx'
import { injectRichStyles } from './style.ts'

/** Services required before the strip can register. */
export const inject = ['slots']

/** Register the strip on the conversation input dock (above the composer). */
export function apply(ctx: ClientContext): void {
  injectRichStyles()
  ctx.effect(() => ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'dsh-rich-strip',
    // Below the shipped readouts; the dock is a list, so every entry coexists.
    order: 100,
  }, RichStrip)), 'dsh-rich: dock registration')
}
