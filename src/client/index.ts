/** dshboard browser half: a usage/cost entry at the sidebar foot. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { SidebarUsage } from './SidebarUsage.tsx'
import { injectRichStyles } from './style.ts'
import { en, NS, zh } from './locales.ts'

/** Services required before the entry can register. */
export const inject = ['slots', 'locale', 'connection']

/** Register the usage trigger beside Settings at the sidebar foot. */
export function apply(ctx: ClientContext): void {
  injectRichStyles()
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dshboard: dictionaries')
  ctx.effect(() => ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'dshboard-usage',
    // Beside Settings; the foot list keeps every entry visible.
    order: 30,
    locale: NS,
    inject: () => ({ api: ctx.connection.api }),
  }, SidebarUsage)), 'dshboard: sidebar usage entry')
}
