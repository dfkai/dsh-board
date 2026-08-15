/** dsh-rich browser half: mounts the monitor strip on the input dock slot. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { RichStrip } from './RichStrip.tsx'
import { injectRichStyles } from './style.ts'
import { en, NS, zh } from './locales.ts'

/** Services required before the strip can register. */
export const inject = ['slots', 'locale']

/** Register the strip on the conversation input dock (above the composer). */
export function apply(ctx: ClientContext): void {
  injectRichStyles()
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-rich: dictionaries')
  ctx.effect(() => ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
    name: 'conversation.input.dock',
    id: 'dsh-rich-strip',
    // Below the shipped readouts; the dock is a list, so every entry coexists.
    order: 100,
    locale: NS,
  }, RichStrip)), 'dsh-rich: dock registration')
}
